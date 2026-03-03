import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AdminCourseInstructor {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  email: string;
}

@ObjectType()
export class AdminCourse {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field({ nullable: true })
  category?: string;

  @Field()
  published: boolean;

  @Field()
  isActive: boolean;

  @Field()
  instructorId: string;

  @Field(() => AdminCourseInstructor)
  instructor: AdminCourseInstructor;

  @Field(() => Int)
  enrollmentCount: number;

  @Field(() => Int)
  sectionCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
