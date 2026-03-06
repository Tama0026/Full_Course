import { QuestionBankService } from './question-bank.service';
import { PaginationArgs } from '../common/dto/pagination.args';
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
    }, pagination: PaginationArgs): Promise<{
        items: ({
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
        })[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getQuestionBank(id: string, user: {
        id: string;
    }): Promise<{
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
    createQuestionBank(input: CreateQuestionBankInput, user: {
        id: string;
    }): Promise<{
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    updateQuestionBank(id: string, input: UpdateQuestionBankInput, user: {
        id: string;
    }): Promise<{
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    deleteQuestionBank(id: string, user: {
        id: string;
    }): Promise<{
        category: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    createBankQuestion(bankId: string, input: CreateBankQuestionInput, user: {
        id: string;
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
    deleteBankQuestion(id: string, user: {
        id: string;
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
    updateBankQuestion(id: string, input: UpdateBankQuestionInput, user: {
        id: string;
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
