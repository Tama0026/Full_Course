import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

@InputType()
export class CreateNoteInput {
    @Field()
    @IsNotEmpty({ message: 'Content is required' })
    @IsString()
    @MaxLength(5000, { message: 'Note must be under 5000 characters' })
    content: string;

    @Field()
    @IsNotEmpty({ message: 'Lesson ID is required' })
    lessonId: string;

    @Field(() => Float, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsNumber()
    videoTimestamp?: number;
}

@InputType()
export class UpdateNoteInput {
    @Field()
    @IsNotEmpty()
    @IsString()
    @MaxLength(5000)
    content: string;
}
