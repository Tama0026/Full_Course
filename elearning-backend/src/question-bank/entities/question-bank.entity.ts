import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class QuestionBank {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;

    @Field()
    category: string;

    @Field()
    userId: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => [BankQuestion], { nullable: 'itemsAndList' })
    questions?: BankQuestion[];
}

@ObjectType()
export class BankQuestion {
    @Field(() => ID)
    id: string;

    @Field()
    bankId: string;

    @Field()
    content: string;

    @Field(() => [String])
    options: string;

    @Field(() => Int)
    correctAnswer: number;

    @Field({ nullable: true })
    explanation?: string;

    @Field()
    difficulty: string;

    @Field()
    createdAt: Date;
}
