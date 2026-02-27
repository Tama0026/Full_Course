import { QuizService } from './quiz.service';
import { Quiz } from './entities/quiz.entity';
import { SubmitQuizResponse } from './dto/submit-quiz.response';
import { QuizAnswerInput } from './dto/submit-quiz.input';
export declare class QuizResolver {
    private readonly quizService;
    constructor(quizService: QuizService);
    generateQuizWithAI(lessonId: string): Promise<Quiz>;
    getQuiz(lessonId: string): Promise<Quiz | null>;
    submitQuiz(lessonId: string, answers: QuizAnswerInput[], context: any): Promise<SubmitQuizResponse>;
}
