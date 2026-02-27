import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Note)
export class NotesResolver {
    constructor(private readonly notesService: NotesService) { }

    @Mutation(() => Note)
    @UseGuards(JwtAuthGuard)
    async createNote(
        @Args('input') input: CreateNoteInput,
        @CurrentUser() user: { id: string },
    ): Promise<Note> {
        return this.notesService.create(input, user.id) as unknown as Note;
    }

    @Query(() => [Note], { name: 'lessonNotes' })
    @UseGuards(JwtAuthGuard)
    async getLessonNotes(
        @Args('lessonId') lessonId: string,
        @CurrentUser() user: { id: string },
    ): Promise<Note[]> {
        return this.notesService.findByLesson(lessonId, user.id) as unknown as Note[];
    }

    @Mutation(() => Note)
    @UseGuards(JwtAuthGuard)
    async updateNote(
        @Args('id') id: string,
        @Args('input') input: UpdateNoteInput,
        @CurrentUser() user: { id: string },
    ): Promise<Note> {
        return this.notesService.update(id, input, user.id) as unknown as Note;
    }

    @Mutation(() => Note)
    @UseGuards(JwtAuthGuard)
    async deleteNote(
        @Args('id') id: string,
        @CurrentUser() user: { id: string },
    ): Promise<Note> {
        return this.notesService.delete(id, user.id) as unknown as Note;
    }
}
