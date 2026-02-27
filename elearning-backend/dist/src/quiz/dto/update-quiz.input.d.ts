export declare class QuestionInput {
    id?: string;
    content: string;
    options: string[];
    correctAnswer: number;
}
export declare class UpdateQuizInput {
    lessonId: string;
    questions: QuestionInput[];
}
