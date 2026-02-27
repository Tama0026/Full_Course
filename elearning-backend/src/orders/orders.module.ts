import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { OrderRepository } from './order.repository';

@Module({
    providers: [OrdersService, OrdersResolver, OrderRepository],
    exports: [OrdersService],
})
export class OrdersModule { }
