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
exports.UpdateCurriculumInput = exports.SectionCurriculumInput = exports.LessonCurriculumInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let LessonCurriculumInput = class LessonCurriculumInput {
    id;
    title;
    type;
    videoUrl;
    body;
    duration;
    isPreview;
    order;
};
exports.LessonCurriculumInput = LessonCurriculumInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LessonCurriculumInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LessonCurriculumInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { defaultValue: 'VIDEO' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LessonCurriculumInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LessonCurriculumInput.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LessonCurriculumInput.prototype, "body", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], LessonCurriculumInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LessonCurriculumInput.prototype, "isPreview", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], LessonCurriculumInput.prototype, "order", void 0);
exports.LessonCurriculumInput = LessonCurriculumInput = __decorate([
    (0, graphql_1.InputType)()
], LessonCurriculumInput);
let SectionCurriculumInput = class SectionCurriculumInput {
    id;
    title;
    order;
    lessons;
};
exports.SectionCurriculumInput = SectionCurriculumInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SectionCurriculumInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SectionCurriculumInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SectionCurriculumInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => [LessonCurriculumInput], { defaultValue: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LessonCurriculumInput),
    __metadata("design:type", Array)
], SectionCurriculumInput.prototype, "lessons", void 0);
exports.SectionCurriculumInput = SectionCurriculumInput = __decorate([
    (0, graphql_1.InputType)()
], SectionCurriculumInput);
let UpdateCurriculumInput = class UpdateCurriculumInput {
    sections;
};
exports.UpdateCurriculumInput = UpdateCurriculumInput;
__decorate([
    (0, graphql_1.Field)(() => [SectionCurriculumInput]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SectionCurriculumInput),
    __metadata("design:type", Array)
], UpdateCurriculumInput.prototype, "sections", void 0);
exports.UpdateCurriculumInput = UpdateCurriculumInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCurriculumInput);
//# sourceMappingURL=update-curriculum.input.js.map