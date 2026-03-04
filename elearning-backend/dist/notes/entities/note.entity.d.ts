import { User } from '../../auth/entities/user.entity';
export declare class Note {
    id: string;
    content: string;
    userId: string;
    lessonId: string;
    videoTimestamp: number;
    user?: User;
    createdAt: Date;
    updatedAt: Date;
}
