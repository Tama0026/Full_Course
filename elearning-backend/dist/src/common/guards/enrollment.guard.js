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
exports.EnrollmentGuard = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const prisma_service_1 = require("../../prisma/prisma.service");
let EnrollmentGuard = class EnrollmentGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const ctx = graphql_1.GqlExecutionContext.create(context);
        const user = ctx.getContext().req?.user;
        const args = ctx.getArgs();
        let courseId = args.courseId;
        if (!courseId && args.lessonId) {
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: args.lessonId },
                include: { section: { select: { courseId: true } } },
            });
            if (lesson && lesson.isPreview) {
                return true;
            }
            if (lesson) {
                courseId = lesson.section?.courseId;
            }
        }
        if (!user) {
            throw new common_1.ForbiddenException('Bạn vui lòng đăng nhập để thao tác và xem nội dung.');
        }
        if (user.role === 'ADMIN') {
            return true;
        }
        if (!courseId && args.sectionId) {
            const section = await this.prisma.section.findUnique({
                where: { id: args.sectionId },
                select: { courseId: true },
            });
            courseId = section?.courseId;
        }
        if (!courseId) {
            throw new common_1.ForbiddenException('Unable to determine course for enrollment check');
        }
        if (user.role === 'INSTRUCTOR') {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                select: { instructorId: true },
            });
            if (course?.instructorId === user.id) {
                return true;
            }
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('Bạn cần phải mua khóa học này để có thể xem bài học. Nếu bạn vừa mua, vui lòng tải lại trang.');
        }
        return true;
    }
};
exports.EnrollmentGuard = EnrollmentGuard;
exports.EnrollmentGuard = EnrollmentGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentGuard);
//# sourceMappingURL=enrollment.guard.js.map