import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<PrismaUser> {
    constructor(prisma: PrismaService) {
        super(prisma, 'user');
    }

    /**
     * Find a user by email address.
     */
    async findByEmail(email: string): Promise<PrismaUser | null> {
        return this.model.findUnique({
            where: { email },
        });
    }
}
