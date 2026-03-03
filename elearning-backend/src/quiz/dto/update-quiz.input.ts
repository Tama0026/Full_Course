import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsArray, ValidateNested, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class QuestionInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    id?: string;

    @Field()
    @IsString()
    content: string;

    @Field(() => [String])
    @IsArray()
    @IsString({ each: true })
    options: string[];

    @Field(() => Int)
    @IsInt()
    correctAnswer: number;
}

@InputType()
export class UpdateQuizInput {
    @Field()
    @IsString()
    lessonId: string;

    @Field(() => [QuestionInput])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionInput)
    questions: QuestionInput[];
}
