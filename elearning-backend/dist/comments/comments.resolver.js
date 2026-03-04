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
exports.CommentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const comments_service_1 = require("./comments.service");
const comment_entity_1 = require("./entities/comment.entity");
const create_comment_input_1 = require("./dto/create-comment.input");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let CommentsResolver = class CommentsResolver {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async createComment(input, user) {
        return this.commentsService.create(input, user.id);
    }
    async getLessonComments(lessonId) {
        return this.commentsService.findByLesson(lessonId);
    }
    async deleteComment(id, user) {
        return this.commentsService.delete(id, user.id);
    }
};
exports.CommentsResolver = CommentsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => comment_entity_1.Comment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comment_input_1.CreateCommentInput, Object]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "createComment", null);
__decorate([
    (0, graphql_1.Query)(() => [comment_entity_1.Comment], { name: 'lessonComments' }),
    __param(0, (0, graphql_1.Args)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "getLessonComments", null);
__decorate([
    (0, graphql_1.Mutation)(() => comment_entity_1.Comment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "deleteComment", null);
exports.CommentsResolver = CommentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => comment_entity_1.Comment),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsResolver);
//# sourceMappingURL=comments.resolver.js.map