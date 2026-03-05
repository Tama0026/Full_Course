export declare class ReviewPathItem {
    id: string;
    reportId: string;
    lessonId: string;
    lessonTitle: string;
    reason: string;
    priority: number;
    isCompleted: boolean;
    completedAt?: Date;
    createdAt: Date;
}
export declare class RemediationReport {
    id: string;
    attemptId: string;
    userId: string;
    assessmentId: string;
    scorePercent: number;
    totalQuestions: number;
    wrongCount: number;
    aiAnalysis: string;
    severity: string;
    isResolved: boolean;
    createdAt: Date;
    updatedAt: Date;
    pathItems?: ReviewPathItem[];
}
