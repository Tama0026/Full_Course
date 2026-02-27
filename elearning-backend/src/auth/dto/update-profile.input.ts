import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateProfileInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    headline?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    bio?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    avatar?: string;
}
