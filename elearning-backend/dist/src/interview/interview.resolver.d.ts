import { InterviewResponse } from './entities/interview-response.entity';
import { ChatMessageInput } from './dto/chat-message.input';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class InterviewResolver {
    private readonly prisma;
    private readonly aiService;
    constructor(prisma: PrismaService, aiService: AiService);
    checkInterviewUnlocked(courseId: string, user: {
        id: string;
    }): Promise<boolean>;
    chatInterview(courseId: string, message: string, history: ChatMessageInput[], user: {
        id: string;
    }): Promise<InterviewResponse>;
}
