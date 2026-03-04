export declare class ShuffledQuestion {
    id: string;
    prompt: string;
    options: string[];
}
export declare class AssessmentQuestion {
    id: string;
    assessmentId: string;
    setCode: string;
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
    numberOfSets: number;
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
    setCode: string;
    startedAt: Date;
    completedAt?: Date;
    score?: number;
    passed?: boolean;
    isInvalid: boolean;
    questions?: ShuffledQuestion[];
}
