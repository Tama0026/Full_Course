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
exports.AdminCourse = exports.AdminCourseInstructor = void 0;
const graphql_1 = require("@nestjs/graphql");
let AdminCourseInstructor = class AdminCourseInstructor {
    id;
    name;
    email;
};
exports.AdminCourseInstructor = AdminCourseInstructor;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminCourseInstructor.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdminCourseInstructor.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminCourseInstructor.prototype, "email", void 0);
exports.AdminCourseInstructor = AdminCourseInstructor = __decorate([
    (0, graphql_1.ObjectType)()
], AdminCourseInstructor);
let AdminCourse = class AdminCourse {
    id;
    title;
    description;
    price;
    thumbnail;
    category;
    published;
    isActive;
    instructorId;
    instructor;
    enrollmentCount;
    sectionCount;
    createdAt;
    updatedAt;
};
exports.AdminCourse = AdminCourse;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AdminCourse.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminCourse.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminCourse.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdminCourse.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdminCourse.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdminCourse.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AdminCourse.prototype, "published", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AdminCourse.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminCourse.prototype, "instructorId", void 0);
__decorate([
    (0, graphql_1.Field)(() => AdminCourseInstructor),
    __metadata("design:type", AdminCourseInstructor)
], AdminCourse.prototype, "instructor", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminCourse.prototype, "enrollmentCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdminCourse.prototype, "sectionCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AdminCourse.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AdminCourse.prototype, "updatedAt", void 0);
exports.AdminCourse = AdminCourse = __decorate([
    (0, graphql_1.ObjectType)()
], AdminCourse);
//# sourceMappingURL=admin-course.entity.js.map