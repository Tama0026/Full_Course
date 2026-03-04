import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
export declare class NotesResolver {
    private readonly notesService;
    constructor(notesService: NotesService);
    createNote(input: CreateNoteInput, user: {
        id: string;
    }): Promise<Note>;
    getLessonNotes(lessonId: string, user: {
        id: string;
    }): Promise<Note[]>;
    updateNote(id: string, input: UpdateNoteInput, user: {
        id: string;
    }): Promise<Note>;
    deleteNote(id: string, user: {
        id: string;
    }): Promise<Note>;
}
