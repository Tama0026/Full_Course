import { PrismaService } from '../prisma/prisma.service';
export declare class GamificationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    addPoints(userId: string, points: number): Promise<void>;
    getTopStudents(limit?: number): Promise<any>;
    getUserPoints(userId: string): Promise<number>;
    checkAndAwardBadges(userId: string, specificCourseId?: string): Promise<void>;
    private evaluateBadgeCriteria;
    getUserBadges(userId: string): Promise<any>;
    getMyAchievementStats(userId: string): Promise<{
        totalPoints: any;
        globalRank: any;
        percentile: number;
        earnedBadges: any;
        totalBadges: any;
        userName: string | undefined;
        userAvatar: string | undefined;
    }>;
    getAllBadgesWithStatus(userId: string): Promise<any>;
    createCourseBadge(input: {
        name: string;
        description: string;
        icon: string;
        criteria: string;
        courseId: string;
        creatorId: string;
    }): Promise<any>;
    updateCourseBadge(badgeId: string, creatorId: string, data: {
        name?: string;
        description?: string;
        icon?: string;
        criteria?: string;
    }): Promise<any>;
    deleteCourseBadge(badgeId: string, creatorId: string): Promise<boolean>;
    getCourseBadges(courseId: string): Promise<any>;
    getInstructorBadges(instructorId: string): Promise<any>;
    seedBadges(): Promise<void>;
}
