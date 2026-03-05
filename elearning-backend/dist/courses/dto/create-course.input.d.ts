import { CourseType } from '@prisma/client';
export declare class CreateCourseInput {
    title: string;
    description: string;
    price: number;
    type?: CourseType;
    published?: boolean;
    thumbnail?: string;
    category?: string;
    learningOutcomes?: string[];
    maxStudents?: number;
    isApprovalRequired?: boolean;
}
