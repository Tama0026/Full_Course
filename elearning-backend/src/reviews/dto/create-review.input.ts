import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field()
  courseId: string;

  @Field(() => Int)
  rating: number; // 1-5

  @Field({ nullable: true })
  comment?: string;
}
