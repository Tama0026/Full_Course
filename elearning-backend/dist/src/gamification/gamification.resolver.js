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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gamification_service_1 = require("./gamification.service");
const leaderboard_entry_entity_1 = require("./entities/leaderboard-entry.entity");
const badge_entity_1 = require("./entities/badge.entity");
const achievement_entity_1 = require("./entities/achievement.entity");
const badge_input_1 = require("./dto/badge.input");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let GamificationResolver = class GamificationResolver {
    gamificationService;
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    async getTopStudents(limit) {
        return this.gamificationService.getTopStudents(limit);
    }
    async getMyPoints(user) {
        return this.gamificationService.getUserPoints(user.id);
    }
    async getMyBadges(user) {
        return this.gamificationService.getUserBadges(user.id);
    }
    async getMyAchievementStats(user) {
        return this.gamificationService.getMyAchievementStats(user.id);
    }
    async getAllBadgesWithStatus(user) {
        return this.gamificationService.getAllBadgesWithStatus(user.id);
    }
    async getCourseBadges(courseId) {
        return this.gamificationService.getCourseBadges(courseId);
    }
    async getMyCreatedBadges(user) {
        if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Chỉ Instructor mới có thể xem danh sách Badge đã tạo');
        }
        return this.gamificationService.getInstructorBadges(user.id);
    }
    async createCourseBadge(input, user) {
        if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Chỉ Instructor mới có thể tạo Badge');
        }
        return this.gamificationService.createCourseBadge({
            ...input,
            creatorId: user.id,
        });
    }
    async updateCourseBadge(badgeId, input, user) {
        return this.gamificationService.updateCourseBadge(badgeId, user.id, input);
    }
    async deleteCourseBadge(badgeId, user) {
        return this.gamificationService.deleteCourseBadge(badgeId, user.id);
    }
};
exports.GamificationResolver = GamificationResolver;
__decorate([
    (0, graphql_1.Query)(() => [leaderboard_entry_entity_1.LeaderboardEntry], { name: 'topStudents' }),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "getTopStudents", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int, { name: 'myPoints' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "getMyPoints", null);
__decorate([
    (0, graphql_1.Query)(() => [badge_entity_1.BadgeType], { name: 'myBadges' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "getMyBadges", null);
__decorate([
    (0, graphql_1.Query)(() => achievement_entity_1.AchievementStats, { name: 'myAchievementStats' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "getMyAchievementStats", null);
__decorate([
    (0, graphql_1.Query)(() => [achievement_entity_1.BadgeWithStatus], { name: 'allBadgesWithStatus' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "getAllBadgesWithStatus", null);
__decorate([
    (0, graphql_1.Query)(() => [badge_entity_1.BadgeType], { name: 'courseBadges' }),
    __param(0, (0, graphql_1.Args)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "getCourseBadges", null);
__decorate([
    (0, graphql_1.Query)(() => [badge_entity_1.BadgeType], { name: 'myCreatedBadges' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "getMyCreatedBadges", null);
__decorate([
    (0, graphql_1.Mutation)(() => badge_entity_1.BadgeType, { name: 'createCourseBadge' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [badge_input_1.CreateBadgeInput, Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "createCourseBadge", null);
__decorate([
    (0, graphql_1.Mutation)(() => badge_entity_1.BadgeType, { name: 'updateCourseBadge' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('badgeId')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, badge_input_1.UpdateBadgeInput, Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "updateCourseBadge", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteCourseBadge' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('badgeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GamificationResolver.prototype, "deleteCourseBadge", null);
exports.GamificationResolver = GamificationResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], GamificationResolver);
//# sourceMappingURL=gamification.resolver.js.map