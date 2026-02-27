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
exports.AiResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
let AiResolver = class AiResolver {
    aiService;
    prisma;
    constructor(aiService, prisma) {
        this.aiService = aiService;
        this.prisma = prisma;
    }
    async searchCourses(query) {
        console.log(`[AiResolver] suggestCourses — query: "${query}"`);
        const result = await this.aiService.searchCourses(query);
        console.log(`[AiResolver] suggestCourses done — response length: ${result.length} chars`);
        return result;
    }
    async generateLessonContent(title, nonce) {
        console.log(`[AiResolver] generateLessonContent — title: "${title}", nonce: ${nonce ?? 'none'}`);
        const result = await this.aiService.generateLessonContent(title);
        console.log(`[AiResolver] generateLessonContent done — ${result.length} chars`);
        return result;
    }
    async generateLessonContentWithQuiz(title, lessonId, quizCount) {
        console.log(`[AiResolver] generateLessonContentWithQuiz — title: "${title}", lessonId: ${lessonId}, quizCount: ${quizCount}`);
        const aiResult = await this.aiService.generateLessonContentWithQuiz(title, quizCount);
        await this.prisma.$transaction(async (tx) => {
            await tx.lesson.update({
                where: { id: lessonId },
                data: { body: aiResult.body },
            });
            const existingQuiz = await tx.quiz.findUnique({
                where: { lessonId },
            });
            if (existingQuiz) {
                await tx.quiz.delete({ where: { id: existingQuiz.id } });
            }
            await tx.quiz.create({
                data: {
                    lessonId,
                    questions: {
                        create: aiResult.quiz.map((q) => ({
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correctAnswer: q.correctAnswer,
                        })),
                    },
                },
            });
        });
        console.log(`[AiResolver] generateLessonContentWithQuiz done — body saved + ${aiResult.quiz.length} quiz questions created`);
        return aiResult.body;
    }
    async assessSkill(user) {
        console.log(`[AiResolver] assessSkill — userId: ${user.id}`);
        const result = await this.aiService.assessSkill(user.id);
        console.log(`[AiResolver] assessSkill done — ${result.length} chars`);
        return result;
    }
    async askTutor(question, lessonId) {
        console.log(`[AiResolver] askTutor — lessonId: ${lessonId}`);
        return this.aiService.askTutor(question, lessonId);
    }
};
exports.AiResolver = AiResolver;
__decorate([
    (0, graphql_1.Query)(() => String, { name: 'suggestCourses' }),
    __param(0, (0, graphql_1.Args)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiResolver.prototype, "searchCourses", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('title')),
    __param(1, (0, graphql_1.Args)('nonce', { type: () => graphql_1.Float, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AiResolver.prototype, "generateLessonContent", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __param(0, (0, graphql_1.Args)('title')),
    __param(1, (0, graphql_1.Args)('lessonId')),
    __param(2, (0, graphql_1.Args)({ name: 'quizCount', type: () => graphql_1.Int, defaultValue: 5 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], AiResolver.prototype, "generateLessonContentWithQuiz", null);
__decorate([
    (0, graphql_1.Mutation)(() => String, { name: 'assessSkill' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiResolver.prototype, "assessSkill", null);
__decorate([
    (0, graphql_1.Mutation)(() => String, { name: 'askTutor' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('question')),
    __param(1, (0, graphql_1.Args)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiResolver.prototype, "askTutor", null);
exports.AiResolver = AiResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        prisma_service_1.PrismaService])
], AiResolver);
//# sourceMappingURL=ai.resolver.js.map