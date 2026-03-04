import { User } from '../../auth/entities/user.entity';
export declare class Comment {
    id: string;
    content: string;
    userId: string;
    lessonId: string;
    parentId?: string;
    user?: User;
    replies?: Comment[];
    createdAt: Date;
    updatedAt: Date;
}
