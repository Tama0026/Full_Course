import { Lesson } from './lesson.entity';
export declare class Section {
    id: string;
    title: string;
    order: number;
    courseId: string;
    lessons?: Lesson[];
    createdAt: Date;
    updatedAt: Date;
}
