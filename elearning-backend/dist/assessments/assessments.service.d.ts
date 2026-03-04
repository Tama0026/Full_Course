import { PrismaService } from '../prisma/prisma.service';
export declare class AssessmentsService {
    private prisma;
    private attemptCache;
    constructor(prisma: PrismaService);
    getAssessments(userRole: string, userId: string): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
    }[]>;
    getAssessment(id: string): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: string;
            content: string;
            correctAnswer: number;
            setCode: string;
            assessmentId: string;
        }[];
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
    }) | null>;
    createAssessment(userId: string, data: {
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        isActive: boolean;
    }): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
    }>;
    updateAssessment(id: string, creatorId: string, data: Partial<{
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
        isActive: boolean;
    }>): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
    }>;
    deleteAssessment(id: string, creatorId: string): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        creatorId: string;
        timeLimit: number;
        passingScore: number;
        numberOfSets: number;
    }>;
    createQuestion(assessmentId: string, creatorId: string, data: {
        setCode: string;
        prompt: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
        order: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        setCode: string;
        assessmentId: string;
    }>;
    deleteQuestion(id: string, creatorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: string;
        content: string;
        correctAnswer: number;
        setCode: string;
        assessmentId: string;
    }>;
    startAttempt(assessmentId: string, userId: string): Promise<{
        questions: {
            id: string;
            prompt: string;
            options: any[];
        }[];
        id: string;
        userId: string;
        completedAt: Date | null;
        score: number | null;
        setCode: string;
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
        userId: string;
        completedAt: Date | null;
        score: number | null;
        setCode: string;
        assessmentId: string;
        passed: boolean;
        isInvalid: boolean;
        startedAt: Date;
    }>;
}
