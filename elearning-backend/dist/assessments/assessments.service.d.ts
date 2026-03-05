import { PrismaService } from '../prisma/prisma.service';
import { RemediationService } from '../remediation/remediation.service';
import { AiService } from '../ai/ai.service';
export declare class AssessmentsService {
    private prisma;
    private remediationService;
    private aiService;
    private attemptCache;
    constructor(prisma: PrismaService, remediationService: RemediationService, aiService: AiService);
    getAssessments(userRole: string, userId: string): Promise<{
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAssessment(id: string): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            assessmentId: string;
            setCode: string;
            content: string;
            options: string;
            correctAnswer: number;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    createAssessment(userId: string, data: {
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        isActive: boolean;
        maxAttempts?: number;
        maxViolations?: number;
        totalPoints?: number;
    }): Promise<{
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteAssessment(id: string, creatorId: string): Promise<{
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
        assessmentId: string;
        setCode: string;
        content: string;
        options: string;
        correctAnswer: number;
        points: number;
        difficulty: string;
        isAiGenerated: boolean;
        bankQuestionId: string | null;
    }>;
    deleteQuestion(id: string, creatorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        setCode: string;
        content: string;
        options: string;
        correctAnswer: number;
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
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        status: string;
        answers: string | null;
        startedAt: Date;
        completedAt: Date | null;
        userId: string;
    }>;
    submitAttempt(attemptId: string, userId: string, answers: {
        questionId: string;
        answer: string;
    }[]): Promise<{
        id: string;
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        status: string;
        answers: string | null;
        startedAt: Date;
        completedAt: Date | null;
        userId: string;
    }>;
    getAttemptForSocket(attemptId: string, userId: string): Promise<({
        assessment: {
            maxViolations: number;
        };
    } & {
        id: string;
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        status: string;
        answers: string | null;
        startedAt: Date;
        completedAt: Date | null;
        userId: string;
    }) | null>;
    logViolation(attemptId: string, type: string): Promise<{
        violationCount: number;
        maxViolations: number;
        remaining: number;
        voided: boolean;
    }>;
    getAttemptHistory(assessmentId: string, userId: string): Promise<({
        assessment: {
            title: string;
            passingScore: number;
            maxAttempts: number;
        };
    } & {
        id: string;
        assessmentId: string;
        setCode: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        violationCount: number;
        status: string;
        answers: string | null;
        startedAt: Date;
        completedAt: Date | null;
        userId: string;
    })[]>;
    getAssessmentReport(assessmentId: string, creatorId: string): Promise<{
        assessment: {
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
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
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
            assessmentId: string;
            setCode: string;
            content: string;
            options: string;
            correctAnswer: number;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    publishAssessment(assessmentId: string, creatorId: string): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            assessmentId: string;
            setCode: string;
            content: string;
            options: string;
            correctAnswer: number;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    unpublishAssessment(assessmentId: string, creatorId: string): Promise<{
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateQuestionInline(questionId: string, creatorId: string, data: {
        points?: number;
        correctAnswer?: number;
        difficulty?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        setCode: string;
        content: string;
        options: string;
        correctAnswer: number;
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
            assessmentId: string;
            setCode: string;
            content: string;
            options: string;
            correctAnswer: number;
            points: number;
            difficulty: string;
            isAiGenerated: boolean;
            bankQuestionId: string | null;
        }[];
    } & {
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
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
}
