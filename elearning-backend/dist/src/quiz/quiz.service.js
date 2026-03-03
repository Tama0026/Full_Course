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
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const gamification_service_1 = require("../gamification/gamification.service");
let QuizService = class QuizService {
    prisma;
    aiService;
    gamificationService;
    constructor(prisma, aiService, gamificationService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.gamificationService = gamificationService;
    }
    async generateQuizWithAI(lessonId, count = 5) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID ${lessonId} not found`);
        }
        if (!lesson.body || lesson.body.trim().length === 0) {
            throw new common_1.BadRequestException('Lesson has no content to generate a quiz from');
        }
        const aiQuestions = await this.aiService.generateQuiz(lesson.body, count);
        if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
            throw new common_1.InternalServerErrorException('AI failed to generate a valid question list');
        }
        const existingQuiz = await this.prisma.quiz.findUnique({
            where: { lessonId },
        });
        if (existingQuiz) {
            await this.prisma.quiz.delete({
                where: { id: existingQuiz.id },
            });
        }
        return this.prisma.quiz.create({
            data: {
                lessonId,
                questions: {
                    create: aiQuestions.map((q) => ({
                        content: q.content,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: { questions: true },
        });
    }
    async updateQuiz(input) {
        const { lessonId, questions } = input;
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID ${lessonId} not found`);
        }
        const existingQuiz = await this.prisma.quiz.findUnique({
            where: { lessonId },
        });
        if (existingQuiz) {
            await this.prisma.quiz.delete({
                where: { id: existingQuiz.id },
            });
        }
        return this.prisma.quiz.create({
            data: {
                lessonId,
                questions: {
                    create: questions.map((q) => ({
                        content: q.content,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: { questions: true },
        });
    }
    async getQuizByLesson(lessonId) {
        return this.prisma.quiz.findUnique({
            where: { lessonId },
            include: { questions: true },
        });
    }
    async submitQuiz(userId, lessonId, answers) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { lessonId },
            include: { questions: true },
        });
        if (!quiz || quiz.questions.length === 0) {
            throw new common_1.NotFoundException('Quiz not found for this lesson');
        }
        const totalQuestions = quiz.questions.length;
        let score = 0;
        for (const answer of answers) {
            const question = quiz.questions.find((q) => q.id === answer.questionId);
            if (question && question.correctAnswer === answer.selectedOption) {
                score++;
            }
        }
        const isPassed = (score / totalQuestions) >= 0.8;
        if (isPassed) {
            await this.gamificationService.addPoints(userId, score * 10);
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: lessonId },
                include: { section: { select: { courseId: true } } },
            });
            if (lesson && lesson.section) {
                const enrollment = await this.prisma.enrollment.findUnique({
                    where: {
                        userId_courseId: {
                            userId,
                            courseId: lesson.section.courseId,
                        }
                    }
                });
                if (enrollment) {
                    let completedLessons = [];
                    try {
                        completedLessons = JSON.parse(enrollment.completedLessons);
                    }
                    catch (e) { }
                    if (!completedLessons.includes(lessonId)) {
                        completedLessons.push(lessonId);
                        const totalCourseLessons = await this.prisma.lesson.count({
                            where: { section: { courseId: lesson.section.courseId } }
                        });
                        const isFinished = completedLessons.length >= totalCourseLessons;
                        await this.prisma.enrollment.update({
                            where: { id: enrollment.id },
                            data: {
                                completedLessons: JSON.stringify(completedLessons),
                                isFinished,
                            },
                        });
                    }
                }
            }
        }
        return {
            success: isPassed,
            score,
            totalQuestions,
            message: isPassed ? 'Chúc mừng bạn đã vượt qua bài kiểm tra!' : 'Bạn chưa đạt đủ 80% điểm. Đừng bỏ cuộc, hãy thử lại!',
        };
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService,
        gamification_service_1.GamificationService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map