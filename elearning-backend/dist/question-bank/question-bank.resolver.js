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
exports.BankQuestionResolver = exports.QuestionBankFieldResolver = exports.QuestionBankResolver = exports.BulkImportResult = exports.BulkImportQuestionInput = exports.UpdateBankQuestionInput = exports.CreateBankQuestionInput = exports.UpdateQuestionBankInput = exports.CreateQuestionBankInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const question_bank_service_1 = require("./question-bank.service");
const question_bank_entity_1 = require("./entities/question-bank.entity");
const graphql_2 = require("@nestjs/graphql");
let CreateQuestionBankInput = class CreateQuestionBankInput {
    name;
    description;
    category;
};
exports.CreateQuestionBankInput = CreateQuestionBankInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionBankInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionBankInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionBankInput.prototype, "category", void 0);
exports.CreateQuestionBankInput = CreateQuestionBankInput = __decorate([
    (0, graphql_1.InputType)()
], CreateQuestionBankInput);
let UpdateQuestionBankInput = class UpdateQuestionBankInput {
    name;
    description;
    category;
};
exports.UpdateQuestionBankInput = UpdateQuestionBankInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuestionBankInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuestionBankInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuestionBankInput.prototype, "category", void 0);
exports.UpdateQuestionBankInput = UpdateQuestionBankInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateQuestionBankInput);
let CreateBankQuestionInput = class CreateBankQuestionInput {
    content;
    options;
    correctAnswer;
    explanation;
    difficulty;
};
exports.CreateBankQuestionInput = CreateBankQuestionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankQuestionInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBankQuestionInput.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBankQuestionInput.prototype, "correctAnswer", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankQuestionInput.prototype, "explanation", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'MEDIUM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankQuestionInput.prototype, "difficulty", void 0);
exports.CreateBankQuestionInput = CreateBankQuestionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateBankQuestionInput);
let UpdateBankQuestionInput = class UpdateBankQuestionInput {
    content;
    options;
    correctAnswer;
    explanation;
    difficulty;
};
exports.UpdateBankQuestionInput = UpdateBankQuestionInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankQuestionInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateBankQuestionInput.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateBankQuestionInput.prototype, "correctAnswer", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankQuestionInput.prototype, "explanation", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankQuestionInput.prototype, "difficulty", void 0);
exports.UpdateBankQuestionInput = UpdateBankQuestionInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateBankQuestionInput);
let BulkImportQuestionInput = class BulkImportQuestionInput {
    content;
    options;
    correctAnswer;
    difficulty;
    explanation;
};
exports.BulkImportQuestionInput = BulkImportQuestionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportQuestionInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkImportQuestionInput.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BulkImportQuestionInput.prototype, "correctAnswer", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'MEDIUM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportQuestionInput.prototype, "difficulty", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportQuestionInput.prototype, "explanation", void 0);
exports.BulkImportQuestionInput = BulkImportQuestionInput = __decorate([
    (0, graphql_1.InputType)()
], BulkImportQuestionInput);
let BulkImportResult = class BulkImportResult {
    success;
    count;
};
exports.BulkImportResult = BulkImportResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BulkImportResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BulkImportResult.prototype, "count", void 0);
exports.BulkImportResult = BulkImportResult = __decorate([
    (0, graphql_2.ObjectType)()
], BulkImportResult);
let QuestionBankResolver = class QuestionBankResolver {
    questionBankService;
    constructor(questionBankService) {
        this.questionBankService = questionBankService;
    }
    getMyQuestionBanks(user) {
        return this.questionBankService.getMyQuestionBanks(user.id);
    }
    getQuestionBank(id, user) {
        return this.questionBankService.getQuestionBank(id, user.id);
    }
    createQuestionBank(input, user) {
        return this.questionBankService.createQuestionBank(user.id, input);
    }
    updateQuestionBank(id, input, user) {
        return this.questionBankService.updateQuestionBank(id, user.id, input);
    }
    deleteQuestionBank(id, user) {
        return this.questionBankService.deleteQuestionBank(id, user.id);
    }
    createBankQuestion(bankId, input, user) {
        return this.questionBankService.createBankQuestion(user.id, { bankId, ...input });
    }
    deleteBankQuestion(id, user) {
        return this.questionBankService.deleteBankQuestion(id, user.id);
    }
    updateBankQuestion(id, input, user) {
        return this.questionBankService.updateBankQuestion(user.id, id, input);
    }
    async bulkImportQuestions(bankId, questions, user) {
        return this.questionBankService.bulkImportQuestions(user.id, bankId, questions);
    }
};
exports.QuestionBankResolver = QuestionBankResolver;
__decorate([
    (0, graphql_1.Query)(() => [question_bank_entity_1.QuestionBank], { name: 'myQuestionBanks' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "getMyQuestionBanks", null);
__decorate([
    (0, graphql_1.Query)(() => question_bank_entity_1.QuestionBank, { name: 'questionBank' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "getQuestionBank", null);
__decorate([
    (0, graphql_1.Mutation)(() => question_bank_entity_1.QuestionBank),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateQuestionBankInput, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "createQuestionBank", null);
__decorate([
    (0, graphql_1.Mutation)(() => question_bank_entity_1.QuestionBank),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateQuestionBankInput, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "updateQuestionBank", null);
__decorate([
    (0, graphql_1.Mutation)(() => question_bank_entity_1.QuestionBank),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "deleteQuestionBank", null);
__decorate([
    (0, graphql_1.Mutation)(() => question_bank_entity_1.BankQuestion),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('bankId')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateBankQuestionInput, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "createBankQuestion", null);
__decorate([
    (0, graphql_1.Mutation)(() => question_bank_entity_1.BankQuestion),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "deleteBankQuestion", null);
__decorate([
    (0, graphql_1.Mutation)(() => question_bank_entity_1.BankQuestion),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateBankQuestionInput, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankResolver.prototype, "updateBankQuestion", null);
__decorate([
    (0, graphql_1.Mutation)(() => BulkImportResult),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('bankId')),
    __param(1, (0, graphql_1.Args)('questions', { type: () => [BulkImportQuestionInput] })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], QuestionBankResolver.prototype, "bulkImportQuestions", null);
exports.QuestionBankResolver = QuestionBankResolver = __decorate([
    (0, graphql_1.Resolver)(() => question_bank_entity_1.QuestionBank),
    __metadata("design:paramtypes", [question_bank_service_1.QuestionBankService])
], QuestionBankResolver);
let QuestionBankFieldResolver = class QuestionBankFieldResolver {
    questionCount(bank) {
        if (bank._count?.questions !== undefined)
            return bank._count.questions;
        return bank.questions?.length || 0;
    }
};
exports.QuestionBankFieldResolver = QuestionBankFieldResolver;
__decorate([
    (0, graphql_1.ResolveField)(() => graphql_1.Int, { name: 'questionCount' }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QuestionBankFieldResolver.prototype, "questionCount", null);
exports.QuestionBankFieldResolver = QuestionBankFieldResolver = __decorate([
    (0, graphql_1.Resolver)(() => question_bank_entity_1.QuestionBank)
], QuestionBankFieldResolver);
let BankQuestionResolver = class BankQuestionResolver {
    options(question) {
        try {
            if (Array.isArray(question.options)) {
                return question.options;
            }
            if (typeof question.options === 'string') {
                return JSON.parse(question.options);
            }
            return [];
        }
        catch {
            return [];
        }
    }
};
exports.BankQuestionResolver = BankQuestionResolver;
__decorate([
    (0, graphql_1.ResolveField)(() => [String]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BankQuestionResolver.prototype, "options", null);
exports.BankQuestionResolver = BankQuestionResolver = __decorate([
    (0, graphql_1.Resolver)(() => question_bank_entity_1.BankQuestion)
], BankQuestionResolver);
//# sourceMappingURL=question-bank.resolver.js.map