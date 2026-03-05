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
exports.RemediationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let RemediationService = class RemediationService {
    prisma;
    aiService;
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async analyzeAttempt(attemptId, userId) {
        const attempt = await this.prisma.assessmentAttempt.findUnique({
            where: { id: attemptId },
            include: {
                assessment: {
                    include: { questions: true },
                },
            },
        });
        if (!attempt || attempt.userId !== userId)
            return;
        if (!attempt.answers)
            return;
        const parsedAnswers = JSON.parse(attempt.answers);
        const wrongAnswers = this.buildWrongAnswerData(attempt.assessment.questions.filter((q) => q.setCode === attempt.setCode), parsedAnswers);
        if (wrongAnswers.length === 0)
            return;
        const totalQuestions = attempt.assessment.questions.filter((q) => q.setCode === attempt.setCode).length;
        const scorePercent = attempt.score ?? 0;
        const aiAnalysis = await this.callAiGapAnalysis(wrongAnswers, attempt.assessment.title);
        const wrongPercent = (wrongAnswers.length / totalQuestions) * 100;
        const hasKnowledgeGap = aiAnalysis.items.some((i) => i.errorType === 'KNOWLEDGE_GAP');
        let severity = 'LOW';
        if (wrongPercent >= 75 && hasKnowledgeGap) {
            severity = 'CRITICAL';
        }
        else if (wrongPercent >= 50) {
            severity = 'MEDIUM';
        }
        const reviewLessons = await this.buildReviewPath(aiAnalysis);
        const report = await this.prisma.remediationReport.create({
            data: {
                attemptId,
                userId,
                assessmentId: attempt.assessmentId,
                scorePercent,
                totalQuestions,
                wrongCount: wrongAnswers.length,
                aiAnalysis: JSON.stringify(aiAnalysis),
                severity,
                pathItems: {
                    create: reviewLessons.map((item, idx) => ({
                        lessonId: item.lessonId,
                        lessonTitle: item.lessonTitle,
                        reason: item.reason,
                        priority: reviewLessons.length - idx,
                    })),
                },
            },
        });
        if (scorePercent < 50 && severity === 'CRITICAL') {
            await this.applyAdaptiveFlow(userId);
        }
        console.log(`[RemediationService] Report ${report.id} created — severity: ${severity}, path items: ${reviewLessons.length}`);
    }
    buildWrongAnswerData(questions, answers) {
        const wrongAnswers = [];
        for (const ans of answers) {
            const question = questions.find((q) => q.id === ans.questionId);
            if (!question)
                continue;
            const options = JSON.parse(question.options || '[]');
            const correctText = options[question.correctAnswer] || '';
            if (ans.answer !== correctText) {
                wrongAnswers.push({
                    questionId: question.id,
                    questionContent: question.content,
                    options,
                    correctAnswerText: correctText,
                    studentAnswerText: ans.answer,
                });
            }
        }
        return wrongAnswers;
    }
    async callAiGapAnalysis(wrongAnswers, assessmentTitle) {
        const allLessons = await this.prisma.lesson.findMany({
            select: { id: true, title: true },
            orderBy: { order: 'asc' },
        });
        const lessonsListText = allLessons
            .map((l) => `- ID: ${l.id} | Title: ${l.title}`)
            .join('\n');
        const wrongAnswersText = wrongAnswers
            .map((wa, i) => `${i + 1}. Câu hỏi: "${wa.questionContent}"\n` +
            `   Các lựa chọn: ${wa.options.join(', ')}\n` +
            `   Đáp án đúng: "${wa.correctAnswerText}"\n` +
            `   Đáp án học viên chọn: "${wa.studentAnswerText}"`)
            .join('\n\n');
        const prompt = `
Bạn là chuyên gia phân tích lỗ hổng kiến thức trong giáo dục.

Bài thi: "${assessmentTitle}"

Danh sách các câu trả lời SAI của học viên:
${wrongAnswersText}

Danh sách tất cả bài học có sẵn trong hệ thống:
${lessonsListText}

Nhiệm vụ:
1. Phân tích LÝ DO SAI cho từng câu hỏi. Phân loại thành:
   - MISCONCEPTION: Hiểu nhầm khái niệm
   - CALCULATION_ERROR: Sai do tính toán hoặc bất cẩn
   - KNOWLEDGE_GAP: Thiếu kiến thức nền tảng
2. Đề xuất các bài học (chọn từ danh sách lesson ID ở trên) mà học viên cần ôn lại.

Trả về DUY NHẤT một JSON object hợp lệ (không markdown, không giải thích thêm) với cấu trúc:
{
  "items": [
    {
      "questionId": "<ID câu hỏi>",
      "errorType": "MISCONCEPTION | CALCULATION_ERROR | KNOWLEDGE_GAP",
      "explanation": "<Giải thích lý do sai bằng tiếng Việt>",
      "relatedTopics": ["<Chủ đề liên quan>"]
    }
  ],
  "overallSummary": "<Tóm tắt tổng quan lỗ hổng kiến thức bằng tiếng Việt>",
  "recommendedLessonIds": ["<lessonId1>", "<lessonId2>"]
}

Lưu ý:
- "recommendedLessonIds" PHẢI chọn từ danh sách lesson ID ở trên.
- Nếu không tìm thấy bài học phù hợp, để mảng rỗng.
- Chỉ trả về JSON, không giải thích gì thêm.
`;
        try {
            const text = await this.aiService.generateWithFallback(prompt);
            const cleaned = text
                .replace(/```json\n?/gi, '')
                .replace(/```\n?/g, '')
                .trim();
            const result = JSON.parse(cleaned);
            if (!Array.isArray(result.items))
                result.items = [];
            if (!Array.isArray(result.recommendedLessonIds))
                result.recommendedLessonIds = [];
            if (!result.overallSummary)
                result.overallSummary = '';
            return result;
        }
        catch (error) {
            console.error(`[RemediationService] AI gap analysis failed:`, error?.message?.slice(0, 200));
            return {
                items: wrongAnswers.map((wa) => ({
                    questionId: wa.questionId,
                    errorType: 'KNOWLEDGE_GAP',
                    explanation: `Học viên chọn "${wa.studentAnswerText}" thay vì "${wa.correctAnswerText}"`,
                    relatedTopics: [],
                })),
                overallSummary: 'Không thể phân tích chi tiết bằng AI. Hãy ôn lại các bài học liên quan.',
                recommendedLessonIds: [],
            };
        }
    }
    async buildReviewPath(aiAnalysis) {
        if (aiAnalysis.recommendedLessonIds.length === 0)
            return [];
        const lessons = await this.prisma.lesson.findMany({
            where: { id: { in: aiAnalysis.recommendedLessonIds } },
            select: { id: true, title: true },
        });
        const lessonMap = new Map(lessons.map((l) => [l.id, l.title]));
        return lessons.map((lesson) => {
            const relatedItems = aiAnalysis.items.filter((item) => item.relatedTopics.some((topic) => lesson.title.toLowerCase().includes(topic.toLowerCase())));
            const reason = relatedItems.length > 0
                ? relatedItems.map((i) => i.explanation).join('; ')
                : `AI đề xuất ôn lại bài "${lesson.title}" để củng cố kiến thức.`;
            return {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                reason,
            };
        });
    }
    async applyAdaptiveFlow(userId) {
        await this.prisma.enrollment.updateMany({
            where: {
                userId,
                isFinished: false,
                status: 'APPROVED',
                isLocked: false,
            },
            data: { isLocked: true },
        });
        console.log(`[RemediationService] Locked enrollments for user ${userId} due to critical gap`);
    }
    async getMyRemediations(userId) {
        return this.prisma.remediationReport.findMany({
            where: { userId },
            include: { pathItems: { orderBy: { priority: 'desc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async completeReviewItem(itemId, userId) {
        const item = await this.prisma.reviewPathItem.findUnique({
            where: { id: itemId },
            include: { report: true },
        });
        if (!item || item.report.userId !== userId) {
            throw new common_1.NotFoundException('Review item not found');
        }
        if (item.isCompleted)
            return item;
        const updated = await this.prisma.reviewPathItem.update({
            where: { id: itemId },
            data: { isCompleted: true, completedAt: new Date() },
        });
        const remaining = await this.prisma.reviewPathItem.count({
            where: { reportId: item.reportId, isCompleted: false },
        });
        if (remaining === 0) {
            await this.prisma.remediationReport.update({
                where: { id: item.reportId },
                data: { isResolved: true },
            });
            const unresolvedCount = await this.prisma.remediationReport.count({
                where: { userId, isResolved: false },
            });
            if (unresolvedCount === 0) {
                await this.prisma.enrollment.updateMany({
                    where: { userId, isLocked: true },
                    data: { isLocked: false },
                });
                console.log(`[RemediationService] All reports resolved — unlocked enrollments for user ${userId}`);
            }
        }
        return updated;
    }
};
exports.RemediationService = RemediationService;
exports.RemediationService = RemediationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], RemediationService);
//# sourceMappingURL=remediation.service.js.map