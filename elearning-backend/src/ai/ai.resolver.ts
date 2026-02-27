import { Resolver, Query, Mutation, Args, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver()
export class AiResolver {
    constructor(
        private readonly aiService: AiService,
        private readonly prisma: PrismaService,
    ) { }

    @Query(() => String, { name: 'suggestCourses' })
    async searchCourses(@Args('query') query: string): Promise<string> {
        console.log(`[AiResolver] suggestCourses — query: "${query}"`);
        const result = await this.aiService.searchCourses(query);
        console.log(`[AiResolver] suggestCourses done — response length: ${result.length} chars`);
        return result;
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async generateLessonContent(
        @Args('title') title: string,
        @Args('nonce', { type: () => Float, nullable: true }) nonce?: number,
    ): Promise<string> {
        console.log(`[AiResolver] generateLessonContent — title: "${title}", nonce: ${nonce ?? 'none'}`);
        const result = await this.aiService.generateLessonContent(title);
        console.log(`[AiResolver] generateLessonContent done — ${result.length} chars`);
        return result;
    }

    /**
     * AI All-in-One: Generate lesson content + quiz in a single call.
     * Atomically saves body to lesson and creates quiz with questions.
     */
    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async generateLessonContentWithQuiz(
        @Args('title') title: string,
        @Args('lessonId') lessonId: string,
        @Args({ name: 'quizCount', type: () => Int, defaultValue: 5 }) quizCount: number,
    ): Promise<string> {
        console.log(`[AiResolver] generateLessonContentWithQuiz — title: "${title}", lessonId: ${lessonId}, quizCount: ${quizCount}`);

        // 1. Call AI to generate both content and quiz
        const aiResult = await this.aiService.generateLessonContentWithQuiz(title, quizCount);

        // 2. Atomic transaction: save body + quiz together
        await this.prisma.$transaction(async (tx) => {
            // Update lesson body
            await tx.lesson.update({
                where: { id: lessonId },
                data: { body: aiResult.body },
            });

            // Delete existing quiz if any
            const existingQuiz = await tx.quiz.findUnique({
                where: { lessonId },
            });
            if (existingQuiz) {
                await tx.quiz.delete({ where: { id: existingQuiz.id } });
            }

            // Create new quiz with questions
            await tx.quiz.create({
                data: {
                    lessonId,
                    questions: {
                        create: aiResult.quiz.map((q) => ({
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correctAnswer: q.correctAnswer,
                        })),
                    },
                },
            });
        });

        console.log(`[AiResolver] generateLessonContentWithQuiz done — body saved + ${aiResult.quiz.length} quiz questions created`);
        return aiResult.body;
    }

    /**
     * AI Professional Assessment — evaluates user skills based on completed courses.
     * Returns a JSON string with scores and recommendations.
     */
    @Mutation(() => String, { name: 'assessSkill' })
    @UseGuards(JwtAuthGuard)
    async assessSkill(
        @CurrentUser() user: { id: string },
    ): Promise<string> {
        console.log(`[AiResolver] assessSkill — userId: ${user.id}`);
        const result = await this.aiService.assessSkill(user.id);
        console.log(`[AiResolver] assessSkill done — ${result.length} chars`);
        return result;
    }

    /**
     * AI Tutor — answers a student question using current lesson as context.
     */
    @Mutation(() => String, { name: 'askTutor' })
    @UseGuards(JwtAuthGuard)
    async askTutor(
        @Args('question') question: string,
        @Args('lessonId') lessonId: string,
    ): Promise<string> {
        console.log(`[AiResolver] askTutor — lessonId: ${lessonId}`);
        return this.aiService.askTutor(question, lessonId);
    }
}

