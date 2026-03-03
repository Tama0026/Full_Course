export declare class AdminBadgeType {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    criteriaType: string;
    threshold: number;
    courseId?: string;
    courseName?: string;
    creatorId: string;
    awardedCount: number;
    createdAt: Date;
}
export declare class AdminStats {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalBadges: number;
    totalStudents: number;
    totalInstructors: number;
}
