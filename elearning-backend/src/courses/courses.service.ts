import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CreateSectionInput } from './dto/create-section.input';
import { CreateLessonInput } from './dto/create-lesson.input';
import { Course as PrismaCourse, Section, Lesson } from '@prisma/client';

@Injectable()
export class CoursesService {
    constructor(
        private readonly courseRepository: CourseRepository,
        private readonly prisma: PrismaService,
    ) { }

    // ==================== VALIDATION ====================

    /**
     * Validate that all lessons in a course have body content and a quiz.
     * Throws BadRequestException with detailed error listing invalid lessons.
     */
    async validateCourseContent(courseId: string): Promise<void> {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        lessons: {
                            include: { quiz: true }
                        }
                    }
                }
            }
        });

        if (!course) {
            throw new NotFoundException(`Course with ID "${courseId}" not found`);
        }

        const allLessons = course.sections.flatMap(s => s.lessons);

        if (allLessons.length === 0) {
            throw new BadRequestException(
                'Không thể công khai khóa học. Khóa học chưa có bài học nào.'
            );
        }

        const invalidLessons = allLessons.filter(lesson =>
            !lesson.body || lesson.body.trim() === '' || !lesson.quiz
        );

        if (invalidLessons.length > 0) {
            const errorDetails = invalidLessons.map(l =>
                `Bài học "${l.title}" thiếu nội dung văn bản (body) hoặc chưa có bài trắc nghiệm (quiz).`
            ).join(' ');
            throw new BadRequestException(
                `Không thể công khai khóa học vì có bài học chưa hoàn thiện nội dung. ${errorDetails}`
            );
        }
    }

    // ==================== COURSES ====================

    /**
     * Create a new course (Instructor only).
     * If published/isActive is requested, validate content first.
     */
    async createCourse(
        input: CreateCourseInput,
        instructorId: string,
    ): Promise<PrismaCourse> {
        // Block publishing on creation if requested (new course has no lessons)
        if (input.published || (input as any).isActive) {
            // A new course can never be published because it has no lessons yet
            throw new BadRequestException(
                'Không thể công khai khóa học khi tạo mới. Vui lòng tạo bài học và quiz trước, sau đó bật công khai.'
            );
        }

        return this.courseRepository.create({
            ...input,
            instructorId,
        }) as Promise<PrismaCourse>;
    }

    /**
     * Update an existing course (Instructor + Owner only).
     */
    async updateCourse(
        id: string,
        input: UpdateCourseInput,
    ): Promise<PrismaCourse> {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new NotFoundException(`Course with ID "${id}" not found`);
        }

        // If trying to publish/activate, validate all lessons have content + quiz
        if (input.published === true || input.isActive === true) {
            await this.validateCourseContent(id);
        }

        return this.courseRepository.update(id, {
            ...input,
        }) as Promise<PrismaCourse>;
    }

    /**
     * Delete a course (Instructor + Owner or Admin only).
     */
    async deleteCourse(id: string): Promise<PrismaCourse> {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new NotFoundException(`Course with ID "${id}" not found`);
        }

        return this.courseRepository.delete(id) as Promise<PrismaCourse>;
    }

    /**
     * Get all published courses (Public).
     */
    async getPublishedCourses(): Promise<PrismaCourse[]> {
        return this.courseRepository.findPublished();
    }

    /**
     * Get a single course by ID with full relations.
     */
    async getCourseById(id: string): Promise<PrismaCourse> {
        const course = await this.courseRepository.findByIdWithRelations(id);
        if (!course) {
            throw new NotFoundException(`Course with ID "${id}" not found`);
        }
        return course;
    }

    /**
     * Get all courses by a specific instructor.
     */
    async getMyCourses(instructorId: string): Promise<PrismaCourse[]> {
        return this.courseRepository.findByInstructor(instructorId);
    }

    // ==================== SECTIONS ====================

    /**
     * Create a new section for a course.
     */
    async createSection(input: CreateSectionInput): Promise<Section> {
        return this.prisma.section.create({
            data: {
                title: input.title,
                order: input.order,
                courseId: input.courseId,
            },
            include: { lessons: true },
        });
    }

    /**
     * Delete a section by ID.
     */
    async deleteSection(id: string): Promise<Section> {
        const section = await this.prisma.section.findUnique({ where: { id } });
        if (!section) {
            throw new NotFoundException(`Section with ID "${id}" not found`);
        }
        return this.prisma.section.delete({ where: { id } });
    }

    // ==================== LESSONS ====================

    /**
     * Create a new lesson for a section.
     */
    async createLesson(input: CreateLessonInput): Promise<Lesson> {
        // @ts-ignore
        return this.prisma.lesson.create({
            data: {
                title: input.title,
                type: input.type || 'VIDEO',
                videoUrl: input.videoUrl || null,
                body: input.body || null,
                order: input.order,
                sectionId: input.sectionId,
            },
        });
    }

    /**
     * Delete a lesson by ID.
     */
    async deleteLesson(id: string): Promise<Lesson> {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID "${id}" not found`);
        }
        return this.prisma.lesson.delete({ where: { id } });
    }

    /**
     * Get a lesson by ID (protected by EnrollmentGuard).
     */
    async getLessonById(id: string): Promise<Lesson> {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { section: true },
        });
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID "${id}" not found`);
        }
        return lesson;
    }

    /**
     * Toggle isActive status of a course.
     */
    async toggleCourseStatus(id: string): Promise<PrismaCourse> {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            throw new NotFoundException(`Course with ID "${id}" not found`);
        }

        // If we are about to publish the course (isActive: false -> true)
        if (!course.isActive) {
            await this.validateCourseContent(id);
        }

        return this.prisma.course.update({
            where: { id },
            data: { isActive: !course.isActive },
        });
    }

    /**
     * Aggregate statistics for an instructor, including per-course breakdown.
     */
    async getInstructorStats(instructorId: string): Promise<{
        totalCourses: number;
        totalStudents: number;
        totalRevenue: number;
        avgCompletionRate: number;
        courseBreakdown: { courseId: string; title: string; studentCount: number; completionRate: number; avgQuizScore: number }[];
    }> {
        // All instructor courses with title
        const courses = await this.prisma.course.findMany({
            where: { instructorId },
            select: { id: true, title: true, price: true },
        });
        const totalCourses = courses.length;
        const courseIds = courses.map((c) => c.id);

        if (courseIds.length === 0) {
            return { totalCourses, totalStudents: 0, totalRevenue: 0, avgCompletionRate: 0, courseBreakdown: [] };
        }

        // Enrollments per course
        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            select: { id: true, courseId: true },
        });
        const totalStudents = enrollments.length;

        // Revenue
        const completedOrders = await this.prisma.order.findMany({
            where: { courseId: { in: courseIds }, status: 'COMPLETED' },
            select: { courseId: true },
        });
        const coursePriceMap = new Map(courses.map((c) => [c.id, c.price]));
        const totalRevenue = completedOrders.reduce(
            (sum, o) => sum + (coursePriceMap.get(o.courseId) ?? 0),
            0,
        );

        // Completion rate (global)
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId: { in: courseIds } } },
        });
        const completedLessons = await this.prisma.progress.count({
            where: { enrollment: { courseId: { in: courseIds } } },
        });
        const maxPossible = totalLessons * Math.max(totalStudents, 1);
        const avgCompletionRate = maxPossible > 0 ? Math.round((completedLessons / maxPossible) * 100) : 0;

        // --- Per-course breakdown ---
        const courseBreakdown = await Promise.all(
            courses.map(async (course) => {
                const courseEnrollmentIds = enrollments
                    .filter((e) => e.courseId === course.id)
                    .map((e) => e.id);
                const studentCount = courseEnrollmentIds.length;

                // Completion rate for this course
                const courseLessons = await this.prisma.lesson.count({
                    where: { section: { courseId: course.id } },
                });
                const courseCompletedLessons = await this.prisma.progress.count({
                    where: { enrollmentId: { in: courseEnrollmentIds } },
                });
                const maxPoss = courseLessons * Math.max(studentCount, 1);
                const completionRate = maxPoss > 0 ? Math.round((courseCompletedLessons / maxPoss) * 100) : 0;

                // Average quiz score for this course (from QuizSubmission if exists)
                let avgQuizScore = 0;
                try {
                    const submissions = await (this.prisma as any).quizSubmission.findMany({
                        where: { quiz: { lesson: { section: { courseId: course.id } } } },
                        select: { score: true, totalQuestions: true },
                    });
                    if (submissions.length > 0) {
                        const totalScore = submissions.reduce((sum: number, s: any) =>
                            sum + (s.totalQuestions > 0 ? (s.score / s.totalQuestions) * 100 : 0), 0
                        );
                        avgQuizScore = Math.round(totalScore / submissions.length);
                    }
                } catch { /* quizSubmission table may not exist */ }

                return { courseId: course.id, title: course.title, studentCount, completionRate, avgQuizScore };
            }),
        );

        return { totalCourses, totalStudents, totalRevenue, avgCompletionRate, courseBreakdown };
    }

    async updateCurriculum(courseId: string, input: any) {
        // Run everything in a transaction to prevent partial updates
        return this.prisma.$transaction(async (tx) => {
            const existingSections = await tx.section.findMany({
                where: { courseId },
                include: { lessons: true },
            });

            const incomingSectionIds = input.sections.map((s: any) => s.id).filter(Boolean);
            const sectionsToDelete = existingSections.filter((es) => !incomingSectionIds.includes(es.id));

            // Delete removed sections (cascades to lessons)
            if (sectionsToDelete.length > 0) {
                await tx.section.deleteMany({
                    where: { id: { in: sectionsToDelete.map((s) => s.id) } },
                });
            }

            // UPSERT sections
            for (let i = 0; i < input.sections.length; i++) {
                const sData = input.sections[i];
                let sectionId = sData.id;

                if (sectionId && existingSections.some(es => es.id === sectionId)) {
                    await tx.section.update({
                        where: { id: sectionId },
                        data: { title: sData.title, order: i },
                    });
                } else {
                    const newSection = await tx.section.create({
                        data: {
                            title: sData.title,
                            order: i,
                            courseId,
                        },
                    });
                    sectionId = newSection.id;
                }

                // UPSERT lessons inside this section
                const existingLessons = existingSections.find((es) => es.id === sectionId)?.lessons || [];
                const incomingLessonIds = sData.lessons.map((l: any) => l.id).filter(Boolean);
                const lessonsToDelete = existingLessons.filter((el) => !incomingLessonIds.includes(el.id));

                if (lessonsToDelete.length > 0) {
                    await tx.lesson.deleteMany({
                        where: { id: { in: lessonsToDelete.map((l) => l.id) } },
                    });
                }

                for (let j = 0; j < sData.lessons.length; j++) {
                    const lData = sData.lessons[j];
                    if (lData.id && existingLessons.some(el => el.id === lData.id)) {
                        await tx.lesson.update({
                            where: { id: lData.id },
                            data: {
                                title: lData.title,
                                type: lData.type || 'VIDEO',
                                videoUrl: lData.videoUrl,
                                body: lData.body,
                                duration: lData.duration,
                                isPreview: lData.isPreview,
                                order: j,
                            },
                        });
                    } else {
                        await tx.lesson.create({
                            data: {
                                title: lData.title,
                                type: lData.type || 'VIDEO',
                                videoUrl: lData.videoUrl,
                                body: lData.body,
                                duration: lData.duration,
                                isPreview: lData.isPreview,
                                order: j,
                                sectionId: sectionId,
                            },
                        });
                    }
                }
            }

            return tx.course.findUnique({
                where: { id: courseId },
                include: {
                    sections: {
                        include: { lessons: { orderBy: { order: 'asc' } } },
                        orderBy: { order: 'asc' },
                    },
                },
            });
        });
    }
}
