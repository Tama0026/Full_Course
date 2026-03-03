import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateCourseInput {
    @Field()
    @IsNotEmpty({ message: 'Title is required' })
    title: string;

    @Field()
    @IsNotEmpty({ message: 'Description is required' })
    description: string;

    @Field(() => Float)
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0, { message: 'Price must be non-negative' })
    price: number;

    @Field({ nullable: true, defaultValue: false })
    @IsOptional()
    published?: boolean;

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
