import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class InstructorStats {
    @Field(() => Int)
    totalCourses: number;

    @Field(() => Int)
    totalStudents: number;

    @Field(() => Float)
    totalRevenue: number;

    @Field(() => Int)
    avgCompletionRate: number;
}
