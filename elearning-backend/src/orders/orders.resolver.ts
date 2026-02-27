import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Order)
export class OrdersResolver {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * Create a new order (purchase a course). Students only.
     */
    @Mutation(() => Order)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.STUDENT)
    async createOrder(
        @Args('input') input: CreateOrderInput,
        @CurrentUser() user: { id: string },
    ): Promise<Order> {
        return this.ordersService.createOrder(
            input,
            user.id,
        ) as unknown as Order;
    }

    /**
     * Get my orders (authenticated user).
     */
    @Query(() => [Order], { name: 'myOrders' })
    @UseGuards(JwtAuthGuard)
    async getMyOrders(
        @CurrentUser() user: { id: string },
    ): Promise<Order[]> {
        return this.ordersService.getMyOrders(user.id) as unknown as Order[];
    }

    /**
     * Get a specific order by ID.
     */
    @Query(() => Order, { name: 'order' })
    @UseGuards(JwtAuthGuard)
    async getOrder(@Args('id') id: string): Promise<Order> {
        return this.ordersService.getOrderById(id) as unknown as Order;
    }

    /**
     * Get all orders (Admin only).
     */
    @Query(() => [Order], { name: 'allOrders' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getAllOrders(): Promise<Order[]> {
        return this.ordersService.getAllOrders() as unknown as Order[];
    }
}
