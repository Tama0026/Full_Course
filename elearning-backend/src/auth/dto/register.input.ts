import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

@InputType()
export class RegisterInput {
    @Field()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @Field(() => Role, { nullable: true, defaultValue: Role.STUDENT })
    @IsOptional()
    @IsEnum(Role, { message: 'Role must be STUDENT, INSTRUCTOR, or ADMIN' })
    role?: Role;
}
