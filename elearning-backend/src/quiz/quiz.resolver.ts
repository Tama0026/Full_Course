import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Quiz } from './entities/quiz.entity';
import { SubmitQuizResponse } from './dto/submit-quiz.response';
import { QuizAnswerInput } from './dto/submit-quiz.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { EnrollmentGuard } from '../common/guards/enrollment.guard';
import { UpdateQuizInput } from './dto/update-quiz.input';

@Resolver(() => Quiz)
export class QuizResolver {
    constructor(private readonly quizService: QuizService) { }

    @Mutation(() => Quiz)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async generateQuizWithAI(
        @Args('lessonId') lessonId: string,
        @Args({ name: 'count', type: () => Int, defaultValue: 5 }) count: number,
    ): Promise<Quiz> {
        return this.quizService.generateQuizWithAI(lessonId, count);
    }

    @Mutation(() => Quiz)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async updateQuiz(@Args('input') input: UpdateQuizInput): Promise<Quiz> {
        return this.quizService.updateQuiz(input);
    }

    @Query(() => Quiz, { nullable: true })
    @UseGuards(JwtAuthGuard, EnrollmentGuard)
    async getQuiz(
        @Args('lessonId') lessonId: string,
        @Context() context: any,
    ): Promise<Quiz | null> {
        const user = context.req.user;
        const quiz = await this.quizService.getQuizByLesson(lessonId);

        if (quiz && user.role === Role.STUDENT) {
            // Strip out correctAnswer for students to prevent cheating via GraphQL devtools
            quiz.questions = quiz.questions.map((q) => {
                const safeQuestion = { ...q };
                delete safeQuestion.correctAnswer;
                return safeQuestion;
            });
        }

        return quiz;
    }

    @Mutation(() => SubmitQuizResponse)
    @UseGuards(JwtAuthGuard, EnrollmentGuard)
    async submitQuiz(
        @Args('lessonId') lessonId: string,
        @Args({ name: 'answers', type: () => [QuizAnswerInput] }) answers: QuizAnswerInput[],
        @Context() context: any,
    ): Promise<SubmitQuizResponse> {
        const userId = context.req.user.id;
        return this.quizService.submitQuiz(userId, lessonId, answers);
    }
}
