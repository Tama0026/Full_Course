import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        order: number;
    }[]>;
    create(name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        order: number;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        order: number;
    }>;
    private generateSlug;
}
