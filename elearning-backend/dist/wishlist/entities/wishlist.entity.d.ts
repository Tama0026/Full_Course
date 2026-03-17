import { Course } from '../../courses/entities/course.entity';
export declare class WishlistItem {
    id: string;
    userId: string;
    courseId: string;
    course?: Course;
    createdAt: Date;
}
