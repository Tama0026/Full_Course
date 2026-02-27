import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Question } from './question.entity';

@ObjectType()
export class Quiz {
    @Field(() => ID)
    id: string;

    @Field()
    lessonId: string;

    @Field(() => [Question], { defaultValue: [] })
    questions: Question[];

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
