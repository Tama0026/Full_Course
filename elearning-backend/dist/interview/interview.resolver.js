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
exports.InterviewResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const interview_response_entity_1 = require("./entities/interview-response.entity");
const chat_message_input_1 = require("./dto/chat-message.input");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let InterviewResolver = class InterviewResolver {
    prisma;
    aiService;
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async checkInterviewUnlocked(courseId, user) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
        });
        return !!certificate;
    }
    async chatInterview(courseId, message, history, user) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
        });
        if (!certificate) {
            throw new common_1.ForbiddenException('Bạn cần hoàn thành khóa học và nhận chứng chỉ trước khi tham gia phỏng vấn AI.');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        lessons: {
                            select: { title: true, body: true, type: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        }
        let courseContext = `Khóa học: "${course.title}"\n\n`;
        for (const section of course.sections) {
            courseContext += `Chương: ${section.title}\n`;
            for (const lesson of section.lessons) {
                courseContext += `  - ${lesson.title}`;
                if (lesson.body) {
                    courseContext += `: ${lesson.body.slice(0, 500)}`;
                }
                courseContext += '\n';
            }
        }
        const reply = await this.aiService.conductInterview(courseContext, course.title, message, history);
        return {
            reply,
            courseId,
            courseName: course.title,
        };
    }
};
exports.InterviewResolver = InterviewResolver;
__decorate([
    (0, graphql_1.Query)(() => Boolean, { name: 'isInterviewUnlocked' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('courseId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InterviewResolver.prototype, "checkInterviewUnlocked", null);
__decorate([
    (0, graphql_1.Mutation)(() => interview_response_entity_1.InterviewResponse),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('courseId')),
    __param(1, (0, graphql_1.Args)('message')),
    __param(2, (0, graphql_1.Args)({ name: 'history', type: () => [chat_message_input_1.ChatMessageInput], defaultValue: [] })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], InterviewResolver.prototype, "chatInterview", null);
exports.InterviewResolver = InterviewResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], InterviewResolver);
//# sourceMappingURL=interview.resolver.js.map