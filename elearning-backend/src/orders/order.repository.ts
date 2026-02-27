import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Order as PrismaOrder } from '@prisma/client';

@Injectable()
export class OrderRepository extends BaseRepository<PrismaOrder> {
    constructor(prisma: PrismaService) {
        super(prisma, 'order');
    }

    /**
     * Find all orders for a specific user.
     */
    async findByUserId(userId: string): Promise<PrismaOrder[]> {
        return this.model.findMany({
            where: { userId },
            include: { course: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
