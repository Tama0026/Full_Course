import { Quiz } from '../../quiz/entities/quiz.entity';
export declare class Lesson {
    id: string;
    title: string;
    type: string;
    videoUrl?: string;
    body?: string;
    duration?: number;
    format?: string;
    isPreview: boolean;
    order: number;
    sectionId: string;
    createdAt: Date;
    updatedAt: Date;
    quiz?: Quiz;
    isLocked?: boolean;
}
