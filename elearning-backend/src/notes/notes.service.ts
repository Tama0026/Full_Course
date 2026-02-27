import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
import { Note as PrismaNote } from '@prisma/client';

@Injectable()
export class NotesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(input: CreateNoteInput, userId: string): Promise<PrismaNote> {
        return this.prisma.note.create({
            data: {
                content: input.content,
                userId,
                lessonId: input.lessonId,
                videoTimestamp: input.videoTimestamp ?? 0,
            },
            include: { user: true },
        });
    }

    async findByLesson(lessonId: string, userId: string): Promise<PrismaNote[]> {
        return this.prisma.note.findMany({
            where: { lessonId, userId },
            include: { user: true },
            orderBy: { videoTimestamp: 'asc' },
        });
    }

    async update(id: string, input: UpdateNoteInput, userId: string): Promise<PrismaNote> {
        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note) throw new NotFoundException(`Note "${id}" not found`);
        if (note.userId !== userId) throw new NotFoundException('Unauthorized');

        return this.prisma.note.update({
            where: { id },
            data: { content: input.content },
            include: { user: true },
        });
    }

    async delete(id: string, userId: string): Promise<PrismaNote> {
        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note) throw new NotFoundException(`Note "${id}" not found`);
        if (note.userId !== userId) throw new NotFoundException('Unauthorized');

        return this.prisma.note.delete({ where: { id } });
    }
}
