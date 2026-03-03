import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class AdminBadgeType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  icon: string;

  @Field()
  criteria: string;

  @Field()
  criteriaType: string;

  @Field(() => Int)
  threshold: number;

  @Field({ nullable: true })
  courseId?: string;

  @Field({ nullable: true })
  courseName?: string;

  @Field()
  creatorId: string;

  @Field(() => Int)
  awardedCount: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AdminStats {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  totalCourses: number;

  @Field(() => Int)
  totalEnrollments: number;

  @Field(() => Int)
  totalBadges: number;

  @Field(() => Int)
  totalStudents: number;

  @Field(() => Int)
  totalInstructors: number;
}
