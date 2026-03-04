export declare class LessonCurriculumInput {
    id?: string;
    title: string;
    type: 'VIDEO' | 'DOCUMENT';
    videoUrl?: string;
    body?: string;
    duration?: number;
    isPreview?: boolean;
    order?: number;
}
export declare class SectionCurriculumInput {
    id?: string;
    title: string;
    order?: number;
    lessons: LessonCurriculumInput[];
}
export declare class UpdateCurriculumInput {
    sections: SectionCurriculumInput[];
}
