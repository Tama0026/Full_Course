import { PrismaService } from '../prisma/prisma.service';
export declare class AiService {
    private readonly prisma;
    private ai;
    private readonly MODELS;
    constructor(prisma: PrismaService);
    private generateWithFallback;
    searchCourses(query: string): Promise<string>;
    generateLessonContent(title: string, courseTitle: string): Promise<string>;
    generateLessonContentWithQuiz(title: string, courseTitle: string, quizCount?: number): Promise<{
        body: string;
        quiz: {
            content: string;
            options: string[];
            correctAnswer: number;
        }[];
    }>;
    assessSkill(userId: string): Promise<string>;
    generateQuiz(lessonContent: string, count?: number): Promise<any[]>;
    generateExamFromBank(title: string, description: string, bankContext: string, questionCount: number, totalPoints: number): Promise<any[]>;
    parseRawQuestions(rawText: string): Promise<any[]>;
    askTutor(question: string, lessonId: string): Promise<string>;
    conductInterview(courseContext: string, courseName: string, userMessage: string, history: {
        role: string;
        content: string;
    }[]): Promise<string>;
    suggestLearningOutcomes(title: string, description: string): Promise<string[]>;
    getAiRecommendations(userId: string): Promise<string>;
}
