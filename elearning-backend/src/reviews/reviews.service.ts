import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create a review for a course. Student must be enrolled (APPROVED).
   * Only one review per user per course (enforced by DB unique constraint).
   */
  async createReview(userId: string, input: CreateReviewInput) {
    // Validate rating range
    if (input.rating < 1 || input.rating > 5) {
      throw new BadRequestException('Rating phải từ 1 đến 5 sao.');
    }

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: input.courseId },
      },
    });

    if (!enrollment || enrollment.status !== 'APPROVED') {
      throw new ForbiddenException(
        'Bạn phải đăng ký và được duyệt vào khóa học trước khi đánh giá.',
      );
    }

    // Check if user already reviewed
    const existing = await (this.prisma as any).review.findUnique({
      where: {
        userId_courseId: { userId, courseId: input.courseId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Bạn đã đánh giá khóa học này rồi. Hãy chỉnh sửa đánh giá hiện tại.',
      );
    }

    const review = await (this.prisma as any).review.create({
      data: {
        userId,
        courseId: input.courseId,
        rating: input.rating,
        comment: input.comment,
      },
      include: { user: true },
    });

    await this.recalcCourseRating(input.courseId);

    // Notify the course instructor about the new review
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

  /**
   * Update an existing review. Only the review owner can update.
   */
  async updateReview(userId: string, reviewId: string, input: UpdateReviewInput) {
    const review = await (this.prisma as any).review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại.');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa đánh giá này.');
    }

    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
      throw new BadRequestException('Rating phải từ 1 đến 5 sao.');
    }

    const updated = await (this.prisma as any).review.update({
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

  /**
   * Delete a review. Only the review owner can delete.
   */
  async deleteReview(userId: string, reviewId: string) {
    const review = await (this.prisma as any).review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại.');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này.');
    }

    await (this.prisma as any).review.delete({ where: { id: reviewId } });
    await this.recalcCourseRating(review.courseId);
    return review;
  }

  /**
   * Get all reviews for a course with user info + star distribution.
   */
  async getCourseReviewSummary(courseId: string) {
    const reviews = await (this.prisma as any).review.findMany({
      where: { courseId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = reviews.length;
    const starCounts = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };

    for (const review of reviews) {
      const key = `star${review.rating}` as keyof typeof starCounts;
      if (key in starCounts) {
        starCounts[key]++;
      }
    }

    const averageRating =
      totalCount > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalCount
        : 0;

    return {
      totalCount,
      averageRating: Math.round(averageRating * 10) / 10, // 1 decimal
      ...starCounts,
      reviews,
    };
  }

  /**
   * Get the current user's review for a specific course (or null).
   */
  async getMyReview(userId: string, courseId: string) {
    return (this.prisma as any).review.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: { user: true },
    });
  }

  /**
   * Recalculate averageRating and reviewCount on the Course model.
   */
  private async recalcCourseRating(courseId: string) {
    const agg = await (this.prisma as any).review.aggregate({
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
}
