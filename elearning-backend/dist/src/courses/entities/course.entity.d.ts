import { User } from '../../auth/entities/user.entity';
import { Section } from './section.entity';
export declare class Course {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail?: string;
    category?: string;
    learningOutcomes?: string[];
    averageRating: number;
    reviewCount: number;
    totalDuration: number;
    published: boolean;
    isActive: boolean;
    instructorId: string;
    instructor?: User;
    sections?: Section[];
    createdAt: Date;
    updatedAt: Date;
}
