import { registerEnumType } from '@nestjs/graphql';

export enum Role {
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN',
}

registerEnumType(Role, {
    name: 'Role',
    description: 'User roles for RBAC',
});

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, {
    name: 'OrderStatus',
    description: 'Order payment status',
});
