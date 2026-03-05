import { PrismaService } from '../prisma/prisma.service';
export declare class QuestionBankService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyQuestionBanks(userId: string): Promise<({
        _count: {
            questions: number;
        };
    } & {
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    getQuestionBank(id: string, userId: string): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            options: string;
            content: string;
            correctAnswer: number;
            difficulty: string;
            bankId: string;
            explanation: string | null;
        }[];
    } & {
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    createQuestionBank(userId: string, data: {
        name: string;
        description?: string;
        category: string;
    }): Promise<{
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    updateQuestionBank(id: string, userId: string, data: {
        name?: string;
        description?: string;
        category?: string;
    }): Promise<{
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    deleteQuestionBank(id: string, userId: string): Promise<{
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    createBankQuestion(userId: string, data: {
        bankId: string;
        content: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
        difficulty: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        difficulty: string;
        bankId: string;
        explanation: string | null;
    }>;
    updateBankQuestion(userId: string, id: string, data: {
        content?: string;
        options?: string[];
        correctAnswer?: number;
        explanation?: string;
        difficulty?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        difficulty: string;
        bankId: string;
        explanation: string | null;
    }>;
    deleteBankQuestion(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        difficulty: string;
        bankId: string;
        explanation: string | null;
    }>;
    bulkImportQuestions(userId: string, bankId: string, questions: {
        content: string;
        options: string[];
        correctAnswer: number;
        difficulty?: string;
        explanation?: string;
    }[]): Promise<{
        success: boolean;
        count: number;
    }>;
}
