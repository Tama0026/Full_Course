import { RemediationService } from './remediation.service';
export declare class RemediationResolver {
    private readonly remediationService;
    constructor(remediationService: RemediationService);
    getMyRemediations(user: {
        id: string;
        role: string;
    }): Promise<({
        pathItems: {
            id: string;
            createdAt: Date;
            priority: number;
            lessonId: string;
            completedAt: Date | null;
            lessonTitle: string;
            reason: string;
            isCompleted: boolean;
            reportId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        totalQuestions: number;
        assessmentId: string;
        scorePercent: number;
        wrongCount: number;
        aiAnalysis: string;
        severity: string;
        isResolved: boolean;
        attemptId: string;
    })[]>;
    completeReviewItem(itemId: string, user: {
        id: string;
        role: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        priority: number;
        lessonId: string;
        completedAt: Date | null;
        lessonTitle: string;
        reason: string;
        isCompleted: boolean;
        reportId: string;
    }>;
}
