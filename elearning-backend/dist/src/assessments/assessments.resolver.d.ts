import { AssessmentsService } from './assessments.service';
export declare class CreateAssessmentInput {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    isActive: boolean;
}
export declare class CreateQuestionInput {
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    order: number;
}
export declare class AnswerInput {
    questionId: string;
    answer: string;
}
export declare class AssessmentsResolver {
    private readonly assessmentsService;
    constructor(assessmentsService: AssessmentsService);
    getAssessments(user: {
        id: string;
        role: string;
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
    createAssessment(input: CreateAssessmentInput, user: {
        id: string;
        role: string;
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
    deleteAssessment(id: string, user: {
        id: string;
        role: string;
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
    createAssessmentQuestion(assessmentId: string, input: CreateQuestionInput, user: {
        id: string;
        role: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        content: string;
        options: string;
        correctAnswer: number;
    }>;
    deleteAssessmentQuestion(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        content: string;
        options: string;
        correctAnswer: number;
    }>;
    startAssessmentAttempt(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<{
        id: string;
        assessmentId: string;
        score: number | null;
        passed: boolean;
        isInvalid: boolean;
        startedAt: Date;
        completedAt: Date | null;
        userId: string;
    }>;
    submitAssessmentAttempt(attemptId: string, answers: AnswerInput[], user: {
        id: string;
        role: string;
    }): Promise<{
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
