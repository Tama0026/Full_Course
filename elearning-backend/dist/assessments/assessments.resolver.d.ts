import { AssessmentsService } from './assessments.service';
import { PaginationArgs } from '../common/dto/pagination.args';
export declare class CreateAssessmentInput {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    type: 'MARKETPLACE' | 'PRIVATE';
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
    }, pagination: PaginationArgs): Promise<{
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
    createAssessment(input: CreateAssessmentInput, user: {
        id: string;
        role: string;
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
    deleteAssessment(id: string, user: {
        id: string;
        role: string;
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
        assessmentId: string;
        setCode: string;
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
    submitAssessmentAttempt(attemptId: string, answers: AnswerInput[], user: {
        id: string;
        role: string;
    }): Promise<{
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
    myAttemptHistory(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<({
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
    assessmentReport(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<{
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
    publishAssessment(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<{
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
    unpublishAssessment(assessmentId: string, user: {
        id: string;
        role: string;
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
    autoBalancePoints(assessmentId: string, user: {
        id: string;
        role: string;
    }): Promise<({
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
    updateQuestionInline(questionId: string, input: UpdateQuestionInlineInput, user: {
        id: string;
        role: string;
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
    generateAiExamQuestions(assessmentId: string, questionCount: number, bankId: string, setCode: string, user: {
        id: string;
        role: string;
    }): Promise<({
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
