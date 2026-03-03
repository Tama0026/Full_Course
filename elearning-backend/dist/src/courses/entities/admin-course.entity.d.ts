export declare class AdminCourseInstructor {
    id: string;
    name?: string;
    email: string;
}
export declare class AdminCourse {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail?: string;
    category?: string;
    published: boolean;
    isActive: boolean;
    instructorId: string;
    instructor: AdminCourseInstructor;
    enrollmentCount: number;
    sectionCount: number;
    createdAt: Date;
    updatedAt: Date;
}
