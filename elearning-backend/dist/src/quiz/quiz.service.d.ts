import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { GamificationService } from '../gamification/gamification.service';
import { SubmitQuizResponse } from './dto/submit-quiz.response';
import { QuizAnswerInput } from './dto/submit-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { Quiz } from './entities/quiz.entity';
export declare class QuizService {
    private readonly prisma;
    private readonly aiService;
    private readonly gamificationService;
    constructor(prisma: PrismaService, aiService: AiService, gamificationService: GamificationService);
    generateQuizWithAI(lessonId: string, count?: number): Promise<Quiz>;
    updateQuiz(input: UpdateQuizInput): Promise<Quiz>;
    getQuizByLesson(lessonId: string): Promise<Quiz | null>;
    submitQuiz(userId: string, lessonId: string, answers: QuizAnswerInput[]): Promise<SubmitQuizResponse>;
}
