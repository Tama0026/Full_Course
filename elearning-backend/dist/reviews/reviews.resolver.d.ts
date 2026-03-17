import { ReviewsService } from './reviews.service';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
export declare class ReviewsResolver {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getCourseReviews(courseId: string): Promise<{
        reviews: any;
        star1: number;
        star2: number;
        star3: number;
        star4: number;
        star5: number;
        totalCount: any;
        averageRating: number;
    }>;
    getMyReview(courseId: string, user: {
        id: string;
    }): Promise<any>;
    createReview(input: CreateReviewInput, user: {
        id: string;
    }): Promise<any>;
    updateReview(reviewId: string, input: UpdateReviewInput, user: {
        id: string;
    }): Promise<any>;
    deleteReview(reviewId: string, user: {
        id: string;
    }): Promise<any>;
}
