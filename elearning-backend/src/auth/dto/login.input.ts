import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class LoginInput {
    @Field()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
