import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class QuizAnswerInput {
    @Field()
    questionId: string;

    @Field(() => Int)
    selectedOption: number;
}
