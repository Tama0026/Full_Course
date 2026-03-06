import { AssessmentType } from '@prisma/client';
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
    points: number;
    difficulty: string;
    isAiGenerated: boolean;
    order: number;
}
export declare class Assessment {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    numberOfSets: number;
    maxAttempts: number;
    maxViolations: number;
    totalPoints: number;
    isPublished: boolean;
    isActive: boolean;
    type: AssessmentType;
    enrollCode?: string;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
    questions?: AssessmentQuestion[];
}
export declare class ViolationRecord {
    id: string;
    attemptId: string;
    type: string;
    timestamp: Date;
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
    violationCount: number;
    status: string;
    questions?: ShuffledQuestion[];
    violations?: ViolationRecord[];
}
export declare class ViolationResult {
    violationCount: number;
    remaining: number;
    maxViolations: number;
    voided: boolean;
}
export declare class AttemptWithUser {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    setCode: string;
    startedAt: Date;
    completedAt?: Date;
    score?: number;
    passed?: boolean;
    isInvalid: boolean;
    violationCount: number;
    status: string;
    violations?: ViolationRecord[];
}
export declare class AssessmentReport {
    totalAttempts: number;
    avgScore: number;
    passRate: number;
    voidedCount: number;
    attempts: AttemptWithUser[];
}
