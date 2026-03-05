"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const remediation_service_1 = require("../remediation/remediation.service");
const ai_service_1 = require("../ai/ai.service");
let AssessmentsService = class AssessmentsService {
    prisma;
    remediationService;
    aiService;
    attemptCache = new Map();
    constructor(prisma, remediationService, aiService) {
        this.prisma = prisma;
        this.remediationService = remediationService;
        this.aiService = aiService;
    }
    async getAssessments(userRole, userId) {
        if (userRole === 'INSTRUCTOR' || userRole === 'ADMIN') {
            return this.prisma.assessment.findMany({
                where: userRole === 'INSTRUCTOR' ? { creatorId: userId } : {},
                include: {
                    questions: { orderBy: { createdAt: 'asc' } },
                    attempts: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.assessment.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAssessment(id) {
        return this.prisma.assessment.findUnique({
            where: { id },
            include: { questions: { orderBy: { createdAt: 'asc' } } },
        });
    }
    async createAssessment(userId, data) {
        return this.prisma.assessment.create({
            data: {
                ...data,
                creatorId: userId,
            },
        });
    }
    async updateAssessment(id, creatorId, data) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        return this.prisma.assessment.update({
            where: { id },
            data,
        });
    }
    async deleteAssessment(id, creatorId) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        return this.prisma.assessment.delete({ where: { id } });
    }
    async createQuestion(assessmentId, creatorId, data) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        if (assessment.isPublished)
            throw new common_1.ForbiddenException('Bài thi đã được công bố. Không thể thêm câu hỏi.');
        return this.prisma.assessmentQuestion.create({
            data: {
                assessmentId,
                setCode: data.setCode,
                content: data.prompt,
                options: JSON.stringify(data.options),
                correctAnswer: parseInt(data.correctAnswer) || 0,
                points: data.points || 1,
                difficulty: data.difficulty || 'MEDIUM',
            },
        });
    }
    async deleteQuestion(id, creatorId) {
        const question = await this.prisma.assessmentQuestion.findUnique({
            where: { id },
            include: { assessment: true },
        });
        if (!question || question.assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        if (question.assessment.isPublished)
            throw new common_1.ForbiddenException('Bài thi đã được công bố. Không thể xoá câu hỏi.');
        return this.prisma.assessmentQuestion.delete({ where: { id } });
    }
    async startAttempt(assessmentId, userId) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId, isActive: true },
            include: { questions: true },
        });
        if (!assessment)
            throw new common_1.NotFoundException('Assessment not found or inactive');
        const existingAttempts = await this.prisma.assessmentAttempt.count({
            where: { assessmentId, userId },
        });
        if (existingAttempts >= assessment.maxAttempts) {
            throw new common_1.ForbiddenException(`Bạn đã sử dụng hết ${assessment.maxAttempts} lượt thi cho bài này.`);
        }
        const setCodes = [...new Set(assessment.questions.map((q) => q.setCode))];
        const pickedSetCode = setCodes.length > 0
            ? setCodes[Math.floor(Math.random() * setCodes.length)]
            : 'SET_1';
        const setQuestions = assessment.questions.filter((q) => q.setCode === pickedSetCode);
        const shuffledQuestions = [...setQuestions].sort(() => Math.random() - 0.5);
        const correctMap = {};
        const clientQuestions = shuffledQuestions.map((q) => {
            const options = JSON.parse(q.options || '[]');
            const correctText = options[q.correctAnswer];
            correctMap[q.id] = correctText;
            const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
            return {
                id: q.id,
                prompt: q.content,
                options: shuffledOptions,
            };
        });
        const attempt = await this.prisma.assessmentAttempt.create({
            data: {
                userId,
                assessmentId,
                setCode: pickedSetCode,
            },
        });
        this.attemptCache.set(attempt.id, {
            questions: clientQuestions,
            correctMap,
        });
        return {
            ...attempt,
            questions: clientQuestions,
        };
    }
    async submitAttempt(attemptId, userId, answers) {
        const attempt = await this.prisma.assessmentAttempt.findUnique({
            where: { id: attemptId },
            include: { assessment: { include: { questions: true } } },
        });
        if (!attempt || attempt.userId !== userId)
            throw new common_1.NotFoundException();
        if (attempt.completedAt)
            throw new common_1.BadRequestException('Attempt already submitted');
        const now = new Date();
        const durationSec = (now.getTime() - attempt.startedAt.getTime()) / 1000;
        const isInvalid = durationSec > attempt.assessment.timeLimit * 60 + 30;
        let score = 0;
        if (!isInvalid) {
            const cached = this.attemptCache.get(attemptId);
            if (cached) {
                let correctCount = 0;
                for (const ans of answers) {
                    if (cached.correctMap[ans.questionId] === ans.answer) {
                        correctCount++;
                    }
                }
                score =
                    cached.questions.length > 0
                        ? (correctCount / cached.questions.length) * 100
                        : 0;
            }
            else {
                const questions = attempt.assessment.questions.filter((q) => q.setCode === attempt.setCode);
                let correctCount = 0;
                for (const ans of answers) {
                    const q = questions.find((q) => q.id === ans.questionId);
                    if (q) {
                        const opts = JSON.parse(q.options || '[]');
                        if (opts[q.correctAnswer] === ans.answer) {
                            correctCount++;
                        }
                    }
                }
                score =
                    questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
            }
        }
        if (this.attemptCache.has(attemptId)) {
            this.attemptCache.delete(attemptId);
        }
        const passed = !isInvalid && score >= attempt.assessment.passingScore;
        const updatedAttempt = await this.prisma.assessmentAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: now,
                score,
                passed,
                isInvalid,
                status: 'COMPLETED',
                answers: JSON.stringify(answers),
            },
        });
        this.remediationService
            .analyzeAttempt(attemptId, userId)
            .catch((err) => console.error('[AssessmentsService] Remediation analysis failed:', err?.message));
        return updatedAttempt;
    }
    async getAttemptForSocket(attemptId, userId) {
        return this.prisma.assessmentAttempt.findFirst({
            where: {
                id: attemptId,
                userId,
                status: 'IN_PROGRESS',
            },
            include: {
                assessment: { select: { maxViolations: true } },
            },
        });
    }
    async logViolation(attemptId, type) {
        const attempt = await this.prisma.assessmentAttempt.update({
            where: { id: attemptId },
            data: {
                violationCount: { increment: 1 },
            },
            include: {
                assessment: { select: { maxViolations: true } },
            },
        });
        await this.prisma.violationRecord.create({
            data: { attemptId, type },
        });
        const maxV = attempt.assessment.maxViolations;
        const voided = attempt.violationCount >= maxV;
        if (voided) {
            await this.prisma.assessmentAttempt.update({
                where: { id: attemptId },
                data: {
                    status: 'VOIDED',
                    isInvalid: true,
                    completedAt: new Date(),
                },
            });
        }
        return {
            violationCount: attempt.violationCount,
            maxViolations: maxV,
            remaining: Math.max(0, maxV - attempt.violationCount),
            voided,
        };
    }
    async getAttemptHistory(assessmentId, userId) {
        return this.prisma.assessmentAttempt.findMany({
            where: { assessmentId, userId },
            orderBy: { startedAt: 'desc' },
            include: {
                assessment: {
                    select: { title: true, passingScore: true, maxAttempts: true },
                },
            },
        });
    }
    async getAssessmentReport(assessmentId, creatorId) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        const attempts = await this.prisma.assessmentAttempt.findMany({
            where: { assessmentId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                violations: { orderBy: { timestamp: 'asc' } },
            },
            orderBy: { startedAt: 'desc' },
        });
        const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');
        const scores = completedAttempts.map((a) => a.score || 0);
        const avgScore = scores.length > 0
            ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
            : 0;
        const passRate = completedAttempts.length > 0
            ? Math.round((completedAttempts.filter((a) => a.passed).length /
                completedAttempts.length) *
                100)
            : 0;
        const voidedCount = attempts.filter((a) => a.status === 'VOIDED').length;
        return {
            assessment,
            totalAttempts: attempts.length,
            avgScore,
            passRate,
            voidedCount,
            attempts: attempts.map((a) => ({
                id: a.id,
                userId: a.userId,
                userName: a.user?.name || a.user?.email?.split('@')[0] || 'N/A',
                userEmail: a.user?.email || '',
                setCode: a.setCode,
                startedAt: a.startedAt,
                completedAt: a.completedAt,
                score: a.score,
                passed: a.passed,
                isInvalid: a.isInvalid,
                violationCount: a.violationCount,
                status: a.status,
                violations: a.violations || [],
            })),
        };
    }
    normalizePoints(questions, totalPoints) {
        const WEIGHT = { EASY: 1, MEDIUM: 2, HARD: 3 };
        const weightedSum = questions.reduce((sum, q) => sum + (WEIGHT[q.difficulty] || 2), 0);
        if (weightedSum === 0)
            return questions.map((q) => ({ id: q.id, points: 0 }));
        const basePoint = totalPoints / weightedSum;
        const result = questions.map((q) => ({
            id: q.id,
            points: parseFloat((basePoint * (WEIGHT[q.difficulty] || 2)).toFixed(2)),
        }));
        const currentSum = result.reduce((s, r) => s + r.points, 0);
        const diff = parseFloat((totalPoints - currentSum).toFixed(2));
        if (diff !== 0) {
            let hardestIdx = 0;
            let maxWeight = 0;
            questions.forEach((q, i) => {
                const w = WEIGHT[q.difficulty] || 2;
                if (w > maxWeight) {
                    maxWeight = w;
                    hardestIdx = i;
                }
            });
            result[hardestIdx].points = parseFloat((result[hardestIdx].points + diff).toFixed(2));
        }
        return result;
    }
    async autoBalancePoints(assessmentId, creatorId) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { questions: true },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        if (assessment.isPublished)
            throw new common_1.ForbiddenException('Bài thi đã công bố.');
        if (assessment.questions.length === 0)
            throw new common_1.BadRequestException('Chưa có câu hỏi nào.');
        const questionsBySet = assessment.questions.reduce((acc, q) => {
            if (!acc[q.setCode])
                acc[q.setCode] = [];
            acc[q.setCode].push(q);
            return acc;
        }, {});
        const updates = [];
        for (const setCode of Object.keys(questionsBySet)) {
            const setQuestions = questionsBySet[setCode];
            const normalized = this.normalizePoints(setQuestions.map((q) => ({ id: q.id, difficulty: q.difficulty })), assessment.totalPoints);
            for (const n of normalized) {
                updates.push(this.prisma.assessmentQuestion.update({
                    where: { id: n.id },
                    data: { points: n.points },
                }));
            }
        }
        await this.prisma.$transaction(updates);
        return this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { questions: { orderBy: { createdAt: 'asc' } } },
        });
    }
    async publishAssessment(assessmentId, creatorId) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { questions: true },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        if (assessment.isPublished)
            throw new common_1.BadRequestException('Bài thi đã được công bố.');
        if (assessment.questions.length === 0)
            throw new common_1.BadRequestException('Cần ít nhất 1 câu hỏi.');
        const questionsBySet = assessment.questions.reduce((acc, q) => {
            if (!acc[q.setCode])
                acc[q.setCode] = [];
            acc[q.setCode].push(q);
            return acc;
        }, {});
        for (const [setCode, setQuestions] of Object.entries(questionsBySet)) {
            const pointsSum = setQuestions.reduce((s, q) => s + q.points, 0);
            const diff = Math.abs(pointsSum - assessment.totalPoints);
            if (diff > 0.01) {
                throw new common_1.BadRequestException(`Tổng điểm của Mã đề ${setCode} (${pointsSum}) không khớp totalPoints (${assessment.totalPoints}). Vui lòng chạy Auto-balance trước.`);
            }
        }
        return this.prisma.assessment.update({
            where: { id: assessmentId },
            data: { isPublished: true },
            include: { questions: { orderBy: { createdAt: 'asc' } } },
        });
    }
    async unpublishAssessment(assessmentId, creatorId) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        return this.prisma.assessment.update({
            where: { id: assessmentId },
            data: { isPublished: false },
        });
    }
    async updateQuestionInline(questionId, creatorId, data) {
        const question = await this.prisma.assessmentQuestion.findUnique({
            where: { id: questionId },
            include: { assessment: true },
        });
        if (!question || question.assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        if (question.assessment.isPublished)
            throw new common_1.ForbiddenException('Bài thi đã công bố. Không thể chỉnh sửa.');
        return this.prisma.assessmentQuestion.update({
            where: { id: questionId },
            data: {
                ...(data.points !== undefined && { points: data.points }),
                ...(data.correctAnswer !== undefined && {
                    correctAnswer: data.correctAnswer,
                }),
                ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
            },
        });
    }
    async generateAiExamQuestions(assessmentId, creatorId, bankId, questionCount, setCode = 'SET_1') {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new common_1.NotFoundException();
        if (assessment.isPublished)
            throw new common_1.ForbiddenException('Bài thi đã công bố.');
        let bankContext = '';
        if (bankId) {
            const bank = await this.prisma.questionBank.findUnique({
                where: { id: bankId },
                include: { questions: true },
            });
            if (bank && bank.questions.length > 0) {
                bankContext = bank.questions
                    .slice(0, 30)
                    .map((q, i) => `${i + 1}. [${q.difficulty}] ${q.content} | Options: ${q.options} | Answer: ${q.correctAnswer}`)
                    .join('\n');
            }
        }
        const aiQuestions = await this.aiService.generateExamFromBank(assessment.title, assessment.description, bankContext, questionCount, assessment.totalPoints);
        const normalized = this.normalizePoints(aiQuestions.map((q, i) => ({
            id: `temp-${i}`,
            difficulty: q.difficulty || 'MEDIUM',
        })), assessment.totalPoints);
        const created = [];
        for (let i = 0; i < aiQuestions.length; i++) {
            const q = aiQuestions[i];
            const record = await this.prisma.assessmentQuestion.create({
                data: {
                    assessmentId,
                    setCode,
                    content: q.content,
                    options: JSON.stringify(q.options),
                    correctAnswer: q.correctAnswer,
                    points: normalized[i].points,
                    difficulty: q.difficulty || 'MEDIUM',
                    isAiGenerated: true,
                },
            });
            created.push(record);
        }
        return this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { questions: { orderBy: { createdAt: 'asc' } } },
        });
    }
};
exports.AssessmentsService = AssessmentsService;
exports.AssessmentsService = AssessmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        remediation_service_1.RemediationService,
        ai_service_1.AiService])
], AssessmentsService);
//# sourceMappingURL=assessments.service.js.map