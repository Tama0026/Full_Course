import {
  Resolver,
  Query,
  Mutation,
  Args,
  Float,
  Int,
  InputType,
  Field,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AssessmentsService } from './assessments.service';
import {
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
} from './entities/assessment.entity';

import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

@InputType()
export class CreateAssessmentInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  timeLimit: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  passingScore: number;

  @Field()
  @IsBoolean()
  isActive: boolean;
}

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsString()
  prompt: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @Field()
  @IsString()
  correctAnswer: string;

  @Field()
  @IsString()
  explanation: string;

  @Field(() => Int)
  @IsInt()
  order: number;
}

@InputType()
export class AnswerInput {
  @Field()
  @IsString()
  questionId: string;

  @Field()
  @IsString()
  answer: string;
}

@Resolver(() => Assessment)
export class AssessmentsResolver {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Query(() => [Assessment], { name: 'assessments' })
  @UseGuards(JwtAuthGuard)
  async getAssessments(@CurrentUser() user: { id: string; role: string }) {
    return this.assessmentsService.getAssessments(user.role, user.id);
  }

  @Query(() => Assessment, { name: 'assessment' })
  @UseGuards(JwtAuthGuard)
  async getAssessment(@Args('id') id: string) {
    return this.assessmentsService.getAssessment(id);
  }

  @Mutation(() => Assessment)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async createAssessment(
    @Args('input') input: CreateAssessmentInput,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.assessmentsService.createAssessment(user.id, input);
  }

  @Mutation(() => Assessment)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async deleteAssessment(
    @Args('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.assessmentsService.deleteAssessment(id, user.id);
  }

  @Mutation(() => AssessmentQuestion)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async createAssessmentQuestion(
    @Args('assessmentId') assessmentId: string,
    @Args('input') input: CreateQuestionInput,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.assessmentsService.createQuestion(assessmentId, user.id, input);
  }

  @Mutation(() => AssessmentQuestion)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async deleteAssessmentQuestion(
    @Args('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.assessmentsService.deleteQuestion(id, user.id);
  }

  @Mutation(() => AssessmentAttempt)
  @UseGuards(JwtAuthGuard)
  async startAssessmentAttempt(
    @Args('assessmentId') assessmentId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.assessmentsService.startAttempt(assessmentId, user.id);
  }

  @Mutation(() => AssessmentAttempt)
  @UseGuards(JwtAuthGuard)
  async submitAssessmentAttempt(
    @Args('attemptId') attemptId: string,
    @Args({ name: 'answers', type: () => [AnswerInput] })
    answers: AnswerInput[],
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.assessmentsService.submitAttempt(attemptId, user.id, answers);
  }
}

@Resolver(() => AssessmentQuestion)
export class AssessmentQuestionResolver {
  @ResolveField(() => String)
  prompt(@Parent() question: { content: string }) {
    return question.content;
  }

  @ResolveField(() => [String])
  options(@Parent() question: { options: string | string[] }) {
    if (typeof question.options === 'string') {
      try {
        return JSON.parse(question.options);
      } catch (e) {
        return [];
      }
    }
    return question.options || [];
  }

  @ResolveField(() => String, { nullable: true })
  explanation() {
    return '';
  }

  @ResolveField(() => Int, { nullable: true })
  order() {
    return 0;
  }

  @ResolveField(() => String)
  correctAnswer(@Parent() question: { correctAnswer: number }) {
    return question.correctAnswer.toString();
  }
}
