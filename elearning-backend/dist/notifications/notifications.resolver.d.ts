import { NotificationsService } from './notifications.service';
export declare class NotificationsResolver {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(user: {
        id: string;
    }, take?: number, skip?: number): Promise<any>;
    getUnreadCount(user: {
        id: string;
    }): Promise<{
        count: number;
    }>;
    markNotificationRead(notificationId: string, user: {
        id: string;
    }): Promise<boolean>;
    markAllNotificationsRead(user: {
        id: string;
    }): Promise<boolean>;
}
