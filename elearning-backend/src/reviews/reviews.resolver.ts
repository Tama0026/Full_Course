import {
  Resolver,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review, ReviewSummary } from './entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ==================== QUERIES ====================

  /**
   * Get all reviews + star distribution for a course (public).
   */
  @Query(() => ReviewSummary, { name: 'courseReviews' })
  @UseGuards(OptionalJwtAuthGuard)
  async getCourseReviews(
    @Args('courseId', { type: () => String }) courseId: string,
  ) {
    return this.reviewsService.getCourseReviewSummary(courseId);
  }

  /**
   * Get the current user's review for a course (or null).
   */
  @Query(() => Review, { name: 'myReview', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getMyReview(
    @Args('courseId', { type: () => String }) courseId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reviewsService.getMyReview(user.id, courseId);
  }

  // ==================== MUTATIONS ====================

  /**
   * Create a review (enrolled students only).
   */
  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Args('input') input: CreateReviewInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.reviewsService.createReview(user.id, input);
  }

  /**
   * Update a review (owner only).
   */
  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Args('reviewId', { type: () => String }) reviewId: string,
    @Args('input') input: UpdateReviewInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.reviewsService.updateReview(user.id, reviewId, input);
  }

  /**
   * Delete a review (owner only).
   */
  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Args('reviewId', { type: () => String }) reviewId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reviewsService.deleteReview(user.id, reviewId);
  }
}
