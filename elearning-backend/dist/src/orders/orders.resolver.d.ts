import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
export declare class OrdersResolver {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(input: CreateOrderInput, user: {
        id: string;
    }): Promise<Order>;
    getMyOrders(user: {
        id: string;
    }): Promise<Order[]>;
    getOrder(id: string): Promise<Order>;
    getAllOrders(): Promise<Order[]>;
}
