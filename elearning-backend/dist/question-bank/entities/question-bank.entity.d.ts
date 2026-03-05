export declare class QuestionBank {
    id: string;
    name: string;
    description?: string;
    category: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    questions?: BankQuestion[];
}
export declare class BankQuestion {
    id: string;
    bankId: string;
    content: string;
    options: string;
    correctAnswer: number;
    explanation?: string;
    difficulty: string;
    createdAt: Date;
}
