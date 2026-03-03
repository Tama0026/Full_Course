import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { EnrollmentRepository } from './enrollment.repository';
import { PrismaService } from '../prisma/prisma.service';
import {
    Enrollment as PrismaEnrollment,
    Progress as PrismaProgress,
    Certificate as PrismaCertificate,
    VideoProgress as PrismaVideoProgress,
} from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GamificationService } from '../gamification/gamification.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

/** Shape returned by getProgress including computed fields */
export interface CourseProgressData {
    enrollment: PrismaEnrollment;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    completedItems: PrismaProgress[];
}

@Injectable()
export class LearningService {
    constructor(
        private readonly enrollmentRepository: EnrollmentRepository,
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly gamificationService: GamificationService,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Mark a lesson as complete for the current user.
     * Creates a Progress record.
     */
    async markLessonComplete(
        userId: string,
        lessonId: string,
    ): Promise<PrismaProgress> {
        // Get the lesson to find its course
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { section: { select: { courseId: true } } },
        });

        if (!lesson) {
            throw new NotFoundException(`Lesson with ID "${lessonId}" not found`);
        }

        const courseId = lesson.section.courseId;

        // Find the enrollment
        const enrollment = await this.enrollmentRepository.findByUserAndCourse(
            userId,
            courseId,
        );

        if (!enrollment) {
            throw new NotFoundException(
                'You are not enrolled in this course',
            );
        }

        // Check if the lesson is locked
        if (!lesson.isPreview) {
            const sections = await this.prisma.section.findMany({
                where: { courseId },
                select: {
                    id: true,
                    lessons: {
                        select: { id: true, type: true },
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { order: 'asc' },
            });

            const allLessons = sections.flatMap((s) => s.lessons);
            const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

            if (currentIndex > 0) {
                const prevLesson = allLessons[currentIndex - 1];
                const prevQuiz = await this.prisma.quiz.findUnique({
                    where: { lessonId: prevLesson.id }
                });

                if (prevQuiz) {
                    let completedLessons: string[] = [];
                    try {
                        const rawEnrollment = enrollment as any;
                        completedLessons = JSON.parse(rawEnrollment.completedLessons || '[]');
                    } catch (e) { }

                    if (!completedLessons.includes(prevLesson.id)) {
                        throw new ForbiddenException('Lesson is locked. Please complete the previous lesson and its quiz first.');
                    }
                }
            }
        }

        // Check if already completed
        const existingProgress = await this.prisma.progress.findUnique({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: enrollment.id,
                    lessonId,
                },
            },
        });

        if (existingProgress) {
            throw new ConflictException('Lesson already marked as complete');
        }

        // Create progress record
        const progress = await this.prisma.progress.create({
            data: {
                enrollmentId: enrollment.id,
                lessonId,
            },
            include: { lesson: true },
        });

        // Gamification: +5 points for completing a lesson
        await this.gamificationService.addPoints(userId, 5);

        return progress;
    }

    /**
     * Get learning progress for a specific course.
     * Calculates completion percentage.
     */
    async getProgress(
        userId: string,
        courseId: string,
    ): Promise<CourseProgressData> {
        const enrollment = await this.enrollmentRepository.findByUserAndCourse(
            userId,
            courseId,
        );

        if (!enrollment) {
            throw new NotFoundException(
                'You are not enrolled in this course',
            );
        }

        // Count total lessons in the course
        const totalLessons = await this.prisma.lesson.count({
            where: {
                section: { courseId },
            },
        });

        // Count completed lessons
        const completedLessons = await this.prisma.progress.count({
            where: {
                enrollmentId: enrollment.id,
            },
        });

        // Get completed progress items
        const completedItems = await this.prisma.progress.findMany({
            where: {
                enrollmentId: enrollment.id,
            },
            include: { lesson: true },
            orderBy: { completedAt: 'desc' },
        });

        // Calculate percentage
        const progressPercentage =
            totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
                : 0;

        return {
            enrollment,
            progressPercentage,
            completedLessons,
            totalLessons,
            completedItems,
        };
    }

    /**
     * Get all enrollments for the current user.
     */
    async getMyEnrollments(userId: string): Promise<PrismaEnrollment[]> {
        return this.enrollmentRepository.findByUserId(userId);
    }

    /**
     * Check if a user is enrolled in a specific course.
     */
    async isEnrolled(userId: string, courseId: string): Promise<boolean> {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        return !!enrollment;
    }

    /**
     * Generate or Get Certificate for a completed course
     */
    async claimCertificate(userId: string, courseId: string): Promise<PrismaCertificate> {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
            include: { user: true, course: true },
        });

        if (!enrollment) {
            throw new BadRequestException('Bạn chưa đăng ký khóa học này!');
        }

        // Check actual progress: count completed lessons vs total lessons
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId } },
        });

        const completedLessons = await this.prisma.progress.count({
            where: { enrollmentId: enrollment.id },
        });

        if (totalLessons === 0 || completedLessons < totalLessons) {
            throw new BadRequestException(
                `Bạn chưa hoàn thành khóa học này! (${completedLessons}/${totalLessons} bài học)`,
            );
        }

        // Auto-update isFinished if not already set
        if (!enrollment.isFinished) {
            await this.prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { isFinished: true },
            });
        }

        // Check if certificate already exists
        let certificate = await this.prisma.certificate.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });

        if (certificate) {
            return certificate;
        }

        const studentName = enrollment.user.name || 'Học viên';
        const courseName = enrollment.course.title;
        const issueDateObj = new Date();
        const issueDateStr = `${issueDateObj.getDate()}/${issueDateObj.getMonth() + 1}/${issueDateObj.getFullYear()}`;

        const certificateUrl = this.cloudinaryService.generateCertificateUrl(
            studentName,
            courseName,
            issueDateStr
        );

        certificate = await this.prisma.certificate.create({
            data: {
                certificateCode: `CERT-${uuidv4().split('-')[0].toUpperCase()}`,
                userId,
                courseId,
                courseNameAtIssue: courseName,
                certificateUrl,
                issueDate: issueDateObj,
            }
        });

        // Send congratulatory email with certificate
        const userEmail = enrollment.user.email;
        this.emailService.sendCertificateEmail(
            userEmail,
            studentName,
            courseName,
            certificateUrl,
        ).catch(err => console.error('[LearningService] Email send failed:', err.message));

        return certificate;
    }

    /**
     * Get all certificates for the current user
     */
    async getMyCertificates(userId: string): Promise<PrismaCertificate[]> {
        return this.prisma.certificate.findMany({
            where: { userId },
            orderBy: { issueDate: 'desc' },
        });
    }

    /**
     * Update (or create) the saved video playback position for a lesson.
     * Allows cross-device resume functionality.
     */
    async updateVideoProgress(
        userId: string,
        lessonId: string,
        currentTime: number,
    ): Promise<PrismaVideoProgress> {
        return this.prisma.videoProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { currentTime },
            create: { userId, lessonId, currentTime },
        });
    }

    /**
     * Get the saved video playback position for a lesson.
     * Returns null if no position has been saved yet.
     */
    async getVideoProgress(
        userId: string,
        lessonId: string,
    ): Promise<PrismaVideoProgress | null> {
        return this.prisma.videoProgress.findUnique({
            where: { userId_lessonId: { userId, lessonId } },
        });
    }
}
