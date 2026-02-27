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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommentsService = class CommentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input, userId) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: input.lessonId } });
        if (!lesson)
            throw new common_1.NotFoundException(`Lesson "${input.lessonId}" not found`);
        if (input.parentId) {
            const parent = await this.prisma.comment.findUnique({ where: { id: input.parentId } });
            if (!parent)
                throw new common_1.NotFoundException(`Parent comment "${input.parentId}" not found`);
        }
        return this.prisma.comment.create({
            data: {
                content: input.content,
                userId,
                lessonId: input.lessonId,
                parentId: input.parentId || null,
            },
            include: {
                user: true,
                replies: { include: { user: true }, orderBy: { createdAt: 'asc' } },
            },
        });
    }
    async findByLesson(lessonId) {
        return this.prisma.comment.findMany({
            where: { lessonId, parentId: null },
            include: {
                user: true,
                replies: {
                    include: {
                        user: true,
                        replies: { include: { user: true }, orderBy: { createdAt: 'asc' } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async delete(id, userId) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException(`Comment "${id}" not found`);
        if (comment.userId !== userId)
            throw new common_1.NotFoundException('Unauthorized');
        return this.prisma.comment.delete({ where: { id } });
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map