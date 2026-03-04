import { CourseRepository } from './course.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CreateSectionInput } from './dto/create-section.input';
import { CreateLessonInput } from './dto/create-lesson.input';
import { Course as PrismaCourse, Section, Lesson } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
export declare class CoursesService {
    private readonly courseRepository;
    private readonly prisma;
    private readonly emailService;
    private readonly configService;
    constructor(courseRepository: CourseRepository, prisma: PrismaService, emailService: EmailService, configService: ConfigService);
    validateCourseContent(courseId: string): Promise<void>;
    createCourse(input: CreateCourseInput, instructorId: string): Promise<PrismaCourse>;
    updateCourse(id: string, input: UpdateCourseInput): Promise<PrismaCourse>;
    deleteCourse(id: string): Promise<PrismaCourse>;
    getPublishedCourses(): Promise<PrismaCourse[]>;
    getAllCoursesForAdmin(): Promise<({
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
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        price: number;
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
    })[]>;
    getCourseById(id: string): Promise<PrismaCourse>;
    getMyCourses(instructorId: string): Promise<PrismaCourse[]>;
    createSection(input: CreateSectionInput): Promise<Section>;
    deleteSection(id: string): Promise<Section>;
    createLesson(input: CreateLessonInput): Promise<Lesson>;
    deleteLesson(id: string): Promise<Lesson>;
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
            }[];
        } & {
            order: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            title: string;
        })[];
    } & {
        category: string | null;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        price: number;
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
}
