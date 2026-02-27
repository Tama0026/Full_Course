import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateCommentInput {
    @Field()
    @IsNotEmpty({ message: 'Content is required' })
    @IsString()
    @MaxLength(2000, { message: 'Comment must be under 2000 characters' })
    content: string;

    @Field()
    @IsNotEmpty({ message: 'Lesson ID is required' })
    lessonId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    parentId?: string;
}
