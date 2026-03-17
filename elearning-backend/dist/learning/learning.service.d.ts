import { EnrollmentRepository } from './enrollment.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Enrollment as PrismaEnrollment, Progress as PrismaProgress, Certificate as PrismaCertificate, VideoProgress as PrismaVideoProgress } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GamificationService } from '../gamification/gamification.service';
import { EmailService } from '../email/email.service';
import { AiService } from '../ai/ai.service';
export interface CourseProgressData {
    enrollment: PrismaEnrollment;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    completedItems: PrismaProgress[];
}
export declare class LearningService {
    private readonly enrollmentRepository;
    private readonly prisma;
    private readonly cloudinaryService;
    private readonly gamificationService;
    private readonly emailService;
    private readonly aiService;
    constructor(enrollmentRepository: EnrollmentRepository, prisma: PrismaService, cloudinaryService: CloudinaryService, gamificationService: GamificationService, emailService: EmailService, aiService: AiService);
    markLessonComplete(userId: string, lessonId: string): Promise<PrismaProgress>;
    getProgress(userId: string, courseId: string): Promise<CourseProgressData>;
    getMyEnrollments(userId: string, take?: number, skip?: number, search?: string): Promise<{
        items: ({
            course: {
                instructor: {
                    id: string;
                    email: string;
                };
                sections: ({
                    lessons: {
                        order: number;
                        id: string;
                        title: string;
                    }[];
                } & {
                    order: number;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    courseId: string;
                })[];
            } & {
                category: string | null;
                type: import("@prisma/client").$Enums.CourseType;
                description: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                price: number;
                enrollCode: string | null;
                thumbnail: string | null;
                learningOutcomes: string;
                averageRating: number;
                reviewCount: number;
                totalDuration: number;
                published: boolean;
                isActive: boolean;
                maxStudents: number | null;
                isApprovalRequired: boolean;
                instructorId: string;
            };
            progresses: {
                id: string;
                lessonId: string;
                completedAt: Date;
            }[];
        } & {
            id: string;
            userId: string;
            courseId: string;
            status: string;
            completedLessons: string;
            isFinished: boolean;
            isLocked: boolean;
            requestedAt: Date;
            enrolledAt: Date | null;
            lastRemindedAt: Date | null;
        })[];
        totalCount: number;
        hasMore: boolean;
    }>;
    isEnrolled(userId: string, courseId: string): Promise<boolean>;
    claimCertificate(userId: string, courseId: string): Promise<PrismaCertificate>;
    getMyCertificates(userId: string): Promise<PrismaCertificate[]>;
    updateVideoProgress(userId: string, lessonId: string, currentTime: number): Promise<PrismaVideoProgress>;
    getVideoProgress(userId: string, lessonId: string): Promise<PrismaVideoProgress | null>;
    askVideoContextQuestion(lessonId: string, question: string, currentTime: number): Promise<string>;
}
