import { AiService } from './ai.service';
export declare class AiResolver {
    private readonly aiService;
    constructor(aiService: AiService);
    searchCourses(query: string): Promise<string>;
    generateLessonContent(title: string, nonce?: number): Promise<string>;
    assessSkill(user: {
        id: string;
    }): Promise<string>;
}
