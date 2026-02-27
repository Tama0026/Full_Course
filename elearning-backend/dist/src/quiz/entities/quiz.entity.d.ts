import { Question } from './question.entity';
export declare class Quiz {
    id: string;
    lessonId: string;
    questions: Question[];
    createdAt: Date;
    updatedAt: Date;
}
