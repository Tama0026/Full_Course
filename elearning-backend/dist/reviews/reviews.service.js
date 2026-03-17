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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ReviewsService = class ReviewsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createReview(userId, input) {
        if (input.rating < 1 || input.rating > 5) {
            throw new common_1.BadRequestException('Rating phải từ 1 đến 5 sao.');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId: input.courseId },
            },
        });
        if (!enrollment || enrollment.status !== 'APPROVED') {
            throw new common_1.ForbiddenException('Bạn phải đăng ký và được duyệt vào khóa học trước khi đánh giá.');
        }
        const existing = await this.prisma.review.findUnique({
            where: {
                userId_courseId: { userId, courseId: input.courseId },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Bạn đã đánh giá khóa học này rồi. Hãy chỉnh sửa đánh giá hiện tại.');
        }
        const review = await this.prisma.review.create({
            data: {
                userId,
                courseId: input.courseId,
                rating: input.rating,
                comment: input.comment,
            },
            include: { user: true },
        });
        await this.recalcCourseRating(input.courseId);
        const course = await this.prisma.course.findUnique({
            where: { id: input.courseId },
            select: { title: true, instructorId: true },
        });
        if (course) {
            const userName = review.user?.name || 'Một học viên';
            await this.notificationsService.create({
                userId: course.instructorId,
                type: 'REVIEW',
                title: 'Đánh giá mới',
                message: `${userName} đã đánh giá ${input.rating}⭐ cho khóa học "${course.title}"`,
                link: `/courses/${input.courseId}`,
            });
        }
        return review;
    }
    async updateReview(userId, reviewId, input) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Đánh giá không tồn tại.');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('Bạn không có quyền sửa đánh giá này.');
        }
        if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
            throw new common_1.BadRequestException('Rating phải từ 1 đến 5 sao.');
        }
        const updated = await this.prisma.review.update({
            where: { id: reviewId },
            data: {
                ...(input.rating !== undefined && { rating: input.rating }),
                ...(input.comment !== undefined && { comment: input.comment }),
            },
            include: { user: true },
        });
        await this.recalcCourseRating(review.courseId);
        return updated;
    }
    async deleteReview(userId, reviewId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Đánh giá không tồn tại.');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa đánh giá này.');
        }
        await this.prisma.review.delete({ where: { id: reviewId } });
        await this.recalcCourseRating(review.courseId);
        return review;
    }
    async getCourseReviewSummary(courseId) {
        const reviews = await this.prisma.review.findMany({
            where: { courseId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        const totalCount = reviews.length;
        const starCounts = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
        for (const review of reviews) {
            const key = `star${review.rating}`;
            if (key in starCounts) {
                starCounts[key]++;
            }
        }
        const averageRating = totalCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
            : 0;
        return {
            totalCount,
            averageRating: Math.round(averageRating * 10) / 10,
            ...starCounts,
            reviews,
        };
    }
    async getMyReview(userId, courseId) {
        return this.prisma.review.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
            include: { user: true },
        });
    }
    async recalcCourseRating(courseId) {
        const agg = await this.prisma.review.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                averageRating: Math.round((agg._avg.rating || 0) * 10) / 10,
                reviewCount: agg._count.rating || 0,
            },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map