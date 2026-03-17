import { User } from '../../auth/entities/user.entity';
export declare class Review {
    id: string;
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
    user?: User;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ReviewSummary {
    totalCount: number;
    averageRating: number;
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
    reviews: Review[];
}
