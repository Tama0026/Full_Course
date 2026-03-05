import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AiResolver {
    private readonly aiService;
    private readonly prisma;
    constructor(aiService: AiService, prisma: PrismaService);
    searchCourses(query: string): Promise<string>;
    generateLessonContent(title: string, courseTitle: string, nonce?: number): Promise<string>;
    generateLessonContentWithQuiz(title: string, courseTitle: string, lessonId: string, quizCount: number): Promise<string>;
    assessSkill(user: {
        id: string;
    }): Promise<string>;
    askTutor(question: string, lessonId: string): Promise<string>;
    parseRawQuestions(rawText: string): Promise<string>;
    suggestLearningOutcomes(title: string, description: string): Promise<string[]>;
    getAiRecommendations(user: {
        id: string;
    }): Promise<string>;
}
