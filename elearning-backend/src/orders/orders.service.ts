import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/create-order.input';
import { Order as PrismaOrder } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Create a new order for a course.
     * On COMPLETED status, automatically creates an Enrollment.
     */
    async createOrder(
        input: CreateOrderInput,
        userId: string,
    ): Promise<PrismaOrder> {
        // Verify the course exists and is published
        const course = await this.prisma.course.findUnique({
            where: { id: input.courseId },
        });

        if (!course) {
            throw new NotFoundException(
                `Course with ID "${input.courseId}" not found`,
            );
        }

        if (!course.published) {
            throw new ConflictException('Cannot order an unpublished course');
        }

        // Check if user already has an active enrollment
        const existingEnrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: input.courseId,
                },
            },
        });

        if (existingEnrollment) {
            throw new ConflictException('You are already enrolled in this course');
        }

        // Create the order and enrollment in a transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create order with COMPLETED status (simulated instant payment)
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    courseId: input.courseId,
                    status: 'COMPLETED',
                },
                include: { course: true, user: true },
            });

            // Auto-create enrollment on completed order
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

    /**
     * Get all orders for the current user.
     */
    async getMyOrders(userId: string): Promise<PrismaOrder[]> {
        return this.orderRepository.findByUserId(userId);
    }

    /**
     * Get a specific order by ID.
     */
    async getOrderById(id: string): Promise<PrismaOrder> {
        const order = await this.orderRepository.findById(id, {
            course: true,
            user: true,
        });

        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        return order;
    }

    /**
     * Get all orders (Admin only).
     */
    async getAllOrders(): Promise<PrismaOrder[]> {
        return this.orderRepository.findAll({
            include: { course: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
