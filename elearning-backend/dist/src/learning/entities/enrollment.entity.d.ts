import { User } from '../../auth/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Progress } from './progress.entity';
export declare class Enrollment {
    id: string;
    userId: string;
    courseId: string;
    user?: User;
    course?: Course;
    enrolledAt: Date;
    progresses?: Progress[];
    completedLessons: string;
    isFinished: boolean;
}
