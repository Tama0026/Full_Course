import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReviewsService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createReview(userId: string, input: CreateReviewInput): Promise<any>;
    updateReview(userId: string, reviewId: string, input: UpdateReviewInput): Promise<any>;
    deleteReview(userId: string, reviewId: string): Promise<any>;
    getCourseReviewSummary(courseId: string): Promise<{
        reviews: any;
        star1: number;
        star2: number;
        star3: number;
        star4: number;
        star5: number;
        totalCount: any;
        averageRating: number;
    }>;
    getMyReview(userId: string, courseId: string): Promise<any>;
    private recalcCourseRating;
}
