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
  async checkAndAwardBadges(
    userId: string,
    specificCourseId?: string,
  ): Promise<void> {
    // Fetch all badges — filter by course if given, otherwise get all
    const allBadges = await (this.prisma as any).badge.findMany({
      where: specificCourseId
        ? { OR: [{ courseId: null }, { courseId: specificCourseId }] }
        : undefined,
    });

    for (const badge of allBadges) {
      // Skip if user already has this badge
      const existing = await (this.prisma as any).userBadge.findFirst({
        where: { userId, badgeId: badge.id },
      });
      if (existing) continue;

      // Evaluate based on scope
      const qualified = await this.evaluateBadgeCriteria(userId, badge);
      if (!qualified) continue;

      await (this.prisma as any).userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      console.log(
        `[Gamification] 🏅 Badge "${badge.name}" (${badge.courseId ? 'Course' : 'Global'}) awarded to user ${userId}`,
      );
    }
  }

  /**
   * Evaluate a single badge criterion for a user.
   * Generic evaluator — uses criteriaType + threshold from DB.
   */
  private async evaluateBadgeCriteria(
    userId: string,
    badge: any,
  ): Promise<boolean> {
    const currentValue = await this.getUserCurrentValue(
      userId,
      badge.criteriaType,
      badge.courseId,
    );
    return currentValue >= badge.threshold;
  }

  /**
   * Get user's current value for a given criteriaType.
   * This is the SINGLE SOURCE OF TRUTH for all badge evaluations.
   */
  async getUserCurrentValue(
    userId: string,
    criteriaType: string,
    courseId?: string | null,
  ): Promise<number> {
    switch (criteriaType) {
      case 'LESSONS_COMPLETED': {
        const where: any = { enrollment: { userId } };
        if (courseId) where.enrollment.course = { id: courseId };
        return this.prisma.progress.count({ where });
      }
      case 'COURSES_COMPLETED': {
        const where: any = { userId, isFinished: true };
        if (courseId) where.courseId = courseId;
        return this.prisma.enrollment.count({ where });
      }
      case 'POINTS_EARNED': {
        return this.getUserPoints(userId);
      }
      case 'LOGIN_STREAK': {
        const streak = await (this.prisma as any).loginStreak.findUnique({
          where: { userId },
        });
        return streak?.currentStreak || 0;
      }
      default:
        return 0;
    }
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
    const awardedAtMap = new Map(
      userBadges.map((ub: any) => [ub.badgeId, ub.awardedAt]),
    );

    const allBadges = await (this.prisma as any).badge.findMany({
      include: { course: { select: { title: true } } },
      orderBy: [{ courseId: 'asc' }, { name: 'asc' }],
    });

    // Pre-compute user values for each criteriaType to avoid N+1
    const valueCache = new Map<string, number>();
    const uniqueTypes = [
      ...new Set(allBadges.map((b: any) => b.criteriaType)),
    ] as string[];
    for (const type of uniqueTypes) {
      const value = await this.getUserCurrentValue(userId, type, null);
      valueCache.set(type, value);
    }

    return allBadges.map((badge: any) => {
      const earned = earnedBadgeIds.has(badge.id);
      // For course-scoped badges, the cached value might differ, but we use global for simplicity
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
  async updateCourseBadge(
    badgeId: string,
    creatorId: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      criteria?: string;
    },
  ) {
    const badge = await (this.prisma as any).badge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) throw new Error('Badge not found');
    if (badge.creatorId !== creatorId)
      throw new Error('Bạn không có quyền sửa Badge này');

    return (this.prisma as any).badge.update({
      where: { id: badgeId },
      data,
      include: { course: { select: { title: true } } },
    });
  }

  /**
   * Delete a badge (only by its creator, and only if no users have earned it).
   */
  async deleteCourseBadge(
    badgeId: string,
    creatorId: string,
  ): Promise<boolean> {
    const badge = await (this.prisma as any).badge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) throw new Error('Badge not found');
    if (badge.creatorId !== creatorId)
      throw new Error('Bạn không có quyền xóa Badge này');
    if (!badge.creatorId) throw new Error('Không thể xóa Badge hệ thống');

    // Safety check: prevent deleting badge with existing awardees
    const awardedCount = await (this.prisma as any).userBadge.count({
      where: { badgeId },
    });
    if (awardedCount > 0) {
      throw new Error(
        `Không thể xóa Badge này vì đã có ${awardedCount} học viên sở hữu`,
      );
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
  // ADMIN OPERATIONS
  // ════════════════════════════════════════════════

  /**
   * Get ALL badges with awardedCount for Admin dashboard.
   */
  async getAllBadgesForAdmin() {
    const badges = await (this.prisma as any).badge.findMany({
      include: {
        course: { select: { title: true } },
        _count: { select: { userBadges: true } },
      },
      orderBy: [{ courseId: 'asc' }, { createdAt: 'desc' }],
    });

    return badges.map((b: any) => ({
      ...b,
      courseName: b.course?.title || null,
      awardedCount: b._count?.userBadges || 0,
    }));
  }

  /**
   * Admin creates a badge (global or course-specific).
   * Auto-generates legacy `criteria` string from criteriaType + threshold.
   */
  async adminCreateBadge(input: {
    name: string;
    description: string;
    icon: string;
    criteriaType: string;
    threshold: number;
    courseId?: string;
    creatorId: string;
  }) {
    // Auto-generate legacy criteria string
    const criteriaMap: Record<string, (t: number) => string> = {
      LESSONS_COMPLETED: (t) => `COMPLETE_${t}_LESSON${t > 1 ? 'S' : ''}`,
      COURSES_COMPLETED: (t) => `COMPLETE_${t}_COURSE${t > 1 ? 'S' : ''}`,
      POINTS_EARNED: (t) => `REACH_${t}_POINTS`,
      LOGIN_STREAK: (t) => `LOGIN_STREAK_${t}_DAYS`,
    };
    const criteriaFn =
      criteriaMap[input.criteriaType] ||
      ((t: number) => `${input.criteriaType}_${t}`);
    const criteria = criteriaFn(input.threshold);

    const badge = await (this.prisma as any).badge.create({
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

  /**
   * Admin updates any badge (bypasses creator ownership check).
   */
  async adminUpdateBadge(
    badgeId: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      criteria?: string;
      criteriaType?: string;
      threshold?: number;
    },
  ) {
    const badge = await (this.prisma as any).badge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) throw new Error('Badge not found');

    // If criteriaType or threshold changed, regenerate legacy criteria string
    const updateData: any = { ...data };
    const newType = data.criteriaType || badge.criteriaType;
    const newThreshold = data.threshold ?? badge.threshold;

    if (data.criteriaType || data.threshold !== undefined) {
      const criteriaMap: Record<string, (t: number) => string> = {
        LESSONS_COMPLETED: (t) => `COMPLETE_${t}_LESSON${t > 1 ? 'S' : ''}`,
        COURSES_COMPLETED: (t) => `COMPLETE_${t}_COURSE${t > 1 ? 'S' : ''}`,
        POINTS_EARNED: (t) => `REACH_${t}_POINTS`,
        LOGIN_STREAK: (t) => `LOGIN_STREAK_${t}_DAYS`,
      };
      const criteriaFn =
        criteriaMap[newType] || ((t: number) => `${newType}_${t}`);
      updateData.criteria = criteriaFn(newThreshold);
      updateData.criteriaType = newType;
      updateData.threshold = newThreshold;
    }

    const updated = await (this.prisma as any).badge.update({
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

  /**
   * Admin deletes a badge (only if no users have earned it).
   */
  async adminDeleteBadge(badgeId: string): Promise<boolean> {
    const badge = await (this.prisma as any).badge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) throw new Error('Badge not found');

    const awardedCount = await (this.prisma as any).userBadge.count({
      where: { badgeId },
    });
    if (awardedCount > 0) {
      throw new Error(
        `Không thể xóa Badge này vì đã có ${awardedCount} học viên sở hữu`,
      );
    }

    await (this.prisma as any).badge.delete({ where: { id: badgeId } });
    return true;
  }

  /**
   * Get system-wide stats for Admin dashboard.
   */
  async getAdminStats() {
    const [totalUsers, totalCourses, totalEnrollments, totalBadges] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.course.count(),
        this.prisma.enrollment.count(),
        (this.prisma as any).badge.count(),
      ]);

    const totalStudents = await this.prisma.user.count({
      where: { role: 'STUDENT' },
    });
    const totalInstructors = await this.prisma.user.count({
      where: { role: 'INSTRUCTOR' },
    });

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalBadges,
      totalStudents,
      totalInstructors,
    };
  }

  // ════════════════════════════════════════════════
  // LOGIN STREAK
  // ════════════════════════════════════════════════

  /**
   * Record user login activity and update streak.
   * Should be called from AuthService.login()
   */
  async recordLoginActivity(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const existing = await (this.prisma as any).loginStreak.findUnique({
      where: { userId },
    });

    if (!existing) {
      // First login ever
      await (this.prisma as any).loginStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
        },
      });
      console.log(`[Streak] 🔥 First login recorded for user ${userId}`);
    } else if (existing.lastLoginDate === today) {
      // Already logged in today, do nothing
      return;
    } else {
      // Check if yesterday
      const lastDate = new Date(existing.lastLoginDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      let newStreak = 1;
      if (diffDays === 1) {
        // Consecutive day → increment streak
        newStreak = existing.currentStreak + 1;
      }
      // diffDays > 1 → streak resets to 1

      const longestStreak = Math.max(existing.longestStreak, newStreak);

      await (this.prisma as any).loginStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak,
          lastLoginDate: today,
        },
      });
      console.log(
        `[Streak] 🔥 User ${userId}: streak = ${newStreak} (longest: ${longestStreak})`,
      );
    }

    // Check if any LOGIN_STREAK badges can be awarded
    await this.checkAndAwardBadges(userId);
  }

  /**
   * Get login streak for a user.
   */
  async getLoginStreak(userId: string) {
    const streak = await (this.prisma as any).loginStreak.findUnique({
      where: { userId },
    });
    return {
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      lastLoginDate: streak?.lastLoginDate || null,
    };
  }
}
