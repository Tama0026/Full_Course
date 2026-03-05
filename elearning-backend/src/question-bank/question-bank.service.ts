import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionBankService {
    constructor(private prisma: PrismaService) { }

    async getMyQuestionBanks(userId: string) {
        return this.prisma.questionBank.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getQuestionBank(id: string, userId: string) {
        const bank = await this.prisma.questionBank.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!bank || bank.userId !== userId) throw new NotFoundException('Question Bank not found.');
        return bank;
    }

    async createQuestionBank(userId: string, data: { name: string; description?: string; category: string }) {
        return this.prisma.questionBank.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async updateQuestionBank(id: string, userId: string, data: { name?: string; description?: string; category?: string }) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id } });
        if (!bank || bank.userId !== userId) throw new NotFoundException();

        return this.prisma.questionBank.update({
            where: { id },
            data
        });
    }

    async deleteQuestionBank(id: string, userId: string) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id } });
        if (!bank || bank.userId !== userId) throw new NotFoundException();

        return this.prisma.questionBank.delete({ where: { id } });
    }

    async createBankQuestion(userId: string, data: { bankId: string; content: string; options: string[]; correctAnswer: number; explanation?: string; difficulty: string }) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id: data.bankId } });
        if (!bank || bank.userId !== userId) throw new NotFoundException();

        return this.prisma.bankQuestion.create({
            data: {
                bankId: data.bankId,
                content: data.content,
                options: JSON.stringify(data.options),
                correctAnswer: data.correctAnswer,
                explanation: data.explanation,
                difficulty: data.difficulty
            }
        });
    }

    async updateBankQuestion(userId: string, id: string, data: { content?: string; options?: string[]; correctAnswer?: number; explanation?: string; difficulty?: string }) {
        const question = await this.prisma.bankQuestion.findUnique({
            where: { id },
            include: { bank: true }
        });
        if (!question || question.bank.userId !== userId) throw new NotFoundException();

        const updateData: any = { ...data };
        if (data.options) updateData.options = JSON.stringify(data.options);

        const updatedBq = await this.prisma.bankQuestion.update({
            where: { id },
            data: updateData
        });

        // Version Control Sync: Sync changes to any AssessmentQuestion linked to this BankQuestion that is in a Draft (isPublished=false) assessment.
        const syncData: any = {};
        if (data.content !== undefined) syncData.prompt = data.content;
        if (data.options !== undefined) syncData.options = data.options;
        if (data.correctAnswer !== undefined) syncData.correctAnswer = data.correctAnswer;
        if (data.explanation !== undefined) syncData.explanation = data.explanation;
        if (data.difficulty !== undefined) syncData.difficulty = data.difficulty;

        if (Object.keys(syncData).length > 0) {
            await this.prisma.assessmentQuestion.updateMany({
                where: {
                    bankQuestionId: id,
                    assessment: {
                        isPublished: false
                    }
                },
                data: syncData
            });
        }

        return updatedBq;
    }

    async deleteBankQuestion(id: string, userId: string) {
        const question = await this.prisma.bankQuestion.findUnique({
            where: { id },
            include: { bank: true }
        });
        if (!question || question.bank.userId !== userId) throw new NotFoundException();

        return this.prisma.bankQuestion.delete({ where: { id } });
    }

    /**
     * Bulk import questions into a specific Question Bank
     */
    async bulkImportQuestions(
        userId: string,
        bankId: string,
        questions: { content: string; options: string[]; correctAnswer: number; difficulty?: string; explanation?: string }[]
    ) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id: bankId } });
        if (!bank || bank.userId !== userId) throw new NotFoundException();

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new BadRequestException('Invalid input. Must be a non-empty array of questions.');
        }

        const payload = questions.map((q, index) => {
            if (!q.content || !Array.isArray(q.options) || q.options.length < 2 || typeof q.correctAnswer !== 'number') {
                throw new BadRequestException(`Invalid question format at index ${index}. Must have content, at least 2 options, and correctAnswer index.`);
            }

            return {
                bankId,
                content: String(q.content).trim(),
                options: JSON.stringify(q.options.map(opt => String(opt).trim())),
                correctAnswer: q.correctAnswer,
                difficulty: q.difficulty || 'MEDIUM',
                explanation: q.explanation || null
            };
        });

        // Use highly efficient createMany
        const result = await this.prisma.bankQuestion.createMany({
            data: payload,
            skipDuplicates: true // optional based on requirement
        });

        return {
            success: true,
            count: result.count
        };
    }
}
