import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Comment)
export class CommentsResolver {
    constructor(private readonly commentsService: CommentsService) { }

    @Mutation(() => Comment)
    @UseGuards(JwtAuthGuard)
    async createComment(
        @Args('input') input: CreateCommentInput,
        @CurrentUser() user: { id: string },
    ): Promise<Comment> {
        return this.commentsService.create(input, user.id) as unknown as Comment;
    }

    @Query(() => [Comment], { name: 'lessonComments' })
    async getLessonComments(
        @Args('lessonId') lessonId: string,
    ): Promise<Comment[]> {
        return this.commentsService.findByLesson(lessonId) as unknown as Comment[];
    }

    @Mutation(() => Comment)
    @UseGuards(JwtAuthGuard)
    async deleteComment(
        @Args('id') id: string,
        @CurrentUser() user: { id: string },
    ): Promise<Comment> {
        return this.commentsService.delete(id, user.id) as unknown as Comment;
    }
}
