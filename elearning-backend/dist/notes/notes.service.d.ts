import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
import { Note as PrismaNote } from '@prisma/client';
export declare class NotesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(input: CreateNoteInput, userId: string): Promise<PrismaNote>;
    findByLesson(lessonId: string, userId: string): Promise<PrismaNote[]>;
    update(id: string, input: UpdateNoteInput, userId: string): Promise<PrismaNote>;
    delete(id: string, userId: string): Promise<PrismaNote>;
}
