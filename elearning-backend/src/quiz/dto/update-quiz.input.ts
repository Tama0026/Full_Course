import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class QuestionInput {
    @Field({ nullable: true })
    id?: string;

    @Field()
    content: string;

    @Field(() => [String])
    options: string[];

    @Field(() => Int)
    correctAnswer: number;
}

@InputType()
export class UpdateQuizInput {
    @Field()
    lessonId: string;

    @Field(() => [QuestionInput])
    questions: QuestionInput[];
}
