import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Question {
    @Field(() => ID)
    id: string;

    @Field()
    quizId: string;

    @Field()
    content: string;

    @Field(() => String)
    options: string; // JSON string

    @Field(() => Int)
    correctAnswer: number;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
