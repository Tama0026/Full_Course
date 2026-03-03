"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GamificationService = class GamificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addPoints(userId, points) {
        await this.prisma.leaderboard.upsert({
            where: { userId },
            update: { totalPoints: { increment: points } },
            create: { userId, totalPoints: points },
        });
        console.log(`[Gamification] +${points} points for user ${userId}`);
        await this.checkAndAwardBadges(userId);
    }
    async getTopStudents(limit = 10) {
        const entries = await this.prisma.leaderboard.findMany({
            orderBy: { totalPoints: 'desc' },
            take: limit,
            include: {
                user: {
                    select: { name: true, avatar: true, email: true },
                },
            },
        });
        return entries.map((entry, index) => ({
            id: entry.id,
            userId: entry.userId,
            totalPoints: entry.totalPoints,
            updatedAt: entry.updatedAt,
            userName: entry.user.name || entry.user.email,
            userAvatar: entry.user.avatar,
            rank: index + 1,
        }));
    }
    async getUserPoints(userId) {
        const entry = await this.prisma.leaderboard.findUnique({
            where: { userId },
        });
        return entry?.totalPoints || 0;
    }
    async checkAndAwardBadges(userId, specificCourseId) {
        const allBadges = await this.prisma.badge.findMany({
            where: specificCourseId
                ? { OR: [{ courseId: null }, { courseId: specificCourseId }] }
                : undefined,
        });
        for (const badge of allBadges) {
            const existing = await this.prisma.userBadge.findFirst({
                where: { userId, badgeId: badge.id },
            });
            if (existing)
                continue;
            const qualified = await this.evaluateBadgeCriteria(userId, badge);
            if (!qualified)
                continue;
            await this.prisma.userBadge.create({
                data: { userId, badgeId: badge.id },
            });
            console.log(`[Gamification] 🏅 Badge "${badge.name}" (${badge.courseId ? 'Course' : 'Global'}) awarded to user ${userId}`);
        }
    }
    async evaluateBadgeCriteria(userId, badge) {
        const currentValue = await this.getUserCurrentValue(userId, badge.criteriaType, badge.courseId);
        return currentValue >= badge.threshold;
    }
    async getUserCurrentValue(userId, criteriaType, courseId) {
        switch (criteriaType) {
            case 'LESSONS_COMPLETED': {
                const where = { enrollment: { userId } };
                if (courseId)
                    where.enrollment.course = { id: courseId };
                return this.prisma.progress.count({ where });
            }
            case 'COURSES_COMPLETED': {
                const where = { userId, isFinished: true };
                if (courseId)
                    where.courseId = courseId;
                return this.prisma.enrollment.count({ where });
            }
            case 'POINTS_EARNED': {
                return this.getUserPoints(userId);
            }
            case 'LOGIN_STREAK': {
                const streak = await this.prisma.loginStreak.findUnique({ where: { userId } });
                return streak?.currentStreak || 0;
            }
            default:
                return 0;
        }
    }
    async getUserBadges(userId) {
        const userBadges = await this.prisma.userBadge.findMany({
            where: { userId },
            include: { badge: { include: { course: { select: { title: true } } } } },
            orderBy: { awardedAt: 'desc' },
        });
        return userBadges.map((ub) => ({
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
    async getMyAchievementStats(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, avatar: true },
        });
        const entry = await this.prisma.leaderboard.findUnique({
            where: { userId },
        });
        const totalPoints = entry?.totalPoints || 0;
        const higherPointsCount = await this.prisma.leaderboard.count({
            where: { totalPoints: { gt: totalPoints } },
        });
        const globalRank = higherPointsCount + 1;
        const totalUsersWithPoints = await this.prisma.leaderboard.count();
        let percentile = 0;
        if (totalUsersWithPoints > 1) {
            const lowerOrEqualCount = await this.prisma.leaderboard.count({
                where: { totalPoints: { lte: totalPoints } },
            });
            percentile = (lowerOrEqualCount / totalUsersWithPoints) * 100;
        }
        else if (totalUsersWithPoints === 1) {
            percentile = 100;
        }
        const earnedBadgesCount = await this.prisma.userBadge.count({
            where: { userId },
        });
        const totalBadgesCount = await this.prisma.badge.count();
        return {
            totalPoints,
            globalRank,
            percentile: Math.round(percentile * 10) / 10,
            earnedBadges: earnedBadgesCount,
            totalBadges: totalBadgesCount,
            userName: user?.name ?? undefined,
            userAvatar: user?.avatar ?? undefined,
        };
    }
    async getAllBadgesWithStatus(userId) {
        const userBadges = await this.prisma.userBadge.findMany({
            where: { userId },
        });
        const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
        const awardedAtMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.awardedAt]));
        const allBadges = await this.prisma.badge.findMany({
            include: { course: { select: { title: true } } },
            orderBy: [{ courseId: 'asc' }, { name: 'asc' }],
        });
        const valueCache = new Map();
        const uniqueTypes = [...new Set(allBadges.map((b) => b.criteriaType))];
        for (const type of uniqueTypes) {
            const value = await this.getUserCurrentValue(userId, type, null);
            valueCache.set(type, value);
        }
        return allBadges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            const currentProgress = valueCache.get(badge.criteriaType) || 0;
            return {
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                criteria: badge.criteria,
                criteriaType: badge.criteriaType,
                threshold: badge.threshold,
                currentProgress: Math.min(currentProgress, badge.threshold),
                courseId: badge.courseId,
                courseName: badge.course?.title || null,
                earned,
                awardedAt: earned ? awardedAtMap.get(badge.id) : null,
            };
        });
    }
    async createCourseBadge(input) {
        const badge = await this.prisma.badge.create({
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
    async updateCourseBadge(badgeId, creatorId, data) {
        const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
        if (!badge)
            throw new Error('Badge not found');
        if (badge.creatorId !== creatorId)
            throw new Error('Bạn không có quyền sửa Badge này');
        return this.prisma.badge.update({
            where: { id: badgeId },
            data,
            include: { course: { select: { title: true } } },
        });
    }
    async deleteCourseBadge(badgeId, creatorId) {
        const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
        if (!badge)
            throw new Error('Badge not found');
        if (badge.creatorId !== creatorId)
            throw new Error('Bạn không có quyền xóa Badge này');
        if (!badge.creatorId)
            throw new Error('Không thể xóa Badge hệ thống');
        const awardedCount = await this.prisma.userBadge.count({
            where: { badgeId },
        });
        if (awardedCount > 0) {
            throw new Error(`Không thể xóa Badge này vì đã có ${awardedCount} học viên sở hữu`);
        }
        await this.prisma.badge.delete({ where: { id: badgeId } });
        return true;
    }
    async getCourseBadges(courseId) {
        const badges = await this.prisma.badge.findMany({
            where: { courseId },
            include: {
                course: { select: { title: true } },
                _count: { select: { userBadges: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return badges.map((b) => ({
            ...b,
            courseName: b.course?.title || null,
            awardedCount: b._count?.userBadges || 0,
        }));
    }
    async getInstructorBadges(instructorId) {
        const badges = await this.prisma.badge.findMany({
            where: { creatorId: instructorId },
            include: {
                course: { select: { title: true } },
                _count: { select: { userBadges: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return badges.map((b) => ({
            ...b,
            courseName: b.course?.title || null,
            awardedCount: b._count?.userBadges || 0,
        }));
    }
    async getAllBadgesForAdmin() {
        const badges = await this.prisma.badge.findMany({
            include: {
                course: { select: { title: true } },
                _count: { select: { userBadges: true } },
            },
            orderBy: [{ courseId: 'asc' }, { createdAt: 'desc' }],
        });
        return badges.map((b) => ({
            ...b,
            courseName: b.course?.title || null,
            awardedCount: b._count?.userBadges || 0,
        }));
    }
    async adminCreateBadge(input) {
        const criteriaMap = {
            'LESSONS_COMPLETED': (t) => `COMPLETE_${t}_LESSON${t > 1 ? 'S' : ''}`,
            'COURSES_COMPLETED': (t) => `COMPLETE_${t}_COURSE${t > 1 ? 'S' : ''}`,
            'POINTS_EARNED': (t) => `REACH_${t}_POINTS`,
            'LOGIN_STREAK': (t) => `LOGIN_STREAK_${t}_DAYS`,
        };
        const criteriaFn = criteriaMap[input.criteriaType] || ((t) => `${input.criteriaType}_${t}`);
        const criteria = criteriaFn(input.threshold);
        const badge = await this.prisma.badge.create({
            data: {
                name: input.name,
                description: input.description,
                icon: input.icon,
                criteria,
                criteriaType: input.criteriaType,
                threshold: input.threshold,
                courseId: input.courseId || null,
                creatorId: input.creatorId,
            },
            include: {
                course: { select: { title: true } },
                _count: { select: { userBadges: true } },
            },
        });
        return {
            ...badge,
            courseName: badge.course?.title || null,
            awardedCount: badge._count?.userBadges || 0,
        };
    }
    async adminUpdateBadge(badgeId, data) {
        const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
        if (!badge)
            throw new Error('Badge not found');
        const updateData = { ...data };
        const newType = data.criteriaType || badge.criteriaType;
        const newThreshold = data.threshold ?? badge.threshold;
        if (data.criteriaType || data.threshold !== undefined) {
            const criteriaMap = {
                'LESSONS_COMPLETED': (t) => `COMPLETE_${t}_LESSON${t > 1 ? 'S' : ''}`,
                'COURSES_COMPLETED': (t) => `COMPLETE_${t}_COURSE${t > 1 ? 'S' : ''}`,
                'POINTS_EARNED': (t) => `REACH_${t}_POINTS`,
                'LOGIN_STREAK': (t) => `LOGIN_STREAK_${t}_DAYS`,
            };
            const criteriaFn = criteriaMap[newType] || ((t) => `${newType}_${t}`);
            updateData.criteria = criteriaFn(newThreshold);
            updateData.criteriaType = newType;
            updateData.threshold = newThreshold;
        }
        const updated = await this.prisma.badge.update({
            where: { id: badgeId },
            data: updateData,
            include: {
                course: { select: { title: true } },
                _count: { select: { userBadges: true } },
            },
        });
        return {
            ...updated,
            courseName: updated.course?.title || null,
            awardedCount: updated._count?.userBadges || 0,
        };
    }
    async adminDeleteBadge(badgeId) {
        const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
        if (!badge)
            throw new Error('Badge not found');
        const awardedCount = await this.prisma.userBadge.count({
            where: { badgeId },
        });
        if (awardedCount > 0) {
            throw new Error(`Không thể xóa Badge này vì đã có ${awardedCount} học viên sở hữu`);
        }
        await this.prisma.badge.delete({ where: { id: badgeId } });
        return true;
    }
    async getAdminStats() {
        const [totalUsers, totalCourses, totalEnrollments, totalBadges] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.course.count(),
            this.prisma.enrollment.count(),
            this.prisma.badge.count(),
        ]);
        const totalStudents = await this.prisma.user.count({ where: { role: 'STUDENT' } });
        const totalInstructors = await this.prisma.user.count({ where: { role: 'INSTRUCTOR' } });
        return {
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalBadges,
            totalStudents,
            totalInstructors,
        };
    }
    async recordLoginActivity(userId) {
        const today = new Date().toISOString().split('T')[0];
        const existing = await this.prisma.loginStreak.findUnique({
            where: { userId },
        });
        if (!existing) {
            await this.prisma.loginStreak.create({
                data: {
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastLoginDate: today,
                },
            });
            console.log(`[Streak] 🔥 First login recorded for user ${userId}`);
        }
        else if (existing.lastLoginDate === today) {
            return;
        }
        else {
            const lastDate = new Date(existing.lastLoginDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            let newStreak = 1;
            if (diffDays === 1) {
                newStreak = existing.currentStreak + 1;
            }
            const longestStreak = Math.max(existing.longestStreak, newStreak);
            await this.prisma.loginStreak.update({
                where: { userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak,
                    lastLoginDate: today,
                },
            });
            console.log(`[Streak] 🔥 User ${userId}: streak = ${newStreak} (longest: ${longestStreak})`);
        }
        await this.checkAndAwardBadges(userId);
    }
    async getLoginStreak(userId) {
        const streak = await this.prisma.loginStreak.findUnique({
            where: { userId },
        });
        return {
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0,
            lastLoginDate: streak?.lastLoginDate || null,
        };
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map