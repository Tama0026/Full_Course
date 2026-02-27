import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Quiz } from '../../quiz/entities/quiz.entity';

@ObjectType()
export class Lesson {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    type: string;

    @Field({ nullable: true })
    videoUrl?: string;

    @Field({ nullable: true })
    body?: string;

    @Field(() => Int, { nullable: true })
    duration?: number;

    @Field({ nullable: true })
    format?: string;

    @Field(() => Boolean, { defaultValue: false })
    isPreview: boolean;

    @Field(() => Int)
    order: number;

    @Field()
    sectionId: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => Quiz, { nullable: true })
    quiz?: Quiz;

    @Field(() => Boolean, { defaultValue: false })
    isLocked?: boolean;
}
