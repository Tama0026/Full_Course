import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AssessmentQuestion {
  @Field(() => ID)
  id: string;

  @Field()
  assessmentId: string;

  @Field()
  prompt: string;

  @Field(() => [String])
  options: string[];

  @Field()
  correctAnswer: string;

  @Field()
  explanation: string;

  @Field(() => Int)
  order: number;
}

@ObjectType()
export class Assessment {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Int)
  timeLimit: number;

  @Field(() => Float)
  passingScore: number;

  @Field()
  isActive: boolean;

  @Field()
  creatorId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [AssessmentQuestion], { nullable: 'itemsAndList' })
  questions?: AssessmentQuestion[];
}

@ObjectType()
export class AssessmentAttempt {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  assessmentId: string;

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field({ nullable: true })
  passed?: boolean;

  @Field()
  isInvalid: boolean;
}
