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
    courseId?: string;
    courseName?: string;
    earned: boolean;
    awardedAt?: Date;
}
