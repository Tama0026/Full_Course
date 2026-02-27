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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const order_repository_1 = require("./order.repository");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    orderRepository;
    prisma;
    constructor(orderRepository, prisma) {
        this.orderRepository = orderRepository;
        this.prisma = prisma;
    }
    async createOrder(input, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id: input.courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${input.courseId}" not found`);
        }
        if (!course.published) {
            throw new common_1.ConflictException('Cannot order an unpublished course');
        }
        const existingEnrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: input.courseId,
                },
            },
        });
        if (existingEnrollment) {
            throw new common_1.ConflictException('You are already enrolled in this course');
        }
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    courseId: input.courseId,
                    status: 'COMPLETED',
                },
                include: { course: true, user: true },
            });
            await tx.enrollment.create({
                data: {
                    userId,
                    courseId: input.courseId,
                },
            });
            return newOrder;
        });
        return order;
    }
    async getMyOrders(userId) {
        return this.orderRepository.findByUserId(userId);
    }
    async getOrderById(id) {
        const order = await this.orderRepository.findById(id, {
            course: true,
            user: true,
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID "${id}" not found`);
        }
        return order;
    }
    async getAllOrders() {
        return this.orderRepository.findAll({
            include: { course: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [order_repository_1.OrderRepository,
        prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map