import { User } from '../../auth/entities/user.entity';
import { Section } from './section.entity';
export declare class Course {
    id: string;
    title: string;
    description: string;
    price: number;
    published: boolean;
    isActive: boolean;
    instructorId: string;
    instructor?: User;
    sections?: Section[];
    createdAt: Date;
    updatedAt: Date;
}
