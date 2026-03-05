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
    console.log(
      `[AiResolver] suggestCourses done — response length: ${result.length} chars`,
    );
    return result;
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async generateLessonContent(
    @Args('title') title: string,
    @Args('courseTitle') courseTitle: string,
    @Args('nonce', { type: () => Float, nullable: true }) nonce?: number,
  ): Promise<string> {
    console.log(
      `[AiResolver] generateLessonContent — courseTitle: "${courseTitle}", title: "${title}", nonce: ${nonce ?? 'none'}`,
    );
    const result = await this.aiService.generateLessonContent(
      title,
      courseTitle,
    );
    console.log(
      `[AiResolver] generateLessonContent done — ${result.length} chars`,
    );
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
    @Args('courseTitle') courseTitle: string,
    @Args('lessonId') lessonId: string,
    @Args({ name: 'quizCount', type: () => Int, defaultValue: 5 })
    quizCount: number,
  ): Promise<string> {
    console.log(
      `[AiResolver] generateLessonContentWithQuiz — courseTitle: "${courseTitle}", title: "${title}", lessonId: ${lessonId}, quizCount: ${quizCount}`,
    );

    // 1. Call AI to generate both content and quiz
    const aiResult = await this.aiService.generateLessonContentWithQuiz(
      title,
      courseTitle,
      quizCount,
    );

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

    console.log(
      `[AiResolver] generateLessonContentWithQuiz done — body saved + ${aiResult.quiz.length} quiz questions created`,
    );
    return aiResult.body;
  }

  /**
   * AI Professional Assessment — evaluates user skills based on completed courses.
   * Returns a JSON string with scores and recommendations.
   */
  @Mutation(() => String, { name: 'assessSkill' })
  @UseGuards(JwtAuthGuard)
  async assessSkill(@CurrentUser() user: { id: string }): Promise<string> {
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

  /**
   * AI Magic Import — parses raw text into valid JSON array of questions
   */
  @Mutation(() => String, { name: 'parseRawQuestions' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async parseRawQuestions(
    @Args('rawText') rawText: string,
  ): Promise<string> {
    console.log(`[AiResolver] parseRawQuestions length: ${rawText.length}`);
    const questions = await this.aiService.parseRawQuestions(rawText);
    return JSON.stringify(questions);
  }

  /**
   * AI Learning Outcomes — suggests 5-8 learning outcomes for a course.
   */
  @Mutation(() => [String], { name: 'suggestLearningOutcomes' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async suggestLearningOutcomes(
    @Args('title') title: string,
    @Args('description') description: string,
  ): Promise<string[]> {
    console.log(`[AiResolver] suggestLearningOutcomes — title: "${title}"`);
    return this.aiService.suggestLearningOutcomes(title, description);
  }

  /**
   * AI Recommendations — personalized course suggestions based on knowledge gaps.
   */
  @Query(() => String, { name: 'aiRecommendations' })
  @UseGuards(JwtAuthGuard)
  async getAiRecommendations(
    @CurrentUser() user: { id: string },
  ): Promise<string> {
    console.log(`[AiResolver] aiRecommendations — userId: ${user.id}`);
    return this.aiService.getAiRecommendations(user.id);
  }
}
