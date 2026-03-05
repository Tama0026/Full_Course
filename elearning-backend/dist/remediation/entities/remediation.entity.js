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
exports.RemediationReport = exports.ReviewPathItem = void 0;
const graphql_1 = require("@nestjs/graphql");
let ReviewPathItem = class ReviewPathItem {
    id;
    reportId;
    lessonId;
    lessonTitle;
    reason;
    priority;
    isCompleted;
    completedAt;
    createdAt;
};
exports.ReviewPathItem = ReviewPathItem;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ReviewPathItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewPathItem.prototype, "reportId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewPathItem.prototype, "lessonId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewPathItem.prototype, "lessonTitle", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewPathItem.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewPathItem.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ReviewPathItem.prototype, "isCompleted", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], ReviewPathItem.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ReviewPathItem.prototype, "createdAt", void 0);
exports.ReviewPathItem = ReviewPathItem = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewPathItem);
let RemediationReport = class RemediationReport {
    id;
    attemptId;
    userId;
    assessmentId;
    scorePercent;
    totalQuestions;
    wrongCount;
    aiAnalysis;
    severity;
    isResolved;
    createdAt;
    updatedAt;
    pathItems;
};
exports.RemediationReport = RemediationReport;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RemediationReport.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RemediationReport.prototype, "attemptId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RemediationReport.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RemediationReport.prototype, "assessmentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], RemediationReport.prototype, "scorePercent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RemediationReport.prototype, "totalQuestions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RemediationReport.prototype, "wrongCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RemediationReport.prototype, "aiAnalysis", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RemediationReport.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RemediationReport.prototype, "isResolved", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], RemediationReport.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], RemediationReport.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ReviewPathItem], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], RemediationReport.prototype, "pathItems", void 0);
exports.RemediationReport = RemediationReport = __decorate([
    (0, graphql_1.ObjectType)()
], RemediationReport);
//# sourceMappingURL=remediation.entity.js.map