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
    maxStudents?: number;
    isApprovalRequired: boolean;
    instructorId: string;
    instructor?: User;
    sections?: Section[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class CourseStudentProgress {
    lessonTitle: string;
    chapterTitle: string;
    completedAt: Date;
}
export declare class CourseStudent {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    progressPercent: number;
    lastActive?: Date;
    progressTimeline: CourseStudentProgress[];
    lastRemindedAt?: Date;
    enrolledAt?: Date;
    status?: string;
}
