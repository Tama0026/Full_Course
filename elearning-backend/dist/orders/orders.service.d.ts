import { OrderRepository } from './order.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/create-order.input';
import { Order as PrismaOrder } from '@prisma/client';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly prisma;
    constructor(orderRepository: OrderRepository, prisma: PrismaService);
    createOrder(input: CreateOrderInput, userId: string): Promise<PrismaOrder>;
    getMyOrders(userId: string): Promise<PrismaOrder[]>;
    getOrderById(id: string): Promise<PrismaOrder>;
    getAllOrders(): Promise<PrismaOrder[]>;
}
