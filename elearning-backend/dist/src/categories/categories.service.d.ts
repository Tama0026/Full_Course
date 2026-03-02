import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        order: number;
        createdAt: Date;
    }[]>;
    create(name: string): Promise<{
        id: string;
        name: string;
        slug: string;
        order: number;
        createdAt: Date;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        order: number;
        createdAt: Date;
    }>;
    private generateSlug;
}
