import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        order: number;
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
    }[]>;
    create(name: string): Promise<{
        order: number;
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
    }>;
    delete(id: string): Promise<{
        order: number;
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
    }>;
    private generateSlug;
}
