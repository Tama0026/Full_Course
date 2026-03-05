import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ShuffledQuestion {
  @Field(() => ID)
  id: string;

  @Field()
  prompt: string;

  @Field(() => [String])
  options: string[];
}

@ObjectType()
export class AssessmentQuestion {
  @Field(() => ID)
  id: string;

  @Field()
  assessmentId: string;

  @Field()
  setCode: string;

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

  @Field(() => Int)
  numberOfSets: number;

  @Field(() => Int)
  maxAttempts: number;

  @Field(() => Int)
  maxViolations: number;

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
  setCode: string;

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

  @Field(() => Int)
  violationCount: number;

  @Field()
  status: string;

  @Field(() => [ShuffledQuestion], { nullable: 'itemsAndList' })
  questions?: ShuffledQuestion[];
}

@ObjectType()
export class ViolationResult {
  @Field(() => Int)
  violationCount: number;

  @Field(() => Int)
  remaining: number;

  @Field(() => Int)
  maxViolations: number;

  @Field()
  voided: boolean;
}

@ObjectType()
export class AttemptWithUser {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  userName?: string;

  @Field({ nullable: true })
  userEmail?: string;

  @Field()
  setCode: string;

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

  @Field(() => Int)
  violationCount: number;

  @Field()
  status: string;
}

@ObjectType()
export class AssessmentReport {
  @Field(() => Int)
  totalAttempts: number;

  @Field(() => Int)
  avgScore: number;

  @Field(() => Int)
  passRate: number;

  @Field(() => Int)
  voidedCount: number;

  @Field(() => [AttemptWithUser])
  attempts: AttemptWithUser[];
}
