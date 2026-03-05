import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class RemediationService {
    private readonly prisma;
    private readonly aiService;
    constructor(prisma: PrismaService, aiService: AiService);
    analyzeAttempt(attemptId: string, userId: string): Promise<void>;
    private buildWrongAnswerData;
    private callAiGapAnalysis;
    private buildReviewPath;
    private applyAdaptiveFlow;
    getMyRemediations(userId: string): Promise<({
        pathItems: {
            id: string;
            createdAt: Date;
            lessonId: string;
            completedAt: Date | null;
            lessonTitle: string;
            reason: string;
            priority: number;
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
    completeReviewItem(itemId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        lessonId: string;
        completedAt: Date | null;
        lessonTitle: string;
        reason: string;
        priority: number;
        isCompleted: boolean;
        reportId: string;
    }>;
}
