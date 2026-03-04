import { OrderStatus } from '../../common/enums/role.enum';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
export declare class Order {
    id: string;
    userId: string;
    courseId: string;
    status: OrderStatus;
    user?: User;
    course?: Course;
    createdAt: Date;
    updatedAt: Date;
}
