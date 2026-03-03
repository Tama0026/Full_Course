export declare class AssessmentQuestion {
    id: string;
    assessmentId: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    order: number;
}
export declare class Assessment {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    isActive: boolean;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
    questions?: AssessmentQuestion[];
}
export declare class AssessmentAttempt {
    id: string;
    userId: string;
    assessmentId: string;
    startedAt: Date;
    completedAt?: Date;
    score?: number;
    passed?: boolean;
    isInvalid: boolean;
}
