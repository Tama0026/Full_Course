import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Enrollment } from './enrollment.entity';
import { Progress } from './progress.entity';

/**
 * Response type showing course progress percentage
 * and detailed completion data.
 */
@ObjectType()
export class CourseProgress {
    @Field(() => Enrollment)
    enrollment: Enrollment;

    @Field(() => Float)
    progressPercentage: number;

    @Field()
    completedLessons: number;

    @Field()
    totalLessons: number;

    @Field(() => [Progress])
    completedItems: Progress[];
}
