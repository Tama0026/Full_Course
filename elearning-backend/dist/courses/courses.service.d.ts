import { CourseRepository } from './course.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CreateSectionInput } from './dto/create-section.input';
import { CreateLessonInput } from './dto/create-lesson.input';
import { Course as PrismaCourse, Section, Lesson } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CoursesService {
    private readonly courseRepository;
    private readonly prisma;
    private readonly emailService;
    private readonly configService;
    private readonly aiService;
    private readonly notificationsService;
    constructor(courseRepository: CourseRepository, prisma: PrismaService, emailService: EmailService, configService: ConfigService, aiService: AiService, notificationsService: NotificationsService);
    validateCourseContent(courseId: string): Promise<void>;
    createCourse(input: CreateCourseInput, instructorId: string): Promise<PrismaCourse>;
    updateCourse(id: string, input: UpdateCourseInput): Promise<PrismaCourse>;
    deleteCourse(id: string): Promise<PrismaCourse>;
    getPublishedCourses(): Promise<PrismaCourse[]>;
    getAllCoursesForAdmin(take?: number, skip?: number, search?: string): Promise<{
        items: ({
            _count: {
                enrollments: number;
                sections: number;
            };
            instructor: {
                name: string | null;
                id: string;
                email: string;
            };
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
        })[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getCourseById(id: string): Promise<PrismaCourse>;
    getMyCourses(instructorId: string): Promise<PrismaCourse[]>;
    createSection(input: CreateSectionInput): Promise<Section>;
    deleteSection(id: string): Promise<Section>;
    createLesson(input: CreateLessonInput): Promise<Lesson>;
    deleteLesson(id: string): Promise<Lesson>;
    generateLessonTakeaways(lessonId: string): Promise<Lesson>;
    getLessonById(id: string): Promise<Lesson>;
    toggleCourseStatus(id: string): Promise<PrismaCourse>;
    getInstructorStats(instructorId: string): Promise<{
        totalCourses: number;
        totalStudents: number;
        totalRevenue: number;
        avgCompletionRate: number;
        courseBreakdown: {
            courseId: string;
            title: string;
            studentCount: number;
            completionRate: number;
            avgQuizScore: number;
        }[];
    }>;
    updateCurriculum(courseId: string, input: any): Promise<({
        sections: ({
            lessons: {
                order: number;
                type: string;
                format: string | null;
                body: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                videoUrl: string | null;
                duration: number | null;
                isPreview: boolean;
                sectionId: string;
                transcript: string | null;
                keyTakeaways: string | null;
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
    }) | null>;
    getCourseStudents(courseId: string, instructorId: string): Promise<{
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        progressPercent: number;
        lastActive: Date | undefined;
        progressTimeline: {
            lessonTitle: string;
            chapterTitle: string;
            completedAt: Date;
        }[];
        lastRemindedAt: Date | null;
        requestedAt: Date;
        enrolledAt: Date | null;
        status: string;
    }[]>;
    approveEnrollment(studentId: string, courseId: string, instructorId: string): Promise<boolean>;
    rejectEnrollment(studentId: string, courseId: string, instructorId: string): Promise<boolean>;
    sendLearningReminder(studentId: string, courseId: string, instructorId: string): Promise<boolean>;
    generateUniqueEnrollCode(category?: string): Promise<string>;
    enrollByCode(code: string, userId: string): Promise<{
        course: {
            instructor: {
                name: string | null;
                id: string;
                email: string;
            };
            sections: ({
                lessons: {
                    order: number;
                    type: string;
                    format: string | null;
                    body: string | null;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    videoUrl: string | null;
                    duration: number | null;
                    isPreview: boolean;
                    sectionId: string;
                    transcript: string | null;
                    keyTakeaways: string | null;
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
    }>;
    getDiscoveryCourses(search?: string, category?: string, take?: number, skip?: number, minRating?: number, priceMin?: number, priceMax?: number, sortBy?: string): Promise<{
        items: ({
            _count: {
                enrollments: number;
            };
            instructor: {
                name: string | null;
                id: string;
                email: string;
            };
            sections: ({
                lessons: {
                    order: number;
                    id: string;
                    title: string;
                    duration: number | null;
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
        })[];
        totalCount: number;
        hasMore: boolean;
    }>;
}
