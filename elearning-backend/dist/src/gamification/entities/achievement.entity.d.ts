export declare class AchievementStats {
    totalPoints: number;
    globalRank: number;
    percentile: number;
    earnedBadges: number;
    totalBadges: number;
    userName?: string;
    userAvatar?: string;
}
export declare class BadgeWithStatus {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    criteriaType: string;
    threshold: number;
    currentProgress: number;
    courseId?: string;
    courseName?: string;
    earned: boolean;
    awardedAt?: Date;
}
export declare class LoginStreakType {
    currentStreak: number;
    longestStreak: number;
    lastLoginDate?: string;
}
