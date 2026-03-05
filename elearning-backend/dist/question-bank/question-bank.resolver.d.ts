import { QuestionBankService } from './question-bank.service';
export declare class CreateQuestionBankInput {
    name: string;
    description?: string;
    category: string;
}
export declare class UpdateQuestionBankInput {
    name?: string;
    description?: string;
    category?: string;
}
export declare class CreateBankQuestionInput {
    content: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    difficulty: string;
}
export declare class UpdateBankQuestionInput {
    content?: string;
    options?: string[];
    correctAnswer?: number;
    explanation?: string;
    difficulty?: string;
}
export declare class BulkImportQuestionInput {
    content: string;
    options: string[];
    correctAnswer: number;
    difficulty?: string;
    explanation?: string;
}
export declare class BulkImportResult {
    success: boolean;
    count: number;
}
export declare class QuestionBankResolver {
    private readonly questionBankService;
    constructor(questionBankService: QuestionBankService);
    getMyQuestionBanks(user: {
        id: string;
    }): Promise<({
        _count: {
            questions: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        category: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getQuestionBank(id: string, user: {
        id: string;
    }): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            bankId: string;
            content: string;
            options: string;
            correctAnswer: number;
            explanation: string | null;
            difficulty: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        category: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createQuestionBank(input: CreateQuestionBankInput, user: {
        id: string;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateQuestionBank(id: string, input: UpdateQuestionBankInput, user: {
        id: string;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteQuestionBank(id: string, user: {
        id: string;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createBankQuestion(bankId: string, input: CreateBankQuestionInput, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        bankId: string;
        content: string;
        options: string;
        correctAnswer: number;
        explanation: string | null;
        difficulty: string;
    }>;
    deleteBankQuestion(id: string, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        bankId: string;
        content: string;
        options: string;
        correctAnswer: number;
        explanation: string | null;
        difficulty: string;
    }>;
    updateBankQuestion(id: string, input: UpdateBankQuestionInput, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        bankId: string;
        content: string;
        options: string;
        correctAnswer: number;
        explanation: string | null;
        difficulty: string;
    }>;
    bulkImportQuestions(bankId: string, questions: BulkImportQuestionInput[], user: {
        id: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
export declare class QuestionBankFieldResolver {
    questionCount(bank: any): any;
}
export declare class BankQuestionResolver {
    options(question: {
        options: any;
    }): any;
}
