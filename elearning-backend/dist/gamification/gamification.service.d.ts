import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class GamificationService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    addPoints(userId: string, points: number): Promise<void>;
    getTopStudents(limit?: number): Promise<any>;
    getUserPoints(userId: string): Promise<number>;
    checkAndAwardBadges(userId: string, specificCourseId?: string): Promise<void>;
    private evaluateBadgeCriteria;
    getUserCurrentValue(userId: string, criteriaType: string, courseId?: string | null): Promise<number>;
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
    getAllBadgesForAdmin(): Promise<any>;
    adminCreateBadge(input: {
        name: string;
        description: string;
        icon: string;
        criteriaType: string;
        threshold: number;
        courseId?: string;
        creatorId: string;
    }): Promise<any>;
    adminUpdateBadge(badgeId: string, data: {
        name?: string;
        description?: string;
        icon?: string;
        criteria?: string;
        criteriaType?: string;
        threshold?: number;
    }): Promise<any>;
    adminDeleteBadge(badgeId: string): Promise<boolean>;
    getAdminStats(): Promise<{
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        totalBadges: any;
        totalStudents: number;
        totalInstructors: number;
    }>;
    recordLoginActivity(userId: string): Promise<void>;
    getLoginStreak(userId: string): Promise<{
        currentStreak: any;
        longestStreak: any;
        lastLoginDate: any;
    }>;
}
