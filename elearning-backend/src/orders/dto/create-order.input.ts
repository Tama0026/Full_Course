import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateOrderInput {
    @Field()
    @IsNotEmpty({ message: 'Course ID is required' })
    courseId: string;
}
