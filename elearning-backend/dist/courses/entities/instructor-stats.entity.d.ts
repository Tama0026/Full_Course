export declare class CourseStats {
    courseId: string;
    title: string;
    studentCount: number;
    completionRate: number;
    avgQuizScore: number;
}
export declare class InstructorStats {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    avgCompletionRate: number;
    courseBreakdown: CourseStats[];
}
