import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Progress } from './progress.entity';

@ObjectType()
export class Enrollment {
    @Field(() => ID)
    id: string;

    @Field()
    userId: string;

    @Field()
    courseId: string;

    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => Course, { nullable: true })
    course?: Course;

    @Field()
    enrolledAt: Date;

    @Field(() => [Progress], { nullable: true })
    progresses?: Progress[];

    @Field()
    completedLessons: string;

    @Field()
    isFinished: boolean;
}
