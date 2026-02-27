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
    createCourse(input: CreateCourseInput, instructorId: string): Promise<PrismaCourse>;
    updateCourse(id: string, input: UpdateCourseInput): Promise<PrismaCourse>;
    deleteCourse(id: string): Promise<PrismaCourse>;
    getPublishedCourses(): Promise<PrismaCourse[]>;
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
    }>;
    updateCurriculum(courseId: string, input: any): Promise<({
        sections: ({
            lessons: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                order: number;
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
            createdAt: Date;
            updatedAt: Date;
            title: string;
            order: number;
            courseId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        price: number;
        published: boolean;
        isActive: boolean;
        instructorId: string;
    }) | null>;
}
