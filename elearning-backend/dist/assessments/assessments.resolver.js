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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentQuestionResolver = exports.AssessmentsResolver = exports.AnswerInput = exports.UpdateQuestionInlineInput = exports.CreateQuestionInput = exports.CreateAssessmentInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const assessments_service_1 = require("./assessments.service");
const assessment_entity_1 = require("./entities/assessment.entity");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
let CreateAssessmentInput = class CreateAssessmentInput {
    title;
    description;
    timeLimit;
    passingScore;
    type;
    isActive;
    numberOfSets;
    maxAttempts;
    maxViolations;
    totalPoints;
    isPublished;
};
exports.CreateAssessmentInput = CreateAssessmentInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssessmentInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssessmentInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssessmentInput.prototype, "timeLimit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAssessmentInput.prototype, "passingScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.AssessmentType, { defaultValue: 'MARKETPLACE' }),
    __metadata("design:type", String)
], CreateAssessmentInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssessmentInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssessmentInput.prototype, "numberOfSets", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssessmentInput.prototype, "maxAttempts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssessmentInput.prototype, "maxViolations", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssessmentInput.prototype, "totalPoints", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssessmentInput.prototype, "isPublished", void 0);
exports.CreateAssessmentInput = CreateAssessmentInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAssessmentInput);
let CreateQuestionInput = class CreateQuestionInput {
    setCode;
    prompt;
    options;
    correctAnswer;
    explanation;
    order;
    points;
    difficulty;
};
exports.CreateQuestionInput = CreateQuestionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "setCode", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "prompt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateQuestionInput.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "correctAnswer", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "explanation", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateQuestionInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateQuestionInput.prototype, "points", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "difficulty", void 0);
exports.CreateQuestionInput = CreateQuestionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateQuestionInput);
let UpdateQuestionInlineInput = class UpdateQuestionInlineInput {
    points;
    correctAnswer;
    difficulty;
};
exports.UpdateQuestionInlineInput = UpdateQuestionInlineInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateQuestionInlineInput.prototype, "points", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateQuestionInlineInput.prototype, "correctAnswer", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuestionInlineInput.prototype, "difficulty", void 0);
exports.UpdateQuestionInlineInput = UpdateQuestionInlineInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateQuestionInlineInput);
let AnswerInput = class AnswerInput {
    questionId;
    answer;
};
exports.AnswerInput = AnswerInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnswerInput.prototype, "questionId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnswerInput.prototype, "answer", void 0);
exports.AnswerInput = AnswerInput = __decorate([
    (0, graphql_1.InputType)()
], AnswerInput);
let AssessmentsResolver = class AssessmentsResolver {
    assessmentsService;
    constructor(assessmentsService) {
        this.assessmentsService = assessmentsService;
    }
    async getAssessments(user) {
        return this.assessmentsService.getAssessments(user.role, user.id);
    }
    async getAssessment(id) {
        return this.assessmentsService.getAssessment(id);
    }
    async createAssessment(input, user) {
        return this.assessmentsService.createAssessment(user.id, input);
    }
    async deleteAssessment(id, user) {
        return this.assessmentsService.deleteAssessment(id, user.id);
    }
    async createAssessmentQuestion(assessmentId, input, user) {
        return this.assessmentsService.createQuestion(assessmentId, user.id, input);
    }
    async deleteAssessmentQuestion(id, user) {
        return this.assessmentsService.deleteQuestion(id, user.id);
    }
    async startAssessmentAttempt(assessmentId, user) {
        return this.assessmentsService.startAttempt(assessmentId, user.id);
    }
    async submitAssessmentAttempt(attemptId, answers, user) {
        return this.assessmentsService.submitAttempt(attemptId, user.id, answers);
    }
    async myAttemptHistory(assessmentId, user) {
        return this.assessmentsService.getAttemptHistory(assessmentId, user.id);
    }
    async assessmentReport(assessmentId, user) {
        return this.assessmentsService.getAssessmentReport(assessmentId, user.id);
    }
    async publishAssessment(assessmentId, user) {
        return this.assessmentsService.publishAssessment(assessmentId, user.id);
    }
    async unpublishAssessment(assessmentId, user) {
        return this.assessmentsService.unpublishAssessment(assessmentId, user.id);
    }
    async autoBalancePoints(assessmentId, user) {
        return this.assessmentsService.autoBalancePoints(assessmentId, user.id);
    }
    async updateQuestionInline(questionId, input, user) {
        return this.assessmentsService.updateQuestionInline(questionId, user.id, input);
    }
    async generateAiExamQuestions(assessmentId, questionCount, bankId, setCode, user) {
        return this.assessmentsService.generateAiExamQuestions(assessmentId, user.id, bankId, questionCount, setCode);
    }
};
exports.AssessmentsResolver = AssessmentsResolver;
__decorate([
    (0, graphql_1.Query)(() => [assessment_entity_1.Assessment], { name: 'assessments' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "getAssessments", null);
__decorate([
    (0, graphql_1.Query)(() => assessment_entity_1.Assessment, { name: 'assessment' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "getAssessment", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.Assessment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAssessmentInput, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "createAssessment", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.Assessment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "deleteAssessment", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.AssessmentQuestion),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateQuestionInput, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "createAssessmentQuestion", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.AssessmentQuestion),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "deleteAssessmentQuestion", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.AssessmentAttempt),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "startAssessmentAttempt", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.AssessmentAttempt),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('attemptId')),
    __param(1, (0, graphql_1.Args)({ name: 'answers', type: () => [AnswerInput] })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "submitAssessmentAttempt", null);
__decorate([
    (0, graphql_1.Query)(() => [assessment_entity_1.AssessmentAttempt], { name: 'myAttemptHistory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "myAttemptHistory", null);
__decorate([
    (0, graphql_1.Query)(() => assessment_entity_1.AssessmentReport, { name: 'assessmentReport' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "assessmentReport", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.Assessment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "publishAssessment", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.Assessment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "unpublishAssessment", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.Assessment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "autoBalancePoints", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.AssessmentQuestion),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('questionId')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateQuestionInlineInput, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "updateQuestionInline", null);
__decorate([
    (0, graphql_1.Mutation)(() => assessment_entity_1.Assessment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('assessmentId')),
    __param(1, (0, graphql_1.Args)('questionCount', { type: () => graphql_1.Int })),
    __param(2, (0, graphql_1.Args)('bankId', { nullable: true })),
    __param(3, (0, graphql_1.Args)('setCode', { defaultValue: 'SET_1' })),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentsResolver.prototype, "generateAiExamQuestions", null);
exports.AssessmentsResolver = AssessmentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => assessment_entity_1.Assessment),
    __metadata("design:paramtypes", [assessments_service_1.AssessmentsService])
], AssessmentsResolver);
let AssessmentQuestionResolver = class AssessmentQuestionResolver {
    prompt(question) {
        return question.content;
    }
    options(question) {
        if (typeof question.options === 'string') {
            try {
                return JSON.parse(question.options);
            }
            catch (e) {
                return [];
            }
        }
        return question.options || [];
    }
    explanation() {
        return '';
    }
    order() {
        return 0;
    }
    correctAnswer(question) {
        return question.correctAnswer.toString();
    }
};
exports.AssessmentQuestionResolver = AssessmentQuestionResolver;
__decorate([
    (0, graphql_1.ResolveField)(() => String),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssessmentQuestionResolver.prototype, "prompt", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [String]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssessmentQuestionResolver.prototype, "options", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssessmentQuestionResolver.prototype, "explanation", null);
__decorate([
    (0, graphql_1.ResolveField)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssessmentQuestionResolver.prototype, "order", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssessmentQuestionResolver.prototype, "correctAnswer", null);
exports.AssessmentQuestionResolver = AssessmentQuestionResolver = __decorate([
    (0, graphql_1.Resolver)(() => assessment_entity_1.AssessmentQuestion)
], AssessmentQuestionResolver);
//# sourceMappingURL=assessments.resolver.js.map