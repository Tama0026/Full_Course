import { AssessmentsService } from './assessments.service';
export declare class CreateAssessmentInput {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    isActive: boolean;
    numberOfSets: number;
    maxAttempts: number;
    maxViolations: number;
    totalPoints: number;
    isPublished: boolean;
}
export declare class CreateQuestionInput {
    setCode: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    order: number;
    points?: number;
    difficulty?: string;
}
export declare class UpdateQuestionInlineInput {
    points?: number;
    correctAnswer?: number;
    difficulty?: string;
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
    createAssessment(input: CreateAssessmentInput, user: {
        id: string;
        role: string;
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
    deleteAssessment(id: string, user: {
        id: string;
        role: string;
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
    createAssessmentQuestion(assessmentId: string, input: CreateQuestionInput, user: {
        id: string;
        role: string;
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
    deleteAssessmentQuestion(id: string, user: {
        id: string;
        role: string;
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
    submitAssessmentAttempt(attemptId: string, answers: AnswerInput[], user: {
        id: string;
        role: string;
    }): Promise<{
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
    myAttemptHistory(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<({
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
    assessmentReport(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<{
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
    publishAssessment(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<{
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
    unpublishAssessment(assessmentId: string, user: {
        id: string;
        role: string;
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
    autoBalancePoints(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<({
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
    updateQuestionInline(questionId: string, input: UpdateQuestionInlineInput, user: {
        id: string;
        role: string;
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
    generateAiExamQuestions(assessmentId: string, questionCount: number, bankId: string, setCode: string, user: {
        id: string;
        role: string;
    }): Promise<({
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
