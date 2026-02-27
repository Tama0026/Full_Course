import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { Comment as PrismaComment } from '@prisma/client';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new comment (or reply).
     */
    async create(input: CreateCommentInput, userId: string): Promise<PrismaComment> {
        // Verify lesson exists
        const lesson = await this.prisma.lesson.findUnique({ where: { id: input.lessonId } });
        if (!lesson) throw new NotFoundException(`Lesson "${input.lessonId}" not found`);

        // If replying, verify parent exists
        if (input.parentId) {
            const parent = await this.prisma.comment.findUnique({ where: { id: input.parentId } });
            if (!parent) throw new NotFoundException(`Parent comment "${input.parentId}" not found`);
        }

        return this.prisma.comment.create({
            data: {
                content: input.content,
                userId,
                lessonId: input.lessonId,
                parentId: input.parentId || null,
            },
            include: {
                user: true,
                replies: { include: { user: true }, orderBy: { createdAt: 'asc' } },
            },
        });
    }

    /**
     * Get all top-level comments for a lesson (with nested replies).
     */
    async findByLesson(lessonId: string): Promise<PrismaComment[]> {
        return this.prisma.comment.findMany({
            where: { lessonId, parentId: null },
            include: {
                user: true,
                replies: {
                    include: {
                        user: true,
                        replies: { include: { user: true }, orderBy: { createdAt: 'asc' } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Delete a comment (only owner).
     */
    async delete(id: string, userId: string): Promise<PrismaComment> {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment) throw new NotFoundException(`Comment "${id}" not found`);
        if (comment.userId !== userId) throw new NotFoundException('Unauthorized');

        return this.prisma.comment.delete({ where: { id } });
    }
}
