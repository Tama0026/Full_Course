import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SubmitQuizResponse {
    @Field()
    success: boolean;

    @Field(() => Int)
    score: number;

    @Field(() => Int)
    totalQuestions: number;

    @Field(() => String, { nullable: true })
    message?: string;
}
