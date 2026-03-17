import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateReviewInput {
  @Field(() => Int, { nullable: true })
  rating?: number; // 1-5

  @Field({ nullable: true })
  comment?: string;
}
