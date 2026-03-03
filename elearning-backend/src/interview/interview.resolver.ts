import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InterviewResponse } from './entities/interview-response.entity';
import { ChatMessageInput } from './dto/chat-message.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Resolver()
export class InterviewResolver {
    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
    ) { }

    /**
     * Check if the current user has a certificate for a specific course
     * (determines if interview is unlocked).
     */
    @Query(() => Boolean, { name: 'isInterviewUnlocked' })
    @UseGuards(JwtAuthGuard)
    async checkInterviewUnlocked(
        @Args('courseId') courseId: string,
        @CurrentUser() user: { id: string },
    ): Promise<boolean> {
        const certificate = await this.prisma.certificate.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
        });
        return !!certificate;
    }

    /**
     * Chat with AI Interviewer.
     * Prerequisite: user must have a Certificate for the specified course.
     */
    @Mutation(() => InterviewResponse)
    @UseGuards(JwtAuthGuard)
    async chatInterview(
        @Args('courseId') courseId: string,
        @Args('message') message: string,
        @Args({ name: 'history', type: () => [ChatMessageInput], defaultValue: [] }) history: ChatMessageInput[],
        @CurrentUser() user: { id: string },
    ): Promise<InterviewResponse> {
        // 1. Verify certificate exists
        const certificate = await this.prisma.certificate.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
        });

        if (!certificate) {
            throw new ForbiddenException(
                'Bạn cần hoàn thành khóa học và nhận chứng chỉ trước khi tham gia phỏng vấn AI.',
            );
        }

        // 2. Get course content for context
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        lessons: {
                            select: { title: true, body: true, type: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!course) {
            throw new NotFoundException('Khóa học không tồn tại.');
        }

        // Build course knowledge context
        let courseContext = `Khóa học: "${course.title}"\n\n`;
        for (const section of course.sections) {
            courseContext += `Chương: ${section.title}\n`;
            for (const lesson of section.lessons) {
                courseContext += `  - ${lesson.title}`;
                if (lesson.body) {
                    courseContext += `: ${lesson.body.slice(0, 500)}`;
                }
                courseContext += '\n';
            }
        }

        // 3. Call AI for interview response
        const reply = await this.aiService.conductInterview(
            courseContext,
            course.title,
            message,
            history,
        );

        return {
            reply,
            courseId,
            courseName: course.title,
        };
    }
}
