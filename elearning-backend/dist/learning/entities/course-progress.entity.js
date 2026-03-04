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
exports.CourseProgress = void 0;
const graphql_1 = require("@nestjs/graphql");
const enrollment_entity_1 = require("./enrollment.entity");
const progress_entity_1 = require("./progress.entity");
let CourseProgress = class CourseProgress {
    enrollment;
    progressPercentage;
    completedLessons;
    totalLessons;
    completedItems;
};
exports.CourseProgress = CourseProgress;
__decorate([
    (0, graphql_1.Field)(() => enrollment_entity_1.Enrollment),
    __metadata("design:type", enrollment_entity_1.Enrollment)
], CourseProgress.prototype, "enrollment", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CourseProgress.prototype, "progressPercentage", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], CourseProgress.prototype, "completedLessons", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], CourseProgress.prototype, "totalLessons", void 0);
__decorate([
    (0, graphql_1.Field)(() => [progress_entity_1.Progress]),
    __metadata("design:type", Array)
], CourseProgress.prototype, "completedItems", void 0);
exports.CourseProgress = CourseProgress = __decorate([
    (0, graphql_1.ObjectType)()
], CourseProgress);
//# sourceMappingURL=course-progress.entity.js.map