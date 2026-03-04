"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const course_repository_1 = require("./course.repository");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const config_1 = require("@nestjs/config");
let CoursesService = class CoursesService {
    courseRepository;
    prisma;
    emailService;
    configService;
    constructor(courseRepository, prisma, emailService, configService) {
        this.courseRepository = courseRepository;
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
    }
    async validateCourseContent(courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        lessons: {
                            include: { quiz: true },
                        },
                    },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${courseId}" not found`);
        }
        const allLessons = course.sections.flatMap((s) => s.lessons);
        if (allLessons.length === 0) {
            throw new common_1.BadRequestException('Không thể công khai khóa học. Khóa học chưa có bài học nào.');
        }
        const invalidLessons = allLessons.filter((lesson) => !lesson.body || lesson.body.trim() === '' || !lesson.quiz);
        if (invalidLessons.length > 0) {
            const errorDetails = invalidLessons
                .map((l) => `Bài học "${l.title}" thiếu nội dung văn bản (body) hoặc chưa có bài trắc nghiệm (quiz).`)
                .join(' ');
            throw new common_1.BadRequestException(`Không thể công khai khóa học vì có bài học chưa hoàn thiện nội dung. ${errorDetails}`);
        }
    }
    async createCourse(input, instructorId) {
        if (input.published || input.isActive) {
            throw new common_1.BadRequestException('Không thể công khai khóa học khi tạo mới. Vui lòng tạo bài học và quiz trước, sau đó bật công khai.');
        }
        return this.courseRepository.create({
            ...input,
            learningOutcomes: input.learningOutcomes
                ? JSON.stringify(input.learningOutcomes)
                : '[]',
            instructorId,
        });
    }
    async updateCourse(id, input) {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${id}" not found`);
        }
        if (input.published === true || input.isActive === true) {
            await this.validateCourseContent(id);
        }
        const updateData = { ...input };
        if (input.learningOutcomes !== undefined) {
            updateData.learningOutcomes = JSON.stringify(input.learningOutcomes);
        }
        return this.courseRepository.update(id, updateData);
    }
    async deleteCourse(id) {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${id}" not found`);
        }
        return this.courseRepository.delete(id);
    }
    async getPublishedCourses() {
        return this.courseRepository.findPublished();
    }
    async getAllCoursesForAdmin() {
        return this.prisma.course.findMany({
            include: {
                instructor: { select: { id: true, name: true, email: true } },
                _count: { select: { enrollments: true, sections: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCourseById(id) {
        const course = await this.courseRepository.findByIdWithRelations(id);
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${id}" not found`);
        }
        return course;
    }
    async getMyCourses(instructorId) {
        return this.courseRepository.findByInstructor(instructorId);
    }
    async createSection(input) {
        return this.prisma.section.create({
            data: {
                title: input.title,
                order: input.order,
                courseId: input.courseId,
            },
            include: { lessons: true },
        });
    }
    async deleteSection(id) {
        const section = await this.prisma.section.findUnique({ where: { id } });
        if (!section) {
            throw new common_1.NotFoundException(`Section with ID "${id}" not found`);
        }
        return this.prisma.section.delete({ where: { id } });
    }
    async createLesson(input) {
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
    async deleteLesson(id) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID "${id}" not found`);
        }
        return this.prisma.lesson.delete({ where: { id } });
    }
    async getLessonById(id) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { section: true },
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID "${id}" not found`);
        }
        return lesson;
    }
    async toggleCourseStatus(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${id}" not found`);
        }
        if (!course.isActive) {
            await this.validateCourseContent(id);
        }
        return this.prisma.course.update({
            where: { id },
            data: { isActive: !course.isActive },
        });
    }
    async getInstructorStats(instructorId) {
        const courses = await this.prisma.course.findMany({
            where: { instructorId },
            select: { id: true, title: true, price: true },
        });
        const totalCourses = courses.length;
        const courseIds = courses.map((c) => c.id);
        if (courseIds.length === 0) {
            return {
                totalCourses,
                totalStudents: 0,
                totalRevenue: 0,
                avgCompletionRate: 0,
                courseBreakdown: [],
            };
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            select: { id: true, courseId: true },
        });
        const totalStudents = enrollments.length;
        const completedOrders = await this.prisma.order.findMany({
            where: { courseId: { in: courseIds }, status: 'COMPLETED' },
            select: { courseId: true },
        });
        const coursePriceMap = new Map(courses.map((c) => [c.id, c.price]));
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (coursePriceMap.get(o.courseId) ?? 0), 0);
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId: { in: courseIds } } },
        });
        const completedLessons = await this.prisma.progress.count({
            where: { enrollment: { courseId: { in: courseIds } } },
        });
        const maxPossible = totalLessons * Math.max(totalStudents, 1);
        const avgCompletionRate = maxPossible > 0 ? Math.round((completedLessons / maxPossible) * 100) : 0;
        const courseBreakdown = await Promise.all(courses.map(async (course) => {
            const courseEnrollmentIds = enrollments
                .filter((e) => e.courseId === course.id)
                .map((e) => e.id);
            const studentCount = courseEnrollmentIds.length;
            const courseLessons = await this.prisma.lesson.count({
                where: { section: { courseId: course.id } },
            });
            const courseCompletedLessons = await this.prisma.progress.count({
                where: { enrollmentId: { in: courseEnrollmentIds } },
            });
            const maxPoss = courseLessons * Math.max(studentCount, 1);
            const completionRate = maxPoss > 0
                ? Math.round((courseCompletedLessons / maxPoss) * 100)
                : 0;
            let avgQuizScore = 0;
            try {
                const submissions = await this.prisma.quizSubmission.findMany({
                    where: { quiz: { lesson: { section: { courseId: course.id } } } },
                    select: { score: true, totalQuestions: true },
                });
                if (submissions.length > 0) {
                    const totalScore = submissions.reduce((sum, s) => sum +
                        (s.totalQuestions > 0 ? (s.score / s.totalQuestions) * 100 : 0), 0);
                    avgQuizScore = Math.round(totalScore / submissions.length);
                }
            }
            catch {
            }
            return {
                courseId: course.id,
                title: course.title,
                studentCount,
                completionRate,
                avgQuizScore,
            };
        }));
        return {
            totalCourses,
            totalStudents,
            totalRevenue,
            avgCompletionRate,
            courseBreakdown,
        };
    }
    async updateCurriculum(courseId, input) {
        return this.prisma.$transaction(async (tx) => {
            const existingSections = await tx.section.findMany({
                where: { courseId },
                include: { lessons: true },
            });
            const incomingSectionIds = input.sections
                .map((s) => s.id)
                .filter(Boolean);
            const sectionsToDelete = existingSections.filter((es) => !incomingSectionIds.includes(es.id));
            if (sectionsToDelete.length > 0) {
                await tx.section.deleteMany({
                    where: { id: { in: sectionsToDelete.map((s) => s.id) } },
                });
            }
            for (let i = 0; i < input.sections.length; i++) {
                const sData = input.sections[i];
                let sectionId = sData.id;
                if (sectionId && existingSections.some((es) => es.id === sectionId)) {
                    await tx.section.update({
                        where: { id: sectionId },
                        data: { title: sData.title, order: i },
                    });
                }
                else {
                    const newSection = await tx.section.create({
                        data: {
                            title: sData.title,
                            order: i,
                            courseId,
                        },
                    });
                    sectionId = newSection.id;
                }
                const existingLessons = existingSections.find((es) => es.id === sectionId)?.lessons || [];
                const incomingLessonIds = sData.lessons
                    .map((l) => l.id)
                    .filter(Boolean);
                const lessonsToDelete = existingLessons.filter((el) => !incomingLessonIds.includes(el.id));
                if (lessonsToDelete.length > 0) {
                    await tx.lesson.deleteMany({
                        where: { id: { in: lessonsToDelete.map((l) => l.id) } },
                    });
                }
                for (let j = 0; j < sData.lessons.length; j++) {
                    const lData = sData.lessons[j];
                    if (lData.id && existingLessons.some((el) => el.id === lData.id)) {
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
                    }
                    else {
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
            const updatedSections = await tx.section.findMany({
                where: { courseId },
                include: { lessons: { select: { duration: true } } },
            });
            let newTotalDuration = 0;
            for (const section of updatedSections) {
                for (const lesson of section.lessons) {
                    newTotalDuration += lesson.duration || 0;
                }
            }
            await tx.course.update({
                where: { id: courseId },
                data: { totalDuration: newTotalDuration },
            });
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
    async getCourseStudents(courseId, instructorId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
            throw new common_1.ForbiddenException('Bạn không phải giảng viên của khóa học này');
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: true,
                progresses: {
                    include: {
                        lesson: {
                            include: { section: true },
                        },
                    },
                    orderBy: { completedAt: 'desc' },
                },
            },
        });
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId } },
        });
        return enrollments.map((en) => {
            const progressPercent = totalLessons === 0
                ? 0
                : Math.min(100, Math.round((en.progresses.length / totalLessons) * 100));
            const progressTimeline = en.progresses.map((p) => ({
                lessonTitle: p.lesson.title,
                chapterTitle: p.lesson.section.title,
                completedAt: p.completedAt,
            }));
            const lastActive = en.progresses.length > 0 ? en.progresses[0].completedAt : undefined;
            return {
                id: en.user.id,
                name: en.user.name || 'Học viên ẩn danh',
                email: en.user.email,
                avatar: en.user.avatar,
                progressPercent,
                lastActive,
                progressTimeline,
                lastRemindedAt: en.lastRemindedAt,
                requestedAt: en.requestedAt,
                enrolledAt: en.enrolledAt,
                status: en.status,
            };
        });
    }
    async approveEnrollment(studentId, courseId, instructorId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: { instructor: true },
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại');
        if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
            throw new common_1.ForbiddenException('Bạn không có quyền duyệt học viên khóa học này');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: studentId, courseId } },
            include: { user: true },
        });
        if (!enrollment)
            throw new common_1.NotFoundException('Học viên chưa đăng ký khóa học này');
        if (enrollment.status === 'APPROVED')
            return true;
        await this.prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { status: 'APPROVED', enrolledAt: new Date() },
        });
        const frontendUrl = this.configService.get('FRONTEND_URL') ||
            'http://localhost:3000';
        const courseUrl = `${frontendUrl}/courses/${courseId}`;
        await this.emailService.sendEnrollmentApprovedEmail(enrollment.user.email, enrollment.user.name || 'Học viên', course.title, courseUrl);
        console.log(`[NOTIFICATION OUTBOX] Đã gửi thông báo phê duyệt tới: ${enrollment.user.email}`);
        return true;
    }
    async rejectEnrollment(studentId, courseId, instructorId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại');
        if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
            throw new common_1.ForbiddenException('Bạn không có quyền từ chối học viên khóa học này');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: studentId, courseId } },
        });
        if (!enrollment)
            throw new common_1.NotFoundException('Học viên chưa đăng ký khóa học này');
        await this.prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { status: 'REJECTED' },
        });
        return true;
    }
    async sendLearningReminder(studentId, courseId, instructorId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: { instructor: true },
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại');
        if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
            throw new common_1.ForbiddenException('Bạn không có quyền gửi nhắc nhở cho khóa học này');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: studentId, courseId } },
            include: { user: true },
        });
        if (!enrollment)
            throw new common_1.NotFoundException('Học viên chưa đăng ký khóa học này');
        if (enrollment.lastRemindedAt) {
            const timeSinceLastReminder = new Date().getTime() - enrollment.lastRemindedAt.getTime();
            const hoursSince = timeSinceLastReminder / (1000 * 60 * 60);
            if (hoursSince < 24) {
                throw new common_1.BadRequestException('Chưa đủ 24h kể từ lần gửi trước. Mỗi học viên chỉ nhận 1 nhắc nhở/ngày.');
            }
        }
        await this.prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { lastRemindedAt: new Date() },
        });
        const studentName = enrollment.user.name || 'Bạn';
        const instName = course.instructor.name || 'Giảng viên';
        console.log(`[EMAIL SEND] Tới: ${enrollment.user.email}`);
        console.log(`[EMAIL CONTENT] Chào ${studentName}, giảng viên ${instName} nhận thấy bạn đang dừng lại... Hãy tiếp tục hành trình nhé!`);
        return true;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [course_repository_1.CourseRepository,
        prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map