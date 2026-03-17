import {
  Resolver,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistItem } from './entities/wishlist.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => WishlistItem)
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Get all courses in the user's wishlist.
   */
  @Query(() => [WishlistItem], { name: 'myWishlist' })
  @UseGuards(JwtAuthGuard)
  async getMyWishlist(@CurrentUser() user: { id: string }) {
    return this.wishlistService.getMyWishlist(user.id);
  }

  /**
   * Check if a specific course is in the wishlist.
   */
  @Query(() => Boolean, { name: 'isInWishlist' })
  @UseGuards(JwtAuthGuard)
  async isInWishlist(
    @Args('courseId', { type: () => String }) courseId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.wishlistService.isInWishlist(user.id, courseId);
  }

  /**
   * Add a course to the wishlist.
   */
  @Mutation(() => WishlistItem)
  @UseGuards(JwtAuthGuard)
  async addToWishlist(
    @Args('courseId', { type: () => String }) courseId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.wishlistService.addToWishlist(user.id, courseId);
  }

  /**
   * Remove a course from the wishlist.
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeFromWishlist(
    @Args('courseId', { type: () => String }) courseId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.wishlistService.removeFromWishlist(user.id, courseId);
  }
}
