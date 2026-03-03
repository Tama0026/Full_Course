import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    create(name: string): Promise<any>;
    delete(id: string): Promise<any>;
    private generateSlug;
}
