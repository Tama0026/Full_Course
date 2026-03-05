import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ReviewPathItem {
  @Field(() => ID)
  id: string;

  @Field()
  reportId: string;

  @Field()
  lessonId: string;

  @Field()
  lessonTitle: string;

  @Field()
  reason: string;

  @Field(() => Int)
  priority: number;

  @Field()
  isCompleted: boolean;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class RemediationReport {
  @Field(() => ID)
  id: string;

  @Field()
  attemptId: string;

  @Field()
  userId: string;

  @Field()
  assessmentId: string;

  @Field(() => Float)
  scorePercent: number;

  @Field(() => Int)
  totalQuestions: number;

  @Field(() => Int)
  wrongCount: number;

  @Field()
  aiAnalysis: string; // JSON string

  @Field()
  severity: string; // LOW | MEDIUM | CRITICAL

  @Field()
  isResolved: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [ReviewPathItem], { nullable: 'itemsAndList' })
  pathItems?: ReviewPathItem[];
}
