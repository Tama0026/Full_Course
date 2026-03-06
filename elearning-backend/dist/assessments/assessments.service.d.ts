import { PrismaService } from '../prisma/prisma.service';
import { RemediationService } from '../remediation/remediation.service';
import { AiService } from '../ai/ai.service';
export declare class AssessmentsService {
    private prisma;
    private remediationService;
    private aiService;
    private attemptCache;
    constructor(prisma: PrismaService, remediationService: RemediationService, aiService: AiService);
    getAssessments(userRole: string, userId: string, take?: number, skip?: number, search?: string): Promise<{
        items: {
            type: import("@prisma/client").$Enums.AssessmentType;
            description: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            enrollCode: string | null;
            isActive: boolean;
            totalPoints: number;
            creatorId: string;
            timeLimit: number;
            passingScore: number;
            numberOfSets: number;
            maxAttempts: number;
            maxViolations: number;
            isPublished: boolean;
        }[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getAssessment(id: string): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: string;
            content: string;
            correctAnswer: number;
            assessmentId: string;
            setCode: string;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }) | null>;
    createAssessment(userId: string, data: {
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        type: 'MARKETPLACE' | 'PRIVATE';
        isActive: boolean;
        maxAttempts?: number;
        maxViolations?: number;
        totalPoints?: number;
    }): Promise<{
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }>;
    updateAssessment(id: string, creatorId: string, data: Partial<{
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        isActive: boolean;
        maxAttempts: number;
        maxViolations: number;
        totalPoints: number;
    }>): Promise<{
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }>;
    deleteAssessment(id: string, creatorId: string): Promise<{
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }>;
    generateUniqueEnrollCode(): Promise<string>;
    createQuestion(assessmentId: string, creatorId: string, data: {
        setCode: string;
        prompt: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
        order: number;
        points?: number;
        difficulty?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        assessmentId: string;
        setCode: string;
        points: number;
        difficulty: string;
        isAiGenerated: boolean;
        bankQuestionId: string | null;
    }>;
    deleteQuestion(id: string, creatorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        assessmentId: string;
        setCode: string;
        points: number;
        difficulty: string;
        isAiGenerated: boolean;
        bankQuestionId: string | null;
    }>;
    startAttempt(assessmentId: string, userId: string): Promise<{
        questions: {
            id: string;
            prompt: string;
            options: any[];
        }[];
        id: string;
        userId: string;
        status: string;
        completedAt: Date | null;
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        answers: string | null;
        startedAt: Date;
    }>;
    submitAttempt(attemptId: string, userId: string, answers: {
        questionId: string;
        answer: string;
    }[]): Promise<{
        id: string;
        userId: string;
        status: string;
        completedAt: Date | null;
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        answers: string | null;
        startedAt: Date;
    }>;
    getAttemptForSocket(attemptId: string, userId: string): Promise<({
        assessment: {
            maxViolations: number;
        };
    } & {
        id: string;
        userId: string;
        status: string;
        completedAt: Date | null;
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        answers: string | null;
        startedAt: Date;
    }) | null>;
    logViolation(attemptId: string, type: string): Promise<{
        violationCount: number;
        maxViolations: number;
        remaining: number;
        voided: boolean;
    }>;
    cacheAnswers(attemptId: string, userId: string, answers: Record<string, string>): Promise<void>;
    getAttemptById(attemptId: string): Promise<{
        id: string;
        status: string;
    } | null>;
    getAttemptHistory(assessmentId: string, userId: string): Promise<({
        assessment: {
            title: string;
            passingScore: number;
            maxAttempts: number;
        };
        violations: {
            type: string;
            timestamp: Date;
            id: string;
            attemptId: string;
        }[];
    } & {
        id: string;
        userId: string;
        status: string;
        completedAt: Date | null;
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        answers: string | null;
        startedAt: Date;
    })[]>;
    getAssessmentReport(assessmentId: string, creatorId: string): Promise<{
        assessment: {
            type: import("@prisma/client").$Enums.AssessmentType;
            description: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            enrollCode: string | null;
            isActive: boolean;
            totalPoints: number;
            creatorId: string;
            timeLimit: number;
            passingScore: number;
            numberOfSets: number;
            maxAttempts: number;
            maxViolations: number;
            isPublished: boolean;
        };
        totalAttempts: number;
        avgScore: number;
        passRate: number;
        voidedCount: number;
        attempts: {
            id: any;
            userId: any;
            userName: any;
            userEmail: any;
            setCode: any;
            startedAt: any;
            completedAt: any;
            score: any;
            passed: any;
            isInvalid: any;
            violationCount: any;
            status: any;
            violations: any;
        }[];
    }>;
    normalizePoints(questions: {
        id: string;
        difficulty: string;
    }[], totalPoints: number): {
        id: string;
        points: number;
    }[];
    autoBalancePoints(assessmentId: string, creatorId: string): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: string;
            content: string;
            correctAnswer: number;
            assessmentId: string;
            setCode: string;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }) | null>;
    publishAssessment(assessmentId: string, creatorId: string): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: string;
            content: string;
            correctAnswer: number;
            assessmentId: string;
            setCode: string;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }>;
    unpublishAssessment(assessmentId: string, creatorId: string): Promise<{
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }>;
    updateQuestionInline(questionId: string, creatorId: string, data: {
        points?: number;
        correctAnswer?: number;
        difficulty?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        assessmentId: string;
        setCode: string;
        points: number;
        difficulty: string;
        isAiGenerated: boolean;
        bankQuestionId: string | null;
    }>;
    generateAiExamQuestions(assessmentId: string, creatorId: string, bankId: string | null, questionCount: number, setCode?: string): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: string;
            content: string;
            correctAnswer: number;
            assessmentId: string;
            setCode: string;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
        type: import("@prisma/client").$Enums.AssessmentType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        enrollCode: string | null;
        isActive: boolean;
        totalPoints: number;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        maxAttempts: number;
        maxViolations: number;
        isPublished: boolean;
    }) | null>;
}
