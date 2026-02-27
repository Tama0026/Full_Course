import { EnrollmentRepository } from './enrollment.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Enrollment as PrismaEnrollment, Progress as PrismaProgress, Certificate as PrismaCertificate, VideoProgress as PrismaVideoProgress } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
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
    constructor(enrollmentRepository: EnrollmentRepository, prisma: PrismaService, cloudinaryService: CloudinaryService);
    markLessonComplete(userId: string, lessonId: string): Promise<PrismaProgress>;
    getProgress(userId: string, courseId: string): Promise<CourseProgressData>;
    getMyEnrollments(userId: string): Promise<PrismaEnrollment[]>;
    isEnrolled(userId: string, courseId: string): Promise<boolean>;
    claimCertificate(userId: string, courseId: string): Promise<PrismaCertificate>;
    getMyCertificates(userId: string): Promise<PrismaCertificate[]>;
    updateVideoProgress(userId: string, lessonId: string, currentTime: number): Promise<PrismaVideoProgress>;
    getVideoProgress(userId: string, lessonId: string): Promise<PrismaVideoProgress | null>;
}
