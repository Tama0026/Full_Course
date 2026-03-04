import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Enrollment as PrismaEnrollment } from '@prisma/client';
export declare class EnrollmentRepository extends BaseRepository<PrismaEnrollment> {
    constructor(prisma: PrismaService);
    findByUserAndCourse(userId: string, courseId: string): Promise<PrismaEnrollment | null>;
    findByUserId(userId: string): Promise<PrismaEnrollment[]>;
}
