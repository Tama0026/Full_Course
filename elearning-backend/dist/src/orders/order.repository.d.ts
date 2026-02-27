import { BaseRepository } from '../common/repositories/base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Order as PrismaOrder } from '@prisma/client';
export declare class OrderRepository extends BaseRepository<PrismaOrder> {
    constructor(prisma: PrismaService);
    findByUserId(userId: string): Promise<PrismaOrder[]>;
}
