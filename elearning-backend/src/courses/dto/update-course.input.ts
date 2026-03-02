import { InputType, Field, Float } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class UpdateCourseInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    title?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => Float, { nullable: true })
    @IsOptional()
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0, { message: 'Price must be non-negative' })
    price?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    published?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    thumbnail?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    category?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    learningOutcomes?: string[];
}
