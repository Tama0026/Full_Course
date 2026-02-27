import { PrismaService } from '../prisma/prisma.service';
export declare class AiService {
    private readonly prisma;
    private ai;
    private readonly MODELS;
    constructor(prisma: PrismaService);
    private generateWithFallback;
    searchCourses(query: string): Promise<string>;
    generateLessonContent(title: string): Promise<string>;
    generateLessonContentWithQuiz(title: string, quizCount?: number): Promise<{
        body: string;
        quiz: {
            content: string;
            options: string[];
            correctAnswer: number;
        }[];
    }>;
    assessSkill(userId: string): Promise<string>;
    generateQuiz(lessonContent: string, count?: number): Promise<any[]>;
    askTutor(question: string, lessonId: string): Promise<string>;
}
