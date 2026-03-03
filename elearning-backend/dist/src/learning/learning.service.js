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
exports.LearningService = void 0;
const common_1 = require("@nestjs/common");
const enrollment_repository_1 = require("./enrollment.repository");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const gamification_service_1 = require("../gamification/gamification.service");
const email_service_1 = require("../email/email.service");
const uuid_1 = require("uuid");
let LearningService = class LearningService {
    enrollmentRepository;
    prisma;
    cloudinaryService;
    gamificationService;
    emailService;
    constructor(enrollmentRepository, prisma, cloudinaryService, gamificationService, emailService) {
        this.enrollmentRepository = enrollmentRepository;
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
        this.gamificationService = gamificationService;
        this.emailService = emailService;
    }
    async markLessonComplete(userId, lessonId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { section: { select: { courseId: true } } },
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID "${lessonId}" not found`);
        }
        const courseId = lesson.section.courseId;
        const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
        if (!enrollment) {
            throw new common_1.NotFoundException('You are not enrolled in this course');
        }
        if (!lesson.isPreview) {
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
            const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
            if (currentIndex > 0) {
                const prevLesson = allLessons[currentIndex - 1];
                const prevQuiz = await this.prisma.quiz.findUnique({
                    where: { lessonId: prevLesson.id }
                });
                if (prevQuiz) {
                    let completedLessons = [];
                    try {
                        const rawEnrollment = enrollment;
                        completedLessons = JSON.parse(rawEnrollment.completedLessons || '[]');
                    }
                    catch (e) { }
                    if (!completedLessons.includes(prevLesson.id)) {
                        throw new common_1.ForbiddenException('Lesson is locked. Please complete the previous lesson and its quiz first.');
                    }
                }
            }
        }
        const existingProgress = await this.prisma.progress.findUnique({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: enrollment.id,
                    lessonId,
                },
            },
        });
        if (existingProgress) {
            throw new common_1.ConflictException('Lesson already marked as complete');
        }
        const progress = await this.prisma.progress.create({
            data: {
                enrollmentId: enrollment.id,
                lessonId,
            },
            include: { lesson: true },
        });
        await this.gamificationService.addPoints(userId, 5);
        return progress;
    }
    async getProgress(userId, courseId) {
        const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
        if (!enrollment) {
            throw new common_1.NotFoundException('You are not enrolled in this course');
        }
        const totalLessons = await this.prisma.lesson.count({
            where: {
                section: { courseId },
            },
        });
        const completedLessons = await this.prisma.progress.count({
            where: {
                enrollmentId: enrollment.id,
            },
        });
        const completedItems = await this.prisma.progress.findMany({
            where: {
                enrollmentId: enrollment.id,
            },
            include: { lesson: true },
            orderBy: { completedAt: 'desc' },
        });
        const progressPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
            : 0;
        return {
            enrollment,
            progressPercentage,
            completedLessons,
            totalLessons,
            completedItems,
        };
    }
    async getMyEnrollments(userId) {
        return this.enrollmentRepository.findByUserId(userId);
    }
    async isEnrolled(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        return !!enrollment;
    }
    async claimCertificate(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
            include: { user: true, course: true },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('Bạn chưa đăng ký khóa học này!');
        }
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId } },
        });
        const completedLessons = await this.prisma.progress.count({
            where: { enrollmentId: enrollment.id },
        });
        if (totalLessons === 0 || completedLessons < totalLessons) {
            throw new common_1.BadRequestException(`Bạn chưa hoàn thành khóa học này! (${completedLessons}/${totalLessons} bài học)`);
        }
        if (!enrollment.isFinished) {
            await this.prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { isFinished: true },
            });
        }
        let certificate = await this.prisma.certificate.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });
        if (certificate) {
            return certificate;
        }
        const studentName = enrollment.user.name || 'Học viên';
        const courseName = enrollment.course.title;
        const issueDateObj = new Date();
        const issueDateStr = `${issueDateObj.getDate()}/${issueDateObj.getMonth() + 1}/${issueDateObj.getFullYear()}`;
        const certificateUrl = this.cloudinaryService.generateCertificateUrl(studentName, courseName, issueDateStr);
        certificate = await this.prisma.certificate.create({
            data: {
                certificateCode: `CERT-${(0, uuid_1.v4)().split('-')[0].toUpperCase()}`,
                userId,
                courseId,
                courseNameAtIssue: courseName,
                certificateUrl,
                issueDate: issueDateObj,
            }
        });
        const userEmail = enrollment.user.email;
        this.emailService.sendCertificateEmail(userEmail, studentName, courseName, certificateUrl).catch(err => console.error('[LearningService] Email send failed:', err.message));
        return certificate;
    }
    async getMyCertificates(userId) {
        return this.prisma.certificate.findMany({
            where: { userId },
            orderBy: { issueDate: 'desc' },
        });
    }
    async updateVideoProgress(userId, lessonId, currentTime) {
        return this.prisma.videoProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { currentTime },
            create: { userId, lessonId, currentTime },
        });
    }
    async getVideoProgress(userId, lessonId) {
        return this.prisma.videoProgress.findUnique({
            where: { userId_lessonId: { userId, lessonId } },
        });
    }
};
exports.LearningService = LearningService;
exports.LearningService = LearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [enrollment_repository_1.EnrollmentRepository,
        prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService,
        gamification_service_1.GamificationService,
        email_service_1.EmailService])
], LearningService);
//# sourceMappingURL=learning.service.js.map