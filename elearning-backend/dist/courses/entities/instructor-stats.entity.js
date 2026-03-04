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
exports.InstructorStats = exports.CourseStats = void 0;
const graphql_1 = require("@nestjs/graphql");
let CourseStats = class CourseStats {
    courseId;
    title;
    studentCount;
    completionRate;
    avgQuizScore;
};
exports.CourseStats = CourseStats;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseStats.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseStats.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CourseStats.prototype, "studentCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CourseStats.prototype, "completionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CourseStats.prototype, "avgQuizScore", void 0);
exports.CourseStats = CourseStats = __decorate([
    (0, graphql_1.ObjectType)()
], CourseStats);
let InstructorStats = class InstructorStats {
    totalCourses;
    totalStudents;
    totalRevenue;
    avgCompletionRate;
    courseBreakdown;
};
exports.InstructorStats = InstructorStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InstructorStats.prototype, "totalCourses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InstructorStats.prototype, "totalStudents", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], InstructorStats.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InstructorStats.prototype, "avgCompletionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CourseStats]),
    __metadata("design:type", Array)
], InstructorStats.prototype, "courseBreakdown", void 0);
exports.InstructorStats = InstructorStats = __decorate([
    (0, graphql_1.ObjectType)()
], InstructorStats);
//# sourceMappingURL=instructor-stats.entity.js.map