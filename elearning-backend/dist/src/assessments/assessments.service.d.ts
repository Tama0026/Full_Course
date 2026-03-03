import { PrismaService } from '../prisma/prisma.service';
export declare class AssessmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAssessments(userRole: string, userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
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
            content: string;
            options: string;
            correctAnswer: number;
        }[];
    } & {
        id: string;
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
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
        isActive: boolean;
    }): Promise<{
        id: string;
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
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
        isActive: boolean;
    }>): Promise<{
        id: string;
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
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
        isActive: boolean;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createQuestion(assessmentId: string, creatorId: string, data: Record<string, unknown>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        content: string;
        options: string;
        correctAnswer: number;
    }>;
    deleteQuestion(id: string, creatorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        content: string;
        options: string;
        correctAnswer: number;
    }>;
    startAttempt(assessmentId: string, userId: string): Promise<{
        id: string;
        assessmentId: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
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
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        startedAt: Date;
        completedAt: Date | null;
        userId: string;
    }>;
}
