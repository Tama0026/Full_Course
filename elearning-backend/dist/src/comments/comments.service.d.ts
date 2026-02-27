import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { Comment as PrismaComment } from '@prisma/client';
export declare class CommentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(input: CreateCommentInput, userId: string): Promise<PrismaComment>;
    findByLesson(lessonId: string): Promise<PrismaComment[]>;
    delete(id: string, userId: string): Promise<PrismaComment>;
}
