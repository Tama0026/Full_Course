import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './entities/notification.entity';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(params: {
        userId: string;
        type: NotificationType | string;
        title: string;
        message: string;
        data?: string;
        link?: string;
    }): Promise<any>;
    getMyNotifications(userId: string, take?: number, skip?: number): Promise<any>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(userId: string, notificationId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
}
