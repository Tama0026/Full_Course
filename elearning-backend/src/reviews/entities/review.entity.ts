import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';

@ObjectType()
export class Review {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  courseId: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ReviewSummary {
  @Field(() => Int)
  totalCount: number;

  @Field()
  averageRating: number;

  @Field(() => Int)
  star5: number;

  @Field(() => Int)
  star4: number;

  @Field(() => Int)
  star3: number;

  @Field(() => Int)
  star2: number;

  @Field(() => Int)
  star1: number;

  @Field(() => [Review])
  reviews: Review[];
}
