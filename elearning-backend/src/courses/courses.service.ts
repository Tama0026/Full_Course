import { Injectable, NotFoundException } from '@nestjs/common';
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

    // ==================== COURSES ====================

    /**
     * Create a new course (Instructor only).
     */
    async createCourse(
        input: CreateCourseInput,
        instructorId: string,
    ): Promise<PrismaCourse> {
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
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course) {
            throw new NotFoundException(`Course with ID "${id}" not found`);
        }
        return this.prisma.course.update({
            where: { id },
            data: { isActive: !course.isActive },
        });
    }

    /**
     * Aggregate statistics for an instructor.
     */
    async getInstructorStats(instructorId: string): Promise<{
        totalCourses: number;
        totalStudents: number;
        totalRevenue: number;
        avgCompletionRate: number;
    }> {
        // Count courses
        const totalCourses = await this.prisma.course.count({
            where: { instructorId },
        });

        // Get all instructor course IDs + prices
        const courses = await this.prisma.course.findMany({
            where: { instructorId },
            select: { id: true, price: true },
        });
        const courseIds = courses.map((c) => c.id);

        if (courseIds.length === 0) {
            return { totalCourses, totalStudents: 0, totalRevenue: 0, avgCompletionRate: 0 };
        }

        // Count unique enrolled students
        const totalStudents = await this.prisma.enrollment.count({
            where: { courseId: { in: courseIds } },
        });

        // Sum revenue from COMPLETED orders using course price
        const completedOrders = await this.prisma.order.findMany({
            where: { courseId: { in: courseIds }, status: 'COMPLETED' },
            select: { courseId: true },
        });
        const coursePriceMap = new Map(courses.map((c) => [c.id, c.price]));
        const totalRevenue = completedOrders.reduce(
            (sum, o) => sum + (coursePriceMap.get(o.courseId) ?? 0),
            0,
        );

        // Avg completion: completed progress records / (total lessons * enrolled students)
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId: { in: courseIds } } },
        });
        const completedLessons = await this.prisma.progress.count({
            where: { enrollment: { courseId: { in: courseIds } } },
        });
        const maxPossible = totalLessons * Math.max(totalStudents, 1);
        const avgCompletionRate =
            maxPossible > 0 ? Math.round((completedLessons / maxPossible) * 100) : 0;

        return { totalCourses, totalStudents, totalRevenue, avgCompletionRate };
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
