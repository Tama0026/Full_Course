import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Enrollment as PrismaEnrollment } from '@prisma/client';

@Injectable()
export class EnrollmentRepository extends BaseRepository<PrismaEnrollment> {
    constructor(prisma: PrismaService) {
        super(prisma, 'enrollment');
    }

    /**
     * Find enrollment by user and course (unique constraint).
     */
    async findByUserAndCourse(
        userId: string,
        courseId: string,
    ): Promise<PrismaEnrollment | null> {
        return this.model.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            include: {
                course: {
                    include: {
                        sections: {
                            include: { lessons: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                progresses: { include: { lesson: true } },
            },
        });
    }

    /**
     * Find all enrollments for a specific user.
     */
    async findByUserId(userId: string): Promise<PrismaEnrollment[]> {
        return this.model.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        instructor: true,
                        sections: {
                            include: { lessons: true }
                        }
                    },
                },
                progresses: true,
            },
            orderBy: { enrolledAt: 'desc' },
        });
    }
}
