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
exports.AssessmentAttempt = exports.Assessment = exports.AssessmentQuestion = void 0;
const graphql_1 = require("@nestjs/graphql");
let AssessmentQuestion = class AssessmentQuestion {
    id;
    assessmentId;
    prompt;
    options;
    correctAnswer;
    explanation;
    order;
};
exports.AssessmentQuestion = AssessmentQuestion;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AssessmentQuestion.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AssessmentQuestion.prototype, "assessmentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AssessmentQuestion.prototype, "prompt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], AssessmentQuestion.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AssessmentQuestion.prototype, "correctAnswer", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AssessmentQuestion.prototype, "explanation", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AssessmentQuestion.prototype, "order", void 0);
exports.AssessmentQuestion = AssessmentQuestion = __decorate([
    (0, graphql_1.ObjectType)()
], AssessmentQuestion);
let Assessment = class Assessment {
    id;
    title;
    description;
    timeLimit;
    passingScore;
    isActive;
    creatorId;
    createdAt;
    updatedAt;
    questions;
};
exports.Assessment = Assessment;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Assessment.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Assessment.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Assessment.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Assessment.prototype, "timeLimit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Assessment.prototype, "passingScore", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Assessment.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Assessment.prototype, "creatorId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Assessment.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Assessment.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AssessmentQuestion], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Assessment.prototype, "questions", void 0);
exports.Assessment = Assessment = __decorate([
    (0, graphql_1.ObjectType)()
], Assessment);
let AssessmentAttempt = class AssessmentAttempt {
    id;
    userId;
    assessmentId;
    startedAt;
    completedAt;
    score;
    passed;
    isInvalid;
};
exports.AssessmentAttempt = AssessmentAttempt;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AssessmentAttempt.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AssessmentAttempt.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AssessmentAttempt.prototype, "assessmentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AssessmentAttempt.prototype, "startedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AssessmentAttempt.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AssessmentAttempt.prototype, "score", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], AssessmentAttempt.prototype, "passed", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AssessmentAttempt.prototype, "isInvalid", void 0);
exports.AssessmentAttempt = AssessmentAttempt = __decorate([
    (0, graphql_1.ObjectType)()
], AssessmentAttempt);
//# sourceMappingURL=assessment.entity.js.map