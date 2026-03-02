import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
    constructor(private readonly prisma: PrismaService) { }

    // ════════════════════════════════════════════════
    // POINTS
    // ════════════════════════════════════════════════

    /**
     * Add points to a user's leaderboard entry (upsert).
     */
    async addPoints(userId: string, points: number): Promise<void> {
        await (this.prisma as any).leaderboard.upsert({
            where: { userId },
            update: { totalPoints: { increment: points } },
            create: { userId, totalPoints: points },
        });
        console.log(`[Gamification] +${points} points for user ${userId}`);

        // Check and award badges after points change
        await this.checkAndAwardBadges(userId);
    }

    /**
     * Get top N students by total points.
     */
    async getTopStudents(limit: number = 10) {
        const entries = await (this.prisma as any).leaderboard.findMany({
            orderBy: { totalPoints: 'desc' },
            take: limit,
            include: {
                user: {
                    select: { name: true, avatar: true, email: true },
                },
            },
        });

        return entries.map((entry: any, index: number) => ({
            id: entry.id,
            userId: entry.userId,
            totalPoints: entry.totalPoints,
            updatedAt: entry.updatedAt,
            userName: entry.user.name || entry.user.email,
            userAvatar: entry.user.avatar,
            rank: index + 1,
        }));
    }

    /**
     * Get a specific user's leaderboard entry.
     */
    async getUserPoints(userId: string): Promise<number> {
        const entry = await (this.prisma as any).leaderboard.findUnique({
            where: { userId },
        });
        return entry?.totalPoints || 0;
    }

    // ════════════════════════════════════════════════
    // SCOPED BADGE EVALUATION
    // ════════════════════════════════════════════════

    /**
     * Check milestones and award badges automatically.
     * Evaluates both Global (courseId = null) and Course-Specific badges.
     */
    async checkAndAwardBadges(userId: string, specificCourseId?: string): Promise<void> {
        // Fetch all badges — filter by course if given, otherwise get all
        const allBadges = await (this.prisma as any).badge.findMany({
            where: specificCourseId
                ? { OR: [{ courseId: null }, { courseId: specificCourseId }] }
                : undefined,
        });

        for (const badge of allBadges) {
            // Skip if user already has this badge
            const existing = await (this.prisma as any).userBadge.findUnique({
                where: { userId_badgeId: { userId, badgeId: badge.id } },
            });
            if (existing) continue;

            // Evaluate based on scope
            const qualified = await this.evaluateBadgeCriteria(userId, badge);
            if (!qualified) continue;

            await (this.prisma as any).userBadge.create({
                data: { userId, badgeId: badge.id },
            });
            console.log(`[Gamification] 🏅 Badge "${badge.name}" (${badge.courseId ? 'Course' : 'Global'}) awarded to user ${userId}`);
        }
    }

    /**
     * Evaluate a single badge criterion for a user.
     * If badge.courseId exists → only count progress within that course.
     * If badge.courseId is null → count across all courses (Global).
     */
    private async evaluateBadgeCriteria(userId: string, badge: any): Promise<boolean> {
        const criteria = badge.criteria;
        const courseId = badge.courseId; // null = global

        // Build scope filter for progress queries
        const progressWhere: any = { enrollment: { userId } };
        if (courseId) {
            progressWhere.enrollment.course = { id: courseId };
        }

        const enrollmentWhere: any = { userId, isFinished: true };
        if (courseId) {
            enrollmentWhere.courseId = courseId;
        }

        // ── Lesson-completion badges ──
        if (criteria.startsWith('COMPLETE_') && criteria.endsWith('_LESSON')) {
            const target = parseInt(criteria.replace('COMPLETE_', '').replace('_LESSON', ''), 10);
            if (isNaN(target)) return false;
            const count = await this.prisma.progress.count({ where: progressWhere });
            return count >= target;
        }
        if (criteria.startsWith('COMPLETE_') && criteria.endsWith('_LESSONS')) {
            const target = parseInt(criteria.replace('COMPLETE_', '').replace('_LESSONS', ''), 10);
            if (isNaN(target)) return false;
            const count = await this.prisma.progress.count({ where: progressWhere });
            return count >= target;
        }

        // ── Course-completion badges ──
        if (criteria.startsWith('COMPLETE_') && (criteria.endsWith('_COURSE') || criteria.endsWith('_COURSES'))) {
            const target = parseInt(criteria.replace('COMPLETE_', '').replace('_COURSES', '').replace('_COURSE', ''), 10);
            if (isNaN(target)) return false;
            const count = await this.prisma.enrollment.count({ where: enrollmentWhere });
            return count >= target;
        }

        // ── Points-based badges (always global, no course scoping) ──
        if (criteria.startsWith('REACH_') && criteria.endsWith('_POINTS')) {
            const target = parseInt(criteria.replace('REACH_', '').replace('_POINTS', ''), 10);
            if (isNaN(target)) return false;
            const userPoints = await this.getUserPoints(userId);
            return userPoints >= target;
        }

        return false;
    }

    // ════════════════════════════════════════════════
    // USER BADGES
    // ════════════════════════════════════════════════

    /**
     * Get all badges earned by a user.
     */
    async getUserBadges(userId: string) {
        const userBadges = await (this.prisma as any).userBadge.findMany({
            where: { userId },
            include: { badge: { include: { course: { select: { title: true } } } } },
            orderBy: { awardedAt: 'desc' },
        });

        return userBadges.map((ub: any) => ({
            id: ub.badge.id,
            name: ub.badge.name,
            description: ub.badge.description,
            icon: ub.badge.icon,
            criteria: ub.badge.criteria,
            courseId: ub.badge.courseId,
            courseName: ub.badge.course?.title || null,
            creatorId: ub.badge.creatorId,
            awardedAt: ub.awardedAt,
        }));
    }

    /**
     * Get achievement stats for a user (points, rank, percentile, badge counts).
     */
    async getMyAchievementStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, avatar: true },
        });

        const entry = await (this.prisma as any).leaderboard.findUnique({
            where: { userId },
        });
        const totalPoints = entry?.totalPoints || 0;

        // Calculate rank: number of users with STRICTLY MORE points + 1
        const higherPointsCount = await (this.prisma as any).leaderboard.count({
            where: { totalPoints: { gt: totalPoints } },
        });
        const globalRank = higherPointsCount + 1;

        // Calculate percentile: (Users with LESS OR EQUAL points) / (Total Users) * 100
        const totalUsersWithPoints = await (this.prisma as any).leaderboard.count();
        let percentile = 0;
        if (totalUsersWithPoints > 1) {
            const lowerOrEqualCount = await (this.prisma as any).leaderboard.count({
                where: { totalPoints: { lte: totalPoints } },
            });
            percentile = (lowerOrEqualCount / totalUsersWithPoints) * 100;
        } else if (totalUsersWithPoints === 1) {
            percentile = 100; // Only one user => Top 1% (or Top 100%, but 100 is better UX)
        }

        // Badge counts
        const earnedBadgesCount = await (this.prisma as any).userBadge.count({
            where: { userId },
        });
        const totalBadgesCount = await (this.prisma as any).badge.count();

        return {
            totalPoints,
            globalRank,
            percentile: Math.round(percentile * 10) / 10, // Round to 1 decimal
            earnedBadges: earnedBadgesCount,
            totalBadges: totalBadgesCount,
            userName: user?.name ?? undefined,
            userAvatar: user?.avatar ?? undefined,
        };
    }

    /**
     * Get all available badges with their earned status for a user.
     */
    async getAllBadgesWithStatus(userId: string) {
        const userBadges = await (this.prisma as any).userBadge.findMany({
            where: { userId },
        });
        const earnedBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId));
        const awardedAtMap = new Map(userBadges.map((ub: any) => [ub.badgeId, ub.awardedAt]));

        const allBadges = await (this.prisma as any).badge.findMany({
            include: { course: { select: { title: true } } },
            orderBy: [{ courseId: 'asc' }, { name: 'asc' }],
        });

        return allBadges.map((badge: any) => {
            const earned = earnedBadgeIds.has(badge.id);
            return {
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                criteria: badge.criteria,
                courseId: badge.courseId,
                courseName: badge.course?.title || null,
                earned,
                awardedAt: earned ? awardedAtMap.get(badge.id) : null,
            };
        });
    }

    // ════════════════════════════════════════════════
    // INSTRUCTOR BADGE CRUD
    // ════════════════════════════════════════════════

    /**
     * Create a course-specific badge (Instructor only).
     */
    async createCourseBadge(input: {
        name: string;
        description: string;
        icon: string;
        criteria: string;
        courseId: string;
        creatorId: string;
    }) {
        const badge = await (this.prisma as any).badge.create({
            data: {
                name: input.name,
                description: input.description,
                icon: input.icon,
                criteria: input.criteria,
                courseId: input.courseId,
                creatorId: input.creatorId,
            },
            include: { course: { select: { title: true } } },
        });

        return {
            ...badge,
            courseName: badge.course?.title || null,
        };
    }

    /**
     * Update a badge (only by its creator).
     */
    async updateCourseBadge(badgeId: string, creatorId: string, data: {
        name?: string;
        description?: string;
        icon?: string;
        criteria?: string;
    }) {
        const badge = await (this.prisma as any).badge.findUnique({ where: { id: badgeId } });
        if (!badge) throw new Error('Badge not found');
        if (badge.creatorId !== creatorId) throw new Error('Bạn không có quyền sửa Badge này');

        return (this.prisma as any).badge.update({
            where: { id: badgeId },
            data,
            include: { course: { select: { title: true } } },
        });
    }

    /**
     * Delete a badge (only by its creator, and only if no users have earned it).
     */
    async deleteCourseBadge(badgeId: string, creatorId: string): Promise<boolean> {
        const badge = await (this.prisma as any).badge.findUnique({ where: { id: badgeId } });
        if (!badge) throw new Error('Badge not found');
        if (badge.creatorId !== creatorId) throw new Error('Bạn không có quyền xóa Badge này');
        if (!badge.creatorId) throw new Error('Không thể xóa Badge hệ thống');

        // Safety check: prevent deleting badge with existing awardees
        const awardedCount = await (this.prisma as any).userBadge.count({
            where: { badgeId },
        });
        if (awardedCount > 0) {
            throw new Error(`Không thể xóa Badge này vì đã có ${awardedCount} học viên sở hữu`);
        }

        await (this.prisma as any).badge.delete({ where: { id: badgeId } });
        return true;
    }

    /**
     * Get badges for a specific course.
     */
    async getCourseBadges(courseId: string) {
        const badges = await (this.prisma as any).badge.findMany({
            where: { courseId },
            include: {
                course: { select: { title: true } },
                _count: { select: { userBadges: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return badges.map((b: any) => ({
            ...b,
            courseName: b.course?.title || null,
            awardedCount: b._count?.userBadges || 0,
        }));
    }

    /**
     * Get all badges created by a specific instructor.
     */
    async getInstructorBadges(instructorId: string) {
        const badges = await (this.prisma as any).badge.findMany({
            where: { creatorId: instructorId },
            include: {
                course: { select: { title: true } },
                _count: { select: { userBadges: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return badges.map((b: any) => ({
            ...b,
            courseName: b.course?.title || null,
            awardedCount: b._count?.userBadges || 0,
        }));
    }

    // ════════════════════════════════════════════════
    // SEED
    // ════════════════════════════════════════════════

    /**
     * Seed default global badges + admin user (call once during app init).
     */
    async seedBadges(): Promise<void> {
        // 1. Find or create the admin user
        let admin = await this.prisma.user.findUnique({
            where: { email: 'admin@elearning.com' },
        });

        if (!admin) {
            // Hash password with bcrypt
            const bcrypt = await import('bcrypt');
            const hashedPassword = await bcrypt.hash('Admin@123', 10);

            admin = await this.prisma.user.create({
                data: {
                    email: 'admin@elearning.com',
                    password: hashedPassword,
                    name: 'System Admin',
                    role: 'ADMIN',
                },
            });
            console.log('[Gamification] 👤 Admin user created: admin@elearning.com / Admin@123');
        }

        // 2. Seed default global badges owned by admin
        const defaultBadges = [
            { name: 'COMPLETE_1_LESSON', description: 'Hoàn thành bài học đầu tiên', icon: '🌟', criteria: 'COMPLETE_1_LESSON' },
            { name: 'COMPLETE_5_LESSONS', description: 'Hoàn thành 5 bài học', icon: '📚', criteria: 'COMPLETE_5_LESSONS' },
            { name: 'COMPLETE_10_LESSONS', description: 'Hoàn thành 10 bài học', icon: '🎯', criteria: 'COMPLETE_10_LESSONS' },
            { name: 'COMPLETE_25_LESSONS', description: 'Hoàn thành 25 bài học', icon: '🏆', criteria: 'COMPLETE_25_LESSONS' },
            { name: 'COMPLETE_1_COURSE', description: 'Hoàn thành khóa học đầu tiên', icon: '🎓', criteria: 'COMPLETE_1_COURSE' },
            { name: 'COMPLETE_3_COURSES', description: 'Hoàn thành 3 khóa học', icon: '💎', criteria: 'COMPLETE_3_COURSES' },
            { name: 'REACH_100_POINTS', description: 'Đạt 100 điểm', icon: '⭐', criteria: 'REACH_100_POINTS' },
            { name: 'REACH_500_POINTS', description: 'Đạt 500 điểm', icon: '🔥', criteria: 'REACH_500_POINTS' },
            { name: 'REACH_1000_POINTS', description: 'Đạt 1000 điểm', icon: '👑', criteria: 'REACH_1000_POINTS' },
        ];

        for (const badge of defaultBadges) {
            await (this.prisma as any).badge.upsert({
                where: { name: badge.name },
                update: {},
                create: { ...badge, courseId: null, creatorId: admin.id },
            });
        }
        console.log('[Gamification] ✅ Default global badges seeded (owned by Admin).');
    }
}

