import { InputType, Field, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

@InputType()
export class LessonCurriculumInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    id?: string;

    @Field()
    @IsString()
    title: string;

    @Field(() => String, { defaultValue: 'VIDEO' })
    @IsString()
    type: 'VIDEO' | 'DOCUMENT';

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
    @IsBoolean()
    isPreview?: boolean;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    order?: number;
}

@InputType()
export class SectionCurriculumInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    id?: string;

    @Field()
    @IsString()
    title: string;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    order?: number;

    @Field(() => [LessonCurriculumInput], { defaultValue: [] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonCurriculumInput)
    lessons: LessonCurriculumInput[];
}

@InputType()
export class UpdateCurriculumInput {
    @Field(() => [SectionCurriculumInput])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SectionCurriculumInput)
    sections: SectionCurriculumInput[];
}
