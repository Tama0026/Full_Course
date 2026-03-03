import { CourseRepository } from './course.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CreateSectionInput } from './dto/create-section.input';
import { CreateLessonInput } from './dto/create-lesson.input';
import { Course as PrismaCourse, Section, Lesson } from '@prisma/client';
export declare class CoursesService {
    private readonly courseRepository;
    private readonly prisma;
    constructor(courseRepository: CourseRepository, prisma: PrismaService);
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
            id: string;
            name: string | null;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        category: string | null;
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
                id: string;
                createdAt: Date;
                order: number;
                updatedAt: Date;
                title: string;
                type: string;
                videoUrl: string | null;
                body: string | null;
                duration: number | null;
                format: string | null;
                isPreview: boolean;
                sectionId: string;
            }[];
        } & {
            id: string;
            courseId: string;
            createdAt: Date;
            order: number;
            updatedAt: Date;
            title: string;
        })[];
    } & {
        id: string;
        description: string;
        createdAt: Date;
        category: string | null;
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
