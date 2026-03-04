import { PrismaService } from '../../prisma/prisma.service';
export declare abstract class BaseRepository<T> {
    protected readonly prisma: PrismaService;
    protected readonly modelName: string;
    constructor(prisma: PrismaService, modelName: string);
    protected get model(): any;
    findAll(args?: {
        where?: Record<string, unknown>;
        include?: Record<string, unknown>;
        orderBy?: Record<string, unknown> | Record<string, unknown>[];
        skip?: number;
        take?: number;
    }): Promise<T[]>;
    findById(id: string, include?: Record<string, unknown>): Promise<T | null>;
    findOne(args: {
        where: Record<string, unknown>;
        include?: Record<string, unknown>;
    }): Promise<T | null>;
    create(data: Record<string, unknown>): Promise<T>;
    update(id: string, data: Record<string, unknown>): Promise<T>;
    delete(id: string): Promise<T>;
    count(where?: Record<string, unknown>): Promise<number>;
}
