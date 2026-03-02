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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesResolver = exports.LessonResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const courses_service_1 = require("./courses.service");
const course_entity_1 = require("./entities/course.entity");
const section_entity_1 = require("./entities/section.entity");
const lesson_entity_1 = require("./entities/lesson.entity");
const instructor_stats_entity_1 = require("./entities/instructor-stats.entity");
const create_course_input_1 = require("./dto/create-course.input");
const update_course_input_1 = require("./dto/update-course.input");
const create_section_input_1 = require("./dto/create-section.input");
const create_lesson_input_1 = require("./dto/create-lesson.input");
const update_curriculum_input_1 = require("./dto/update-curriculum.input");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../common/guards/optional-jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const resource_owner_guard_1 = require("../common/guards/resource-owner.guard");
const enrollment_guard_1 = require("../common/guards/enrollment.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let LessonResolver = class LessonResolver {
    cloudinaryService;
    prisma;
    constructor(cloudinaryService, prisma) {
        this.cloudinaryService = cloudinaryService;
        this.prisma = prisma;
    }
    async checkLessonAuthorization(lesson, context) {
        if (lesson.isPreview)
            return true;
        const req = context.req;
        const user = req?.user;
        if (!user)
            return false;
        if (user.role === 'ADMIN')
            return true;
        if (!req.authorizedCourses)
            req.authorizedCourses = {};
        let courseId = lesson.section?.courseId;
        if (!courseId) {
            const section = await this.prisma.section.findUnique({
                where: { id: lesson.sectionId },
                select: { courseId: true },
            });
            courseId = section?.courseId;
        }
        if (!courseId)
            return false;
        if (req.authorizedCourses[courseId] !== undefined) {
            return req.authorizedCourses[courseId];
        }
        let isAuthorized = false;
        if (user.role === 'INSTRUCTOR') {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                select: { instructorId: true },
            });
            if (course?.instructorId === user.id)
                isAuthorized = true;
        }
        if (!isAuthorized) {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId } },
            });
            if (enrollment)
                isAuthorized = true;
        }
        req.authorizedCourses[courseId] = isAuthorized;
        return isAuthorized;
    }
    async checkLessonLockStatus(lesson, context) {
        if (lesson.isPreview)
            return false;
        const req = context.req;
        const user = req?.user;
        if (!user || user.role !== 'STUDENT')
            return false;
        let courseId = lesson.section?.courseId;
        if (!courseId) {
            const section = await this.prisma.section.findUnique({
                where: { id: lesson.sectionId },
                select: { courseId: true },
            });
            courseId = section?.courseId;
        }
        if (!courseId)
            return false;
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
        });
        if (!enrollment)
            return true;
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
                    return true;
                }
            }
        }
        return false;
    }
    async resolveIsLocked(lesson, context) {
        return this.checkLessonLockStatus(lesson, context);
    }
    async resolveVideoUrl(lesson, context) {
        const rawUrl = lesson.videoUrl;
        if (!rawUrl || rawUrl.trim() === '')
            return null;
        const isAuthorized = await this.checkLessonAuthorization(lesson, context);
        if (!isAuthorized)
            return null;
        const isLocked = await this.checkLessonLockStatus(lesson, context);
        return isLocked ? null : rawUrl;
    }
    async resolveBody(lesson, context) {
        const bodyContent = lesson.body;
        if (!bodyContent || bodyContent.trim() === '')
            return null;
        const isAuthorized = await this.checkLessonAuthorization(lesson, context);
        if (!isAuthorized)
            return null;
        const isLocked = await this.checkLessonLockStatus(lesson, context);
        return isLocked ? null : bodyContent;
    }
};
exports.LessonResolver = LessonResolver;
__decorate([
    (0, graphql_1.ResolveField)('isLocked', () => Boolean),
    __param(0, (0, graphql_1.Parent)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lesson_entity_1.Lesson, Object]),
    __metadata("design:returntype", Promise)
], LessonResolver.prototype, "resolveIsLocked", null);
__decorate([
    (0, graphql_1.ResolveField)('videoUrl', () => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lesson_entity_1.Lesson, Object]),
    __metadata("design:returntype", Promise)
], LessonResolver.prototype, "resolveVideoUrl", null);
__decorate([
    (0, graphql_1.ResolveField)('body', () => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lesson_entity_1.Lesson, Object]),
    __metadata("design:returntype", Promise)
], LessonResolver.prototype, "resolveBody", null);
exports.LessonResolver = LessonResolver = __decorate([
    (0, graphql_1.Resolver)(() => lesson_entity_1.Lesson),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        prisma_service_1.PrismaService])
], LessonResolver);
let CoursesResolver = class CoursesResolver {
    coursesService;
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    resolveLearningOutcomes(course) {
        if (Array.isArray(course.learningOutcomes))
            return course.learningOutcomes;
        try {
            return JSON.parse(course.learningOutcomes || '[]');
        }
        catch {
            return [];
        }
    }
    async getCourses() {
        return this.coursesService.getPublishedCourses();
    }
    async getCourse(id) {
        return this.coursesService.getCourseById(id);
    }
    async getMyCourses(user) {
        return this.coursesService.getMyCourses(user.id);
    }
    async createCourse(input, user) {
        return this.coursesService.createCourse(input, user.id);
    }
    async updateCourse(id, input) {
        return this.coursesService.updateCourse(id, input);
    }
    async updateCurriculum(id, input) {
        return this.coursesService.updateCurriculum(id, input);
    }
    async deleteCourse(id) {
        return this.coursesService.deleteCourse(id);
    }
    async createSection(input) {
        return this.coursesService.createSection(input);
    }
    async deleteSection(id) {
        return this.coursesService.deleteSection(id);
    }
    async createLesson(input) {
        return this.coursesService.createLesson(input);
    }
    async deleteLesson(id) {
        return this.coursesService.deleteLesson(id);
    }
    async getLesson(lessonId) {
        return this.coursesService.getLessonById(lessonId);
    }
    async toggleCourseStatus(id) {
        return this.coursesService.toggleCourseStatus(id);
    }
    async getInstructorStats(user) {
        return this.coursesService.getInstructorStats(user.id);
    }
};
exports.CoursesResolver = CoursesResolver;
__decorate([
    (0, graphql_1.ResolveField)('learningOutcomes', () => [String]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], CoursesResolver.prototype, "resolveLearningOutcomes", null);
__decorate([
    (0, graphql_1.Query)(() => [course_entity_1.Course], { name: 'courses' }),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "getCourses", null);
__decorate([
    (0, graphql_1.Query)(() => course_entity_1.Course, { name: 'course' }),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "getCourse", null);
__decorate([
    (0, graphql_1.Query)(() => [course_entity_1.Course], { name: 'myCourses' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "getMyCourses", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_input_1.CreateCourseInput, Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, resource_owner_guard_1.ResourceOwnerGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_course_input_1.UpdateCourseInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, resource_owner_guard_1.ResourceOwnerGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_curriculum_input_1.UpdateCurriculumInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateCurriculum", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, resource_owner_guard_1.ResourceOwnerGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, resource_owner_guard_1.ResourceOwnerGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_section_input_1.CreateSectionInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => lesson_entity_1.Lesson),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lesson_input_1.CreateLessonInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => lesson_entity_1.Lesson),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteLesson", null);
__decorate([
    (0, graphql_1.Query)(() => lesson_entity_1.Lesson, { name: 'lesson' }),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard, enrollment_guard_1.EnrollmentGuard),
    __param(0, (0, graphql_1.Args)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "getLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, resource_owner_guard_1.ResourceOwnerGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "toggleCourseStatus", null);
__decorate([
    (0, graphql_1.Query)(() => instructor_stats_entity_1.InstructorStats, { name: 'instructorStats' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "getInstructorStats", null);
exports.CoursesResolver = CoursesResolver = __decorate([
    (0, graphql_1.Resolver)(() => course_entity_1.Course),
    __metadata("design:paramtypes", [courses_service_1.CoursesService])
], CoursesResolver);
//# sourceMappingURL=courses.resolver.js.map