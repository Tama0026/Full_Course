import { Resolver, Query, Mutation, Args, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../common/guards/resource-owner.guard';
import { EnrollmentGuard } from '../common/guards/enrollment.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Resolver(() => Lesson)
export class LessonResolver {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly prisma: PrismaService,
    ) { }

    private async checkLessonAuthorization(lesson: Lesson, context: any): Promise<boolean> {
        // 1. Preview lessons → public
        if ((lesson as any).isPreview) return true;

        // 2. Check authentication
        const req = context.req;
        const user = req?.user;
        if (!user) return false;

        // 3. Admin → full access
        if (user.role === 'ADMIN') return true;

        // 4. Determine courseId
        if (!req.authorizedCourses) req.authorizedCourses = {};

        let courseId = (lesson as any).section?.courseId;
        if (!courseId) {
            const section = await this.prisma.section.findUnique({
                where: { id: lesson.sectionId },
                select: { courseId: true },
            });
            courseId = section?.courseId;
        }
        if (!courseId) return false;

        // Return from per-request cache
        if (req.authorizedCourses[courseId] !== undefined) {
            return req.authorizedCourses[courseId];
        }

        let isAuthorized = false;

        // 5. Instructor who owns the course
        if (user.role === 'INSTRUCTOR') {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                select: { instructorId: true },
            });
            if (course?.instructorId === user.id) isAuthorized = true;
        }

        // 6. Check enrollment (student purchased the course)
        if (!isAuthorized) {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId } },
            });
            if (enrollment) isAuthorized = true;
        }

        // Cache for this request
        req.authorizedCourses[courseId] = isAuthorized;

        return isAuthorized;
    }

    private async checkLessonLockStatus(lesson: Lesson, context: any): Promise<boolean> {
        if ((lesson as any).isPreview) return false;

        const req = context.req;
        const user = req?.user;
        if (!user || user.role !== 'STUDENT') return false;

        let courseId = (lesson as any).section?.courseId;
        if (!courseId) {
            const section = await this.prisma.section.findUnique({
                where: { id: lesson.sectionId },
                select: { courseId: true },
            });
            courseId = section?.courseId;
        }
        if (!courseId) return false;

        // Ensure user is enrolled
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
        });

        if (!enrollment) return true;

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
        const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);

        if (currentIndex > 0) {
            const prevLesson = allLessons[currentIndex - 1];
            // Only require completion if the previous lesson had a Quiz
            const prevQuiz = await this.prisma.quiz.findUnique({
                where: { lessonId: prevLesson.id }
            });

            if (prevQuiz) {
                let completedLessons: string[] = [];
                try {
                    // Force any type to bypass cache type issues
                    const rawEnrollment = enrollment as any;
                    completedLessons = JSON.parse(rawEnrollment.completedLessons || '[]');
                } catch (e) { }

                if (!completedLessons.includes(prevLesson.id)) {
                    return true; // Locked!
                }
            }
        }

        return false;
    }

    @ResolveField('isLocked', () => Boolean)
    async resolveIsLocked(
        @Parent() lesson: Lesson,
        @Context() context: any,
    ): Promise<boolean> {
        return this.checkLessonLockStatus(lesson, context);
    }

    @ResolveField('videoUrl', () => String, { nullable: true })
    async resolveVideoUrl(
        @Parent() lesson: Lesson,
        @Context() context: any,
    ): Promise<string | null> {
        const rawUrl = lesson.videoUrl;
        if (!rawUrl || rawUrl.trim() === '') return null;

        const isAuthorized = await this.checkLessonAuthorization(lesson, context);
        if (!isAuthorized) return null;

        const isLocked = await this.checkLessonLockStatus(lesson, context);
        return isLocked ? null : rawUrl;
    }

    @ResolveField('body', () => String, { nullable: true })
    async resolveBody(
        @Parent() lesson: Lesson,
        @Context() context: any,
    ): Promise<string | null> {
        const bodyContent = lesson.body;
        if (!bodyContent || bodyContent.trim() === '') return null;

        const isAuthorized = await this.checkLessonAuthorization(lesson, context);
        if (!isAuthorized) return null;

        const isLocked = await this.checkLessonLockStatus(lesson, context);
        return isLocked ? null : bodyContent;
    }
}

@Resolver(() => Course)
export class CoursesResolver {
    constructor(private readonly coursesService: CoursesService) { }

    // ==================== RESOLVE FIELDS ====================

    @ResolveField('learningOutcomes', () => [String])
    resolveLearningOutcomes(@Parent() course: any): string[] {
        if (Array.isArray(course.learningOutcomes)) return course.learningOutcomes;
        try {
            return JSON.parse(course.learningOutcomes || '[]');
        } catch {
            return [];
        }
    }

    // ==================== PUBLIC QUERIES ====================

    /**
     * Get all published courses (public catalog).
     */
    @Query(() => [Course], { name: 'courses' })
    @UseGuards(OptionalJwtAuthGuard)
    async getCourses(): Promise<Course[]> {
        return this.coursesService.getPublishedCourses() as unknown as Course[];
    }

    /**
     * Get a single course by ID.
     */
    @Query(() => Course, { name: 'course' })
    @UseGuards(OptionalJwtAuthGuard)
    async getCourse(@Args('id') id: string): Promise<Course> {
        return this.coursesService.getCourseById(id) as unknown as Course;
    }

    // ==================== INSTRUCTOR QUERIES ====================

    /**
     * Get all courses owned by the authenticated instructor.
     */
    @Query(() => [Course], { name: 'myCourses' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async getMyCourses(
        @CurrentUser() user: { id: string },
    ): Promise<Course[]> {
        return this.coursesService.getMyCourses(user.id) as unknown as Course[];
    }

    // ==================== COURSE MUTATIONS (INSTRUCTOR/ADMIN) ====================

    /**
     * Create a new course (Instructor only).
     */
    @Mutation(() => Course)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async createCourse(
        @Args('input') input: CreateCourseInput,
        @CurrentUser() user: { id: string },
    ): Promise<Course> {
        return this.coursesService.createCourse(
            input,
            user.id,
        ) as unknown as Course;
    }

    /**
     * Update a course (Owner Instructor or Admin only).
     */
    @Mutation(() => Course)
    @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async updateCourse(
        @Args('id') id: string,
        @Args('input') input: UpdateCourseInput,
    ): Promise<Course> {
        return this.coursesService.updateCourse(id, input) as unknown as Course;
    }

    /**
     * Update entire curriculum (Sections + Lessons) for a course
     */
    @Mutation(() => Course)
    @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async updateCurriculum(
        @Args('id') id: string,
        @Args('input') input: UpdateCurriculumInput,
    ): Promise<Course> {
        return this.coursesService.updateCurriculum(id, input) as unknown as Course;
    }

    /**
     * Delete a course (Owner Instructor or Admin only).
     */
    @Mutation(() => Course)
    @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async deleteCourse(@Args('id') id: string): Promise<Course> {
        return this.coursesService.deleteCourse(id) as unknown as Course;
    }

    // ==================== SECTION MUTATIONS ====================

    /**
     * Create a section in a course (Owner Instructor or Admin).
     */
    @Mutation(() => Section)
    @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async createSection(
        @Args('input') input: CreateSectionInput,
    ): Promise<Section> {
        return this.coursesService.createSection(input) as unknown as Section;
    }

    /**
     * Delete a section (Owner Instructor or Admin).
     */
    @Mutation(() => Section)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async deleteSection(@Args('id') id: string): Promise<Section> {
        return this.coursesService.deleteSection(id) as unknown as Section;
    }

    // ==================== LESSON MUTATIONS & QUERIES ====================

    /**
     * Create a lesson in a section (Owner Instructor or Admin).
     */
    @Mutation(() => Lesson)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async createLesson(
        @Args('input') input: CreateLessonInput,
    ): Promise<Lesson> {
        return this.coursesService.createLesson(input) as unknown as Lesson;
    }

    /**
     * Delete a lesson (Owner Instructor or Admin).
     */
    @Mutation(() => Lesson)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async deleteLesson(@Args('id') id: string): Promise<Lesson> {
        return this.coursesService.deleteLesson(id) as unknown as Lesson;
    }

    /**
     * Get a lesson by ID. Protected directly by EnrollmentGuard.
     * Users calling this without access/enrollment receive a Forbidden Exception,
     * UNLESS it is an isPreview lesson.
     */
    @Query(() => Lesson, { name: 'lesson' })
    @UseGuards(OptionalJwtAuthGuard, EnrollmentGuard)
    async getLesson(@Args('lessonId') lessonId: string): Promise<Lesson> {
        return this.coursesService.getLessonById(lessonId) as unknown as Lesson;
    }

    // ==================== PUBLISH / ACTIVE TOGGLE ====================

    /**
     * Toggle course isActive status (Instructor owner only).
     */
    @Mutation(() => Course)
    @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async toggleCourseStatus(
        @Args('id') id: string,
    ): Promise<Course> {
        return this.coursesService.toggleCourseStatus(id) as unknown as Course;
    }

    // ==================== ANALYTICS ====================

    /**
     * Get aggregated stats for the current instructor.
     */
    @Query(() => InstructorStats, { name: 'instructorStats' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async getInstructorStats(
        @CurrentUser() user: { id: string },
    ): Promise<InstructorStats> {
        return this.coursesService.getInstructorStats(user.id);
    }
}
