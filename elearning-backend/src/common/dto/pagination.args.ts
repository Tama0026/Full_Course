import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';

@ArgsType()
export class PaginationArgs {
    @Field(() => Int, { defaultValue: 12 })
    @IsInt()
    @Min(1)
    @Max(50) // Cap at 50 to prevent DOS attacks
    take: number = 12;

    @Field(() => Int, { defaultValue: 0 })
    @IsInt()
    @Min(0)
    skip: number = 0;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
}
