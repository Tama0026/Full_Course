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
exports.ResourceOwnerGuard = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const prisma_service_1 = require("../../prisma/prisma.service");
let ResourceOwnerGuard = class ResourceOwnerGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const ctx = graphql_1.GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;
        const args = ctx.getArgs();
        if (user.role === 'ADMIN') {
            return true;
        }
        const courseId = args.courseId || args.id || args.input?.courseId;
        if (!courseId) {
            throw new common_1.ForbiddenException('Course ID is required for ownership check');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { instructorId: true },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${courseId}" not found`);
        }
        if (course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only modify courses that you own');
        }
        return true;
    }
};
exports.ResourceOwnerGuard = ResourceOwnerGuard;
exports.ResourceOwnerGuard = ResourceOwnerGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResourceOwnerGuard);
//# sourceMappingURL=resource-owner.guard.js.map