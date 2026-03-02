import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { BadgeType } from './entities/badge.entity';
import { AchievementStats, BadgeWithStatus } from './entities/achievement.entity';
import { CreateBadgeInput, UpdateBadgeInput } from './dto/badge.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver()
export class GamificationResolver {
    constructor(private readonly gamificationService: GamificationService) { }

    // ════════════════════════════════════════════════
    // PUBLIC QUERIES
    // ════════════════════════════════════════════════

    /**
     * Get Top N students (public — no auth required for landing page).
     */
    @Query(() => [LeaderboardEntry], { name: 'topStudents' })
    async getTopStudents(
        @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    ): Promise<LeaderboardEntry[]> {
        return this.gamificationService.getTopStudents(limit) as unknown as LeaderboardEntry[];
    }

    // ════════════════════════════════════════════════
    // STUDENT QUERIES (Auth Required)
    // ════════════════════════════════════════════════

    /**
     * Get current user's points.
     */
    @Query(() => Int, { name: 'myPoints' })
    @UseGuards(JwtAuthGuard)
    async getMyPoints(
        @CurrentUser() user: { id: string },
    ): Promise<number> {
        return this.gamificationService.getUserPoints(user.id);
    }

    /**
     * Get current user's earned badges.
     */
    @Query(() => [BadgeType], { name: 'myBadges' })
    @UseGuards(JwtAuthGuard)
    async getMyBadges(
        @CurrentUser() user: { id: string },
    ): Promise<BadgeType[]> {
        return this.gamificationService.getUserBadges(user.id) as unknown as BadgeType[];
    }

    /**
     * Get current user's achievement stats.
     */
    @Query(() => AchievementStats, { name: 'myAchievementStats' })
    @UseGuards(JwtAuthGuard)
    async getMyAchievementStats(
        @CurrentUser() user: { id: string },
    ): Promise<AchievementStats> {
        return this.gamificationService.getMyAchievementStats(user.id);
    }

    /**
     * Get all badges with their earned status for the current user.
     */
    @Query(() => [BadgeWithStatus], { name: 'allBadgesWithStatus' })
    @UseGuards(JwtAuthGuard)
    async getAllBadgesWithStatus(
        @CurrentUser() user: { id: string },
    ): Promise<BadgeWithStatus[]> {
        return this.gamificationService.getAllBadgesWithStatus(user.id);
    }

    /**
     * Get all badges for a specific course.
     */
    @Query(() => [BadgeType], { name: 'courseBadges' })
    async getCourseBadges(
        @Args('courseId') courseId: string,
    ): Promise<BadgeType[]> {
        return this.gamificationService.getCourseBadges(courseId) as unknown as BadgeType[];
    }

    // ════════════════════════════════════════════════
    // INSTRUCTOR MUTATIONS (Auth + Ownership)
    // ════════════════════════════════════════════════

    /**
     * Get all badges created by the current instructor.
     */
    @Query(() => [BadgeType], { name: 'myCreatedBadges' })
    @UseGuards(JwtAuthGuard)
    async getMyCreatedBadges(
        @CurrentUser() user: { id: string; role: string },
    ): Promise<BadgeType[]> {
        if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
            throw new ForbiddenException('Chỉ Instructor mới có thể xem danh sách Badge đã tạo');
        }
        return this.gamificationService.getInstructorBadges(user.id) as unknown as BadgeType[];
    }

    /**
     * Create a course-specific badge.
     */
    @Mutation(() => BadgeType, { name: 'createCourseBadge' })
    @UseGuards(JwtAuthGuard)
    async createCourseBadge(
        @Args('input') input: CreateBadgeInput,
        @CurrentUser() user: { id: string; role: string },
    ): Promise<BadgeType> {
        if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
            throw new ForbiddenException('Chỉ Instructor mới có thể tạo Badge');
        }
        return this.gamificationService.createCourseBadge({
            ...input,
            creatorId: user.id,
        }) as unknown as BadgeType;
    }

    /**
     * Update a badge (only by its creator).
     */
    @Mutation(() => BadgeType, { name: 'updateCourseBadge' })
    @UseGuards(JwtAuthGuard)
    async updateCourseBadge(
        @Args('badgeId') badgeId: string,
        @Args('input') input: UpdateBadgeInput,
        @CurrentUser() user: { id: string },
    ): Promise<BadgeType> {
        return this.gamificationService.updateCourseBadge(badgeId, user.id, input) as unknown as BadgeType;
    }

    /**
     * Delete a badge (only by its creator, fails if users have earned it).
     */
    @Mutation(() => Boolean, { name: 'deleteCourseBadge' })
    @UseGuards(JwtAuthGuard)
    async deleteCourseBadge(
        @Args('badgeId') badgeId: string,
        @CurrentUser() user: { id: string },
    ): Promise<boolean> {
        return this.gamificationService.deleteCourseBadge(badgeId, user.id);
    }
}
