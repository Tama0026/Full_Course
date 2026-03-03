import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateBadgeInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Field({ defaultValue: '🏅' })
    @IsString()
    @IsOptional()
    icon: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    criteria: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    courseId: string;
}

@InputType()
export class UpdateBadgeInput {
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    name?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    description?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    icon?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    criteria?: string;
}
