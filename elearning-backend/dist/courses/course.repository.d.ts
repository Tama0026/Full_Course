import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Course as PrismaCourse } from '@prisma/client';
export declare class CourseRepository extends BaseRepository<PrismaCourse> {
    constructor(prisma: PrismaService);
    findByInstructor(instructorId: string): Promise<PrismaCourse[]>;
    findPublished(): Promise<PrismaCourse[]>;
    findByIdWithRelations(id: string): Promise<PrismaCourse | null>;
}
