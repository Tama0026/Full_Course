import { PrismaService } from '../prisma/prisma.service';
export declare class AssessmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAssessments(userRole: string, userId: string): Promise<{
        id: string;
        description: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        timeLimit: number;
        passingScore: number;
    }[]>;
    getAssessment(id: string): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            options: string;
            correctAnswer: number;
            assessmentId: string;
        }[];
    } & {
        id: string;
        description: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        timeLimit: number;
        passingScore: number;
    }) | null>;
    createAssessment(userId: string, data: {
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        isActive: boolean;
    }): Promise<{
        id: string;
        description: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        timeLimit: number;
        passingScore: number;
    }>;
    updateAssessment(id: string, creatorId: string, data: Partial<{
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        isActive: boolean;
    }>): Promise<{
        id: string;
        description: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        timeLimit: number;
        passingScore: number;
    }>;
    deleteAssessment(id: string, creatorId: string): Promise<{
        id: string;
        description: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        timeLimit: number;
        passingScore: number;
    }>;
    createQuestion(assessmentId: string, creatorId: string, data: {
        prompt: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
        order: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        options: string;
        correctAnswer: number;
        assessmentId: string;
    }>;
    deleteQuestion(id: string, creatorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        options: string;
        correctAnswer: number;
        assessmentId: string;
    }>;
    startAttempt(assessmentId: string, userId: string): Promise<{
        id: string;
        completedAt: Date | null;
        userId: string;
        score: number | null;
        assessmentId: string;
        passed: boolean;
        isInvalid: boolean;
        startedAt: Date;
    }>;
    submitAttempt(attemptId: string, userId: string, answers: {
        questionId: string;
        answer: string;
    }[]): Promise<{
        id: string;
        completedAt: Date | null;
        userId: string;
        score: number | null;
        assessmentId: string;
        passed: boolean;
        isInvalid: boolean;
        startedAt: Date;
    }>;
}
