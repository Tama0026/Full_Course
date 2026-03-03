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
exports.AdminStats = exports.AdminBadgeType = void 0;
const graphql_1 = require("@nestjs/graphql");
let AdminBadgeType = class AdminBadgeType {
    id;
    name;
    description;
    icon;
    criteria;
    criteriaType;
    threshold;
    courseId;
    courseName;
    creatorId;
    awardedCount;
    createdAt;
};
exports.AdminBadgeType = AdminBadgeType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "criteria", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "criteriaType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminBadgeType.prototype, "threshold", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "courseName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminBadgeType.prototype, "creatorId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminBadgeType.prototype, "awardedCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AdminBadgeType.prototype, "createdAt", void 0);
exports.AdminBadgeType = AdminBadgeType = __decorate([
    (0, graphql_1.ObjectType)()
], AdminBadgeType);
let AdminStats = class AdminStats {
    totalUsers;
    totalCourses;
    totalEnrollments;
    totalBadges;
    totalStudents;
    totalInstructors;
};
exports.AdminStats = AdminStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminStats.prototype, "totalUsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminStats.prototype, "totalCourses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminStats.prototype, "totalEnrollments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminStats.prototype, "totalBadges", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminStats.prototype, "totalStudents", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminStats.prototype, "totalInstructors", void 0);
exports.AdminStats = AdminStats = __decorate([
    (0, graphql_1.ObjectType)()
], AdminStats);
//# sourceMappingURL=admin.entity.js.map