export declare enum NotificationType {
    ENROLLMENT = "ENROLLMENT",
    BADGE = "BADGE",
    CERTIFICATE = "CERTIFICATE",
    REVIEW = "REVIEW",
    COURSE_UPDATE = "COURSE_UPDATE",
    SYSTEM = "SYSTEM"
}
export declare class NotificationEntity {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    data?: string;
    link?: string;
    createdAt: Date;
}
export declare class UnreadCount {
    count: number;
}
