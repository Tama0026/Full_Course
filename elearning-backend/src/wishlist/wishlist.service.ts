import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a course to the user's wishlist.
   */
  async addToWishlist(userId: string, courseId: string) {
    // Check course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new BadRequestException('Khóa học không tồn tại.');
    }

    // Check if already in wishlist
    const existing = await (this.prisma as any).wishlist.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return existing; // Idempotent
    }

    return (this.prisma as any).wishlist.create({
      data: { userId, courseId },
      include: {
        course: {
          include: {
            instructor: true,
            sections: { include: { lessons: true } },
          },
        },
      },
    });
  }

  /**
   * Remove a course from the user's wishlist.
   */
  async removeFromWishlist(userId: string, courseId: string) {
    const existing = await (this.prisma as any).wishlist.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!existing) {
      return true; // Idempotent
    }

    await (this.prisma as any).wishlist.delete({
      where: { userId_courseId: { userId, courseId } },
    });
    return true;
  }

  /**
   * Get all wishlist items for a user.
   */
  async getMyWishlist(userId: string) {
    return (this.prisma as any).wishlist.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: true,
            sections: {
              include: {
                lessons: { select: { id: true, title: true, duration: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if a course is in the user's wishlist.
   */
  async isInWishlist(userId: string, courseId: string): Promise<boolean> {
    const item = await (this.prisma as any).wishlist.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return !!item;
  }
}
