import { GamificationService } from './gamification.service';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { BadgeType } from './entities/badge.entity';
import { AchievementStats, BadgeWithStatus } from './entities/achievement.entity';
import { CreateBadgeInput, UpdateBadgeInput } from './dto/badge.input';
export declare class GamificationResolver {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getTopStudents(limit: number): Promise<LeaderboardEntry[]>;
    getMyPoints(user: {
        id: string;
    }): Promise<number>;
    getMyBadges(user: {
        id: string;
    }): Promise<BadgeType[]>;
    getMyAchievementStats(user: {
        id: string;
    }): Promise<AchievementStats>;
    getAllBadgesWithStatus(user: {
        id: string;
    }): Promise<BadgeWithStatus[]>;
    getCourseBadges(courseId: string): Promise<BadgeType[]>;
    getMyCreatedBadges(user: {
        id: string;
        role: string;
    }): Promise<BadgeType[]>;
    createCourseBadge(input: CreateBadgeInput, user: {
        id: string;
        role: string;
    }): Promise<BadgeType>;
    updateCourseBadge(badgeId: string, input: UpdateBadgeInput, user: {
        id: string;
    }): Promise<BadgeType>;
    deleteCourseBadge(badgeId: string, user: {
        id: string;
    }): Promise<boolean>;
}
