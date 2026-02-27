import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Course as PrismaCourse } from '@prisma/client';

@Injectable()
export class CourseRepository extends BaseRepository<PrismaCourse> {
    constructor(prisma: PrismaService) {
        super(prisma, 'course');
    }

    /**
     * Find all courses by a specific instructor.
     */
    async findByInstructor(instructorId: string): Promise<PrismaCourse[]> {
        return this.model.findMany({
            where: { instructorId },
            include: { instructor: true, sections: { include: { lessons: true } } },
        });
    }

    /**
     * Find all published AND active courses (public catalog).
     */
    async findPublished(): Promise<PrismaCourse[]> {
        return this.model.findMany({
            where: { published: true, isActive: true },
            include: { instructor: true, sections: { include: { lessons: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Find a course by ID with full relations (instructor, sections, lessons).
     */
    async findByIdWithRelations(id: string): Promise<PrismaCourse | null> {
        return this.model.findUnique({
            where: { id },
            include: {
                instructor: true,
                sections: {
                    include: { lessons: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
}
