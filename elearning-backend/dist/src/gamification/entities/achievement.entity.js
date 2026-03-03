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
exports.BadgeWithStatus = exports.AchievementStats = void 0;
const graphql_1 = require("@nestjs/graphql");
let AchievementStats = class AchievementStats {
    totalPoints;
    globalRank;
    percentile;
    earnedBadges;
    totalBadges;
    userName;
    userAvatar;
};
exports.AchievementStats = AchievementStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AchievementStats.prototype, "totalPoints", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AchievementStats.prototype, "globalRank", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AchievementStats.prototype, "percentile", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AchievementStats.prototype, "earnedBadges", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AchievementStats.prototype, "totalBadges", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AchievementStats.prototype, "userName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AchievementStats.prototype, "userAvatar", void 0);
exports.AchievementStats = AchievementStats = __decorate([
    (0, graphql_1.ObjectType)()
], AchievementStats);
let BadgeWithStatus = class BadgeWithStatus {
    id;
    name;
    description;
    icon;
    criteria;
    courseId;
    courseName;
    earned;
    awardedAt;
};
exports.BadgeWithStatus = BadgeWithStatus;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeWithStatus.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeWithStatus.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeWithStatus.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeWithStatus.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeWithStatus.prototype, "criteria", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BadgeWithStatus.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BadgeWithStatus.prototype, "courseName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BadgeWithStatus.prototype, "earned", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], BadgeWithStatus.prototype, "awardedAt", void 0);
exports.BadgeWithStatus = BadgeWithStatus = __decorate([
    (0, graphql_1.ObjectType)()
], BadgeWithStatus);
//# sourceMappingURL=achievement.entity.js.map