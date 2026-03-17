import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Course } from '../../courses/entities/course.entity';

@ObjectType()
export class WishlistItem {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  courseId: string;

  @Field(() => Course, { nullable: true })
  course?: Course;

  @Field()
  createdAt: Date;
}
