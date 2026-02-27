import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

@InputType()
export class CreateSectionInput {
    @Field()
    @IsNotEmpty({ message: 'Section title is required' })
    title: string;

    @Field(() => Int)
    @IsInt()
    @Min(1)
    order: number;

    @Field()
    @IsNotEmpty({ message: 'Course ID is required' })
    courseId: string;
}
