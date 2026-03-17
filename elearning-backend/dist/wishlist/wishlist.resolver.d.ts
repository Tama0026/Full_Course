import { WishlistService } from './wishlist.service';
export declare class WishlistResolver {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getMyWishlist(user: {
        id: string;
    }): Promise<({
        course: {
            instructor: {
                name: string | null;
                id: string;
                email: string;
                password: string;
                headline: string | null;
                bio: string | null;
                avatar: string | null;
                aiRank: string | null;
                role: import("@prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
            sections: ({
                lessons: {
                    id: string;
                    title: string;
                    duration: number | null;
                }[];
            } & {
                order: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                courseId: string;
            })[];
        } & {
            category: string | null;
            type: import("@prisma/client").$Enums.CourseType;
            description: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            price: number;
            enrollCode: string | null;
            thumbnail: string | null;
            learningOutcomes: string;
            averageRating: number;
            reviewCount: number;
            totalDuration: number;
            published: boolean;
            isActive: boolean;
            maxStudents: number | null;
            isApprovalRequired: boolean;
            instructorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        courseId: string;
    })[]>;
    isInWishlist(courseId: string, user: {
        id: string;
    }): Promise<boolean>;
    addToWishlist(courseId: string, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        courseId: string;
    }>;
    removeFromWishlist(courseId: string, user: {
        id: string;
    }): Promise<boolean>;
}
