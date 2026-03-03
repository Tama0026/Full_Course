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
    createAssessment(input: CreateAssessmentInput, user: {
        id: string;
        role: string;
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
    deleteAssessment(id: string, user: {
        id: string;
        role: string;
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
    createAssessmentQuestion(assessmentId: string, input: CreateQuestionInput, user: {
        id: string;
        role: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        options: string;
        correctAnswer: number;
        assessmentId: string;
    }>;
    deleteAssessmentQuestion(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        options: string;
        correctAnswer: number;
        assessmentId: string;
    }>;
    startAssessmentAttempt(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<{
        id: string;
        completedAt: Date | null;
        userId: string;
        score: number | null;
        assessmentId: string;
        passed: boolean;
        isInvalid: boolean;
        startedAt: Date;
    }>;
    submitAssessmentAttempt(attemptId: string, answers: AnswerInput[], user: {
        id: string;
        role: string;
    }): Promise<{
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
export declare class AssessmentQuestionResolver {
    prompt(question: {
        content: string;
    }): string;
    options(question: {
        options: string | string[];
    }): any;
    explanation(): string;
    order(): number;
    correctAnswer(question: {
        correctAnswer: number;
    }): string;
}
