export declare class CreateBadgeInput {
    name: string;
    description: string;
    icon: string;
    criteria: string;
    courseId: string;
}
export declare class UpdateBadgeInput {
    name?: string;
    description?: string;
    icon?: string;
    criteria?: string;
    criteriaType?: string;
    threshold?: number;
}
export declare class AdminCreateBadgeInput {
    name: string;
    description: string;
    icon: string;
    criteriaType: string;
    threshold: number;
    courseId?: string;
}
