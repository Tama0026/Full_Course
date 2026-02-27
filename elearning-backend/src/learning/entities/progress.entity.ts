import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Lesson } from '../../courses/entities/lesson.entity';

@ObjectType()
export class Progress {
    @Field(() => ID)
    id: string;

    @Field()
    enrollmentId: string;

    @Field()
    lessonId: string;

    @Field(() => Lesson, { nullable: true })
    lesson?: Lesson;

    @Field()
    completedAt: Date;
}
