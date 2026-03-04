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
let AssessmentsService = class AssessmentsService {
    prisma;
    attemptCache = new Map();
    constructor(prisma) {
        this.prisma = prisma;
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
        return this.prisma.assessmentQuestion.create({
            data: {
                assessmentId,
                setCode: data.setCode,
                content: data.prompt,
                options: JSON.stringify(data.options),
                correctAnswer: parseInt(data.correctAnswer) || 0,
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
        return this.prisma.assessmentQuestion.delete({ where: { id } });
    }
    async startAttempt(assessmentId, userId) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId, isActive: true },
            include: { questions: true },
        });
        if (!assessment)
            throw new common_1.NotFoundException('Assessment not found or inactive');
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
        return this.prisma.assessmentAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: now,
                score,
                passed,
                isInvalid,
            },
        });
    }
};
exports.AssessmentsService = AssessmentsService;
exports.AssessmentsService = AssessmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssessmentsService);
//# sourceMappingURL=assessments.service.js.map