import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
export declare class CommentsResolver {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    createComment(input: CreateCommentInput, user: {
        id: string;
    }): Promise<Comment>;
    getLessonComments(lessonId: string): Promise<Comment[]>;
    deleteComment(id: string, user: {
        id: string;
    }): Promise<Comment>;
}
