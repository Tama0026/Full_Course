import { InputType, Field, Int } from '@nestjs/graphql';
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

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    criteriaType?: string;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    threshold?: number;
}

@InputType()
export class AdminCreateBadgeInput {
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

    @Field({ defaultValue: 'LESSONS_COMPLETED' })
    @IsString()
    @IsNotEmpty()
    criteriaType: string;

    @Field(() => Int, { defaultValue: 1 })
    @IsNotEmpty()
    threshold: number;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    courseId?: string;
}
