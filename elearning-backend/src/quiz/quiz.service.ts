import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SubmitQuizResponse } from './dto/submit-quiz.response';
import { QuizAnswerInput } from './dto/submit-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { Quiz } from './entities/quiz.entity';

@Injectable()
export class QuizService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
    ) { }

    /**
     * Generate or Regenerate Quiz with AI for a given lesson
     */
    async generateQuizWithAI(lessonId: string, count: number = 5): Promise<Quiz> {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
        }

        if (!lesson.body || lesson.body.trim().length === 0) {
            throw new BadRequestException('Lesson has no content to generate a quiz from');
        }

        // 1. Call AI to generate X questions
        const aiQuestions = await this.aiService.generateQuiz(lesson.body, count);
        if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
            throw new InternalServerErrorException('AI failed to generate a valid question list');
        }

        // 2. Clear existing quiz if exists (Regenerate)
        const existingQuiz = await this.prisma.quiz.findUnique({
            where: { lessonId },
        });

        if (existingQuiz) {
            await this.prisma.quiz.delete({
                where: { id: existingQuiz.id },
            });
        }

        // 3. Save new Quiz and Questions
        return this.prisma.quiz.create({
            data: {
                lessonId,
                questions: {
                    create: aiQuestions.map((q: any) => ({
                        content: q.content,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: { questions: true },
        }) as unknown as Quiz;
    }

    /**
     * Update an existing quiz manually
     */
    async updateQuiz(input: UpdateQuizInput): Promise<Quiz> {
        const { lessonId, questions } = input;

        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
        }

        // 1. Delete existing quiz if exists to fully replace
        const existingQuiz = await this.prisma.quiz.findUnique({
            where: { lessonId },
        });

        if (existingQuiz) {
            await this.prisma.quiz.delete({
                where: { id: existingQuiz.id },
            });
        }

        // 2. Create new Quiz and Questions
        return this.prisma.quiz.create({
            data: {
                lessonId,
                questions: {
                    create: questions.map((q: any) => ({
                        content: q.content,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: { questions: true },
        }) as unknown as Quiz;
    }

    /**
     * Get quiz by lesson ID
     */
    async getQuizByLesson(lessonId: string): Promise<Quiz | null> {
        return this.prisma.quiz.findUnique({
            where: { lessonId },
            include: { questions: true },
        }) as unknown as Quiz | null;
    }

    /**
     * Submit Quiz answers and score them.
     */
    async submitQuiz(
        userId: string,
        lessonId: string,
        answers: QuizAnswerInput[],
    ): Promise<SubmitQuizResponse> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { lessonId },
            include: { questions: true },
        });

        if (!quiz || quiz.questions.length === 0) {
            throw new NotFoundException('Quiz not found for this lesson');
        }

        const totalQuestions = quiz.questions.length;
        let score = 0;

        for (const answer of answers) {
            const question = quiz.questions.find((q) => q.id === answer.questionId);
            if (question && question.correctAnswer === answer.selectedOption) {
                score++;
            }
        }

        const isPassed = (score / totalQuestions) >= 0.8;

        if (isPassed) {
            // Find enrollment to update progress logic
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: lessonId },
                include: { section: { select: { courseId: true } } },
            });

            if (lesson && lesson.section) {
                const enrollment = await this.prisma.enrollment.findUnique({
                    where: {
                        userId_courseId: {
                            userId,
                            courseId: lesson.section.courseId,
                        }
                    }
                });

                if (enrollment) {
                    let completedLessons: string[] = [];
                    try {
                        completedLessons = JSON.parse(enrollment.completedLessons);
                    } catch (e) { }

                    if (!completedLessons.includes(lessonId)) {
                        completedLessons.push(lessonId);

                        // Check if course is fully finished by counting all lessons
                        const totalCourseLessons = await this.prisma.lesson.count({
                            where: { section: { courseId: lesson.section.courseId } }
                        });

                        const isFinished = completedLessons.length >= totalCourseLessons;

                        await this.prisma.enrollment.update({
                            where: { id: enrollment.id },
                            data: {
                                completedLessons: JSON.stringify(completedLessons),
                                isFinished,
                            },
                        });
                    }
                }
            }
        }

        return {
            success: isPassed,
            score,
            totalQuestions,
            message: isPassed ? 'Chúc mừng bạn đã vượt qua bài kiểm tra!' : 'Bạn chưa đạt đủ 80% điểm. Đừng bỏ cuộc, hãy thử lại!',
        };
    }
}
