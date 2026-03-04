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
exports.QuizResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const quiz_service_1 = require("./quiz.service");
const quiz_entity_1 = require("./entities/quiz.entity");
const submit_quiz_response_1 = require("./dto/submit-quiz.response");
const submit_quiz_input_1 = require("./dto/submit-quiz.input");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const enrollment_guard_1 = require("../common/guards/enrollment.guard");
const update_quiz_input_1 = require("./dto/update-quiz.input");
let QuizResolver = class QuizResolver {
    quizService;
    constructor(quizService) {
        this.quizService = quizService;
    }
    async generateQuizWithAI(lessonId, count) {
        return this.quizService.generateQuizWithAI(lessonId, count);
    }
    async updateQuiz(input) {
        return this.quizService.updateQuiz(input);
    }
    async getQuiz(lessonId, context) {
        const user = context.req.user;
        const quiz = await this.quizService.getQuizByLesson(lessonId);
        if (quiz && user.role === role_enum_1.Role.STUDENT) {
            quiz.questions = quiz.questions.map((q) => {
                const safeQuestion = { ...q };
                delete safeQuestion.correctAnswer;
                return safeQuestion;
            });
        }
        return quiz;
    }
    async submitQuiz(lessonId, answers, context) {
        const userId = context.req.user.id;
        return this.quizService.submitQuiz(userId, lessonId, answers);
    }
};
exports.QuizResolver = QuizResolver;
__decorate([
    (0, graphql_1.Mutation)(() => quiz_entity_1.Quiz),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('lessonId')),
    __param(1, (0, graphql_1.Args)({ name: 'count', type: () => graphql_1.Int, defaultValue: 5 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], QuizResolver.prototype, "generateQuizWithAI", null);
__decorate([
    (0, graphql_1.Mutation)(() => quiz_entity_1.Quiz),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_quiz_input_1.UpdateQuizInput]),
    __metadata("design:returntype", Promise)
], QuizResolver.prototype, "updateQuiz", null);
__decorate([
    (0, graphql_1.Query)(() => quiz_entity_1.Quiz, { nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, enrollment_guard_1.EnrollmentGuard),
    __param(0, (0, graphql_1.Args)('lessonId')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizResolver.prototype, "getQuiz", null);
__decorate([
    (0, graphql_1.Mutation)(() => submit_quiz_response_1.SubmitQuizResponse),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, enrollment_guard_1.EnrollmentGuard),
    __param(0, (0, graphql_1.Args)('lessonId')),
    __param(1, (0, graphql_1.Args)({ name: 'answers', type: () => [submit_quiz_input_1.QuizAnswerInput] })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], QuizResolver.prototype, "submitQuiz", null);
exports.QuizResolver = QuizResolver = __decorate([
    (0, graphql_1.Resolver)(() => quiz_entity_1.Quiz),
    __metadata("design:paramtypes", [quiz_service_1.QuizService])
], QuizResolver);
//# sourceMappingURL=quiz.resolver.js.map