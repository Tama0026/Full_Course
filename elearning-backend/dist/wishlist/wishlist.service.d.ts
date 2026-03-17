import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    addToWishlist(userId: string, courseId: string): Promise<any>;
    removeFromWishlist(userId: string, courseId: string): Promise<boolean>;
    getMyWishlist(userId: string): Promise<any>;
    isInWishlist(userId: string, courseId: string): Promise<boolean>;
}
