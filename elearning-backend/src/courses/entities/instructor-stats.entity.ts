import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class CourseStats {
    @Field()
    courseId: string;

    @Field()
    title: string;

    @Field(() => Int)
    studentCount: number;

    @Field(() => Int)
    completionRate: number; // 0-100

    @Field(() => Float)
    avgQuizScore: number;   // 0-100
}

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

    @Field(() => [CourseStats])
    courseBreakdown: CourseStats[];
}
