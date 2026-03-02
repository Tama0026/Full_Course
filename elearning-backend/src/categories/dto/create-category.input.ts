import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCategoryInput {
    @Field()
    @IsNotEmpty({ message: 'Category name is required' })
    @IsString()
    name: string;
}
