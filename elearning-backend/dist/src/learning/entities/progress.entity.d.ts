import { Lesson } from '../../courses/entities/lesson.entity';
export declare class Progress {
    id: string;
    enrollmentId: string;
    lessonId: string;
    lesson?: Lesson;
    completedAt: Date;
}
