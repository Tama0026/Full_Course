import { QuizService } from './quiz.service';
import { Quiz } from './entities/quiz.entity';
import { SubmitQuizResponse } from './dto/submit-quiz.response';
import { QuizAnswerInput } from './dto/submit-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
export declare class QuizResolver {
    private readonly quizService;
    constructor(quizService: QuizService);
    generateQuizWithAI(lessonId: string, count: number): Promise<Quiz>;
    updateQuiz(input: UpdateQuizInput): Promise<Quiz>;
    getQuiz(lessonId: string, context: any): Promise<Quiz | null>;
    submitQuiz(lessonId: string, answers: QuizAnswerInput[], context: any): Promise<SubmitQuizResponse>;
}
