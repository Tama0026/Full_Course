import { AssessmentsService } from './assessments.service';
export declare class CreateAssessmentInput {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    isActive: boolean;
    numberOfSets: number;
}
export declare class CreateQuestionInput {
    setCode: string;
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
    createAssessment(input: CreateAssessmentInput, user: {
        id: string;
        role: string;
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
    deleteAssessment(id: string, user: {
        id: string;
        role: string;
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
    createAssessmentQuestion(assessmentId: string, input: CreateQuestionInput, user: {
        id: string;
        role: string;
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
    deleteAssessmentQuestion(id: string, user: {
        id: string;
        role: string;
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
    startAssessmentAttempt(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<{
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
    submitAssessmentAttempt(attemptId: string, answers: AnswerInput[], user: {
        id: string;
        role: string;
    }): Promise<{
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
