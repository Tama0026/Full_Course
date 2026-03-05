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
exports.CourseStudent = exports.CourseStudentProgress = exports.Course = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../auth/entities/user.entity");
const section_entity_1 = require("./section.entity");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.CourseType, {
    name: 'CourseType',
    description: 'Type of the course: MARKETPLACE (public) or PRIVATE (code-only)',
});
let Course = class Course {
    id;
    title;
    description;
    price;
    type;
    enrollCode;
    thumbnail;
    category;
    learningOutcomes;
    averageRating;
    reviewCount;
    totalDuration;
    published;
    isActive;
    maxStudents;
    isApprovalRequired;
    instructorId;
    instructor;
    sections;
    createdAt;
    updatedAt;
};
exports.Course = Course;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Course.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.CourseType),
    __metadata("design:type", String)
], Course.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "enrollCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], Course.prototype, "learningOutcomes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Course.prototype, "averageRating", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Course.prototype, "reviewCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Course.prototype, "totalDuration", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Course.prototype, "published", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Course.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], Course.prototype, "maxStudents", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Course.prototype, "isApprovalRequired", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Course.prototype, "instructorId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Course.prototype, "instructor", void 0);
__decorate([
    (0, graphql_1.Field)(() => [section_entity_1.Section], { nullable: true }),
    __metadata("design:type", Array)
], Course.prototype, "sections", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Course.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Course.prototype, "updatedAt", void 0);
exports.Course = Course = __decorate([
    (0, graphql_1.ObjectType)()
], Course);
let CourseStudentProgress = class CourseStudentProgress {
    lessonTitle;
    chapterTitle;
    completedAt;
};
exports.CourseStudentProgress = CourseStudentProgress;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseStudentProgress.prototype, "lessonTitle", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseStudentProgress.prototype, "chapterTitle", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CourseStudentProgress.prototype, "completedAt", void 0);
exports.CourseStudentProgress = CourseStudentProgress = __decorate([
    (0, graphql_1.ObjectType)()
], CourseStudentProgress);
let CourseStudent = class CourseStudent {
    id;
    name;
    email;
    avatar;
    progressPercent;
    lastActive;
    progressTimeline;
    lastRemindedAt;
    enrolledAt;
    status;
};
exports.CourseStudent = CourseStudent;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseStudent.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseStudent.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseStudent.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CourseStudent.prototype, "avatar", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CourseStudent.prototype, "progressPercent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CourseStudent.prototype, "lastActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CourseStudentProgress]),
    __metadata("design:type", Array)
], CourseStudent.prototype, "progressTimeline", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CourseStudent.prototype, "lastRemindedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CourseStudent.prototype, "enrolledAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CourseStudent.prototype, "status", void 0);
exports.CourseStudent = CourseStudent = __decorate([
    (0, graphql_1.ObjectType)()
], CourseStudent);
//# sourceMappingURL=course.entity.js.map