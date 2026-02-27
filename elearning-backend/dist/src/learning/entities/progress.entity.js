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
exports.Progress = void 0;
const graphql_1 = require("@nestjs/graphql");
const lesson_entity_1 = require("../../courses/entities/lesson.entity");
let Progress = class Progress {
    id;
    enrollmentId;
    lessonId;
    lesson;
    completedAt;
};
exports.Progress = Progress;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Progress.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Progress.prototype, "enrollmentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Progress.prototype, "lessonId", void 0);
__decorate([
    (0, graphql_1.Field)(() => lesson_entity_1.Lesson, { nullable: true }),
    __metadata("design:type", lesson_entity_1.Lesson)
], Progress.prototype, "lesson", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Progress.prototype, "completedAt", void 0);
exports.Progress = Progress = __decorate([
    (0, graphql_1.ObjectType)()
], Progress);
//# sourceMappingURL=progress.entity.js.map