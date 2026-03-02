import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { Section } from './entities/section.entity';
import { Lesson } from './entities/lesson.entity';
import { InstructorStats } from './entities/instructor-stats.entity';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CreateSectionInput } from './dto/create-section.input';
import { CreateLessonInput } from './dto/create-lesson.input';
import { UpdateCurriculumInput } from './dto/update-curriculum.input';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class LessonResolver {
    private readonly cloudinaryService;
    private readonly prisma;
    constructor(cloudinaryService: CloudinaryService, prisma: PrismaService);
    private checkLessonAuthorization;
    private checkLessonLockStatus;
    resolveIsLocked(lesson: Lesson, context: any): Promise<boolean>;
    resolveVideoUrl(lesson: Lesson, context: any): Promise<string | null>;
    resolveBody(lesson: Lesson, context: any): Promise<string | null>;
}
export declare class CoursesResolver {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    resolveLearningOutcomes(course: any): string[];
    getCourses(): Promise<Course[]>;
    getCourse(id: string): Promise<Course>;
    getMyCourses(user: {
        id: string;
    }): Promise<Course[]>;
    createCourse(input: CreateCourseInput, user: {
        id: string;
    }): Promise<Course>;
    updateCourse(id: string, input: UpdateCourseInput): Promise<Course>;
    updateCurriculum(id: string, input: UpdateCurriculumInput): Promise<Course>;
    deleteCourse(id: string): Promise<Course>;
    createSection(input: CreateSectionInput): Promise<Section>;
    deleteSection(id: string): Promise<Section>;
    createLesson(input: CreateLessonInput): Promise<Lesson>;
    deleteLesson(id: string): Promise<Lesson>;
    getLesson(lessonId: string): Promise<Lesson>;
    toggleCourseStatus(id: string): Promise<Course>;
    getInstructorStats(user: {
        id: string;
    }): Promise<InstructorStats>;
}
