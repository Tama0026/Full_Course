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
exports.QuestionBankService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuestionBankService = class QuestionBankService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyQuestionBanks(userId) {
        return this.prisma.questionBank.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { questions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getQuestionBank(id, userId) {
        const bank = await this.prisma.questionBank.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!bank || bank.userId !== userId)
            throw new common_1.NotFoundException('Question Bank not found.');
        return bank;
    }
    async createQuestionBank(userId, data) {
        return this.prisma.questionBank.create({
            data: {
                ...data,
                userId,
            },
        });
    }
    async updateQuestionBank(id, userId, data) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id } });
        if (!bank || bank.userId !== userId)
            throw new common_1.NotFoundException();
        return this.prisma.questionBank.update({
            where: { id },
            data,
        });
    }
    async deleteQuestionBank(id, userId) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id } });
        if (!bank || bank.userId !== userId)
            throw new common_1.NotFoundException();
        return this.prisma.questionBank.delete({ where: { id } });
    }
    async createBankQuestion(userId, data) {
        const bank = await this.prisma.questionBank.findUnique({
            where: { id: data.bankId },
        });
        if (!bank || bank.userId !== userId)
            throw new common_1.NotFoundException();
        return this.prisma.bankQuestion.create({
            data: {
                bankId: data.bankId,
                content: data.content,
                options: JSON.stringify(data.options),
                correctAnswer: data.correctAnswer,
                explanation: data.explanation,
                difficulty: data.difficulty,
            },
        });
    }
    async updateBankQuestion(userId, id, data) {
        const question = await this.prisma.bankQuestion.findUnique({
            where: { id },
            include: { bank: true },
        });
        if (!question || question.bank.userId !== userId)
            throw new common_1.NotFoundException();
        const updateData = { ...data };
        if (data.options)
            updateData.options = JSON.stringify(data.options);
        const updatedBq = await this.prisma.bankQuestion.update({
            where: { id },
            data: updateData,
        });
        const syncData = {};
        if (data.content !== undefined)
            syncData.prompt = data.content;
        if (data.options !== undefined)
            syncData.options = data.options;
        if (data.correctAnswer !== undefined)
            syncData.correctAnswer = data.correctAnswer;
        if (data.explanation !== undefined)
            syncData.explanation = data.explanation;
        if (data.difficulty !== undefined)
            syncData.difficulty = data.difficulty;
        if (Object.keys(syncData).length > 0) {
            await this.prisma.assessmentQuestion.updateMany({
                where: {
                    bankQuestionId: id,
                    assessment: {
                        isPublished: false,
                    },
                },
                data: syncData,
            });
        }
        return updatedBq;
    }
    async deleteBankQuestion(id, userId) {
        const question = await this.prisma.bankQuestion.findUnique({
            where: { id },
            include: { bank: true },
        });
        if (!question || question.bank.userId !== userId)
            throw new common_1.NotFoundException();
        return this.prisma.bankQuestion.delete({ where: { id } });
    }
    async bulkImportQuestions(userId, bankId, questions) {
        const bank = await this.prisma.questionBank.findUnique({
            where: { id: bankId },
        });
        if (!bank || bank.userId !== userId)
            throw new common_1.NotFoundException();
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new common_1.BadRequestException('Invalid input. Must be a non-empty array of questions.');
        }
        const payload = questions.map((q, index) => {
            if (!q.content ||
                !Array.isArray(q.options) ||
                q.options.length < 2 ||
                typeof q.correctAnswer !== 'number') {
                throw new common_1.BadRequestException(`Invalid question format at index ${index}. Must have content, at least 2 options, and correctAnswer index.`);
            }
            return {
                bankId,
                content: String(q.content).trim(),
                options: JSON.stringify(q.options.map((opt) => String(opt).trim())),
                correctAnswer: q.correctAnswer,
                difficulty: q.difficulty || 'MEDIUM',
                explanation: q.explanation || null,
            };
        });
        const result = await this.prisma.bankQuestion.createMany({
            data: payload,
            skipDuplicates: true,
        });
        return {
            success: true,
            count: result.count,
        };
    }
};
exports.QuestionBankService = QuestionBankService;
exports.QuestionBankService = QuestionBankService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionBankService);
//# sourceMappingURL=question-bank.service.js.map