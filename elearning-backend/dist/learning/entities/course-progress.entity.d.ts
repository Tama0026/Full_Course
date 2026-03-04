import { Enrollment } from './enrollment.entity';
import { Progress } from './progress.entity';
export declare class CourseProgress {
    enrollment: Enrollment;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    completedItems: Progress[];
}
