import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min, IsOptional, IsString, IsIn } from 'class-validator';

@InputType()
export class CreateLessonInput {
    @Field()
    @IsNotEmpty({ message: 'Lesson title is required' })
    title: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['VIDEO', 'DOCUMENT'], { message: 'type must be VIDEO or DOCUMENT' })
    type?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    body?: string;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    duration?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    format?: string;

    @Field(() => Boolean, { nullable: true, defaultValue: false })
    @IsOptional()
    isPreview?: boolean;

    @Field(() => Int)
    @IsInt()
    @Min(1)
    order: number;

    @Field()
    @IsNotEmpty({ message: 'Section ID is required' })
    sectionId: string;
}
