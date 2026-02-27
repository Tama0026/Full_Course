import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Lesson } from './lesson.entity';

@ObjectType()
export class Section {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field(() => Int)
    order: number;

    @Field()
    courseId: string;

    @Field(() => [Lesson], { nullable: true })
    lessons?: Lesson[];

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
