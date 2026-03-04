import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { User as PrismaUser } from '@prisma/client';
export declare class UserRepository extends BaseRepository<PrismaUser> {
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<PrismaUser | null>;
}
