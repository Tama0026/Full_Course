import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LearningService } from './learning.service';
import { Enrollment } from './entities/enrollment.entity';
import { Progress } from './entities/progress.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { Certificate } from './entities/certificate.entity';
import { VideoProgress } from './entities/video-progress.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { EnrollmentGuard } from '../common/guards/enrollment.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver()
export class LearningResolver {
    constructor(private readonly learningService: LearningService) { }

    /**
     * Mark a lesson as complete.
     * Protected by JwtAuthGuard + EnrollmentGuard.
     */
    @Mutation(() => Progress)
    @UseGuards(JwtAuthGuard, EnrollmentGuard)
    async markLessonComplete(
        @Args('lessonId') lessonId: string,
        @CurrentUser() user: { id: string },
    ): Promise<Progress> {
        return this.learningService.markLessonComplete(
            user.id,
            lessonId,
        ) as unknown as Progress;
    }

    /**
     * Get progress for a specific course (optional auth to support guest views).
     */
    @Query(() => CourseProgress, { name: 'courseProgress' })
    @UseGuards(OptionalJwtAuthGuard)
    async getCourseProgress(
        @Args('courseId') courseId: string,
        @CurrentUser() user: { id: string } | null,
    ): Promise<CourseProgress> {
        if (!user) return { completedItems: [], progressPercentage: 0 } as any;
        return this.learningService.getProgress(
            user.id,
            courseId,
        ) as unknown as CourseProgress;
    }

    /**
     * Get all enrolled courses for the current user.
     */
    @Query(() => [Enrollment], { name: 'myEnrollments' })
    @UseGuards(JwtAuthGuard)
    async getMyEnrollments(
        @CurrentUser() user: { id: string },
    ): Promise<Enrollment[]> {
        return this.learningService.getMyEnrollments(
            user.id,
        ) as unknown as Enrollment[];
    }

    /**
     * Check if the current user is enrolled in a specific course.
     */
    @Query(() => Boolean, { name: 'isEnrolled' })
    @UseGuards(OptionalJwtAuthGuard)
    async checkIsEnrolled(
        @Args('courseId') courseId: string,
        @CurrentUser() user: { id: string } | null,
    ): Promise<boolean> {
        if (!user) return false;
        return this.learningService.isEnrolled(user.id, courseId);
    }

    /**
     * Claim or get certificate for a completed course
     */
    @Mutation(() => Certificate)
    @UseGuards(JwtAuthGuard, EnrollmentGuard)
    async claimCertificate(
        @Args('courseId') courseId: string,
        @CurrentUser() user: { id: string },
    ): Promise<Certificate> {
        return this.learningService.claimCertificate(user.id, courseId) as unknown as Certificate;
    }

    /**
     * Get all certificates for the current user
     */
    @Query(() => [Certificate], { name: 'myCertificates' })
    @UseGuards(JwtAuthGuard)
    async getMyCertificates(
        @CurrentUser() user: { id: string },
    ): Promise<Certificate[]> {
        return this.learningService.getMyCertificates(user.id) as unknown as Certificate[];
    }

    /**
     * Save video playback position (upsert) for cross-device resume.
     */
    @Mutation(() => VideoProgress)
    @UseGuards(JwtAuthGuard)
    async updateVideoProgress(
        @CurrentUser() user: { id: string },
        @Args('lessonId') lessonId: string,
        @Args('currentTime', { type: () => Number }) currentTime: number,
    ): Promise<VideoProgress> {
        return this.learningService.updateVideoProgress(
            user.id,
            lessonId,
            currentTime,
        ) as unknown as VideoProgress;
    }

    /**
     * Get saved video position for a specific lesson.
     */
    @Query(() => VideoProgress, { name: 'videoProgress', nullable: true })
    @UseGuards(JwtAuthGuard)
    async getVideoProgress(
        @CurrentUser() user: { id: string },
        @Args('lessonId') lessonId: string,
    ): Promise<VideoProgress | null> {
        return this.learningService.getVideoProgress(
            user.id,
            lessonId,
        ) as unknown as VideoProgress | null;
    }
}
