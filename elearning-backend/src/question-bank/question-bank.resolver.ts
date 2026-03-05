import { Resolver, Query, Mutation, Args, Int, InputType, Field, ResolveField, Parent } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QuestionBankService } from './question-bank.service';
import { QuestionBank, BankQuestion } from './entities/question-bank.entity';
import { ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateQuestionBankInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field()
    @IsString()
    category: string;
}

@InputType()
export class UpdateQuestionBankInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    category?: string;
}

@InputType()
export class CreateBankQuestionInput {
    @Field()
    @IsString()
    content: string;

    @Field(() => [String])
    @IsArray()
    @IsString({ each: true })
    options: string[];

    @Field(() => Int)
    @IsInt()
    @Min(0)
    correctAnswer: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    explanation?: string;

    @Field({ defaultValue: 'MEDIUM' })
    @IsOptional()
    @IsString()
    difficulty: string;
}

@InputType()
export class UpdateBankQuestionInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    content?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    options?: string[];

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    @Min(0)
    correctAnswer?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    explanation?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    difficulty?: string;
}

@InputType()
export class BulkImportQuestionInput {
    @Field()
    @IsString()
    content: string;

    @Field(() => [String])
    @IsArray()
    @IsString({ each: true })
    options: string[];

    @Field(() => Int)
    @IsInt()
    @Min(0)
    correctAnswer: number;

    @Field({ nullable: true, defaultValue: 'MEDIUM' })
    @IsOptional()
    @IsString()
    difficulty?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    explanation?: string;
}

@ObjectType()
export class BulkImportResult {
    @Field()
    success: boolean;

    @Field(() => Int)
    count: number;
}

@Resolver(() => QuestionBank)
export class QuestionBankResolver {
    constructor(private readonly questionBankService: QuestionBankService) { }

    @Query(() => [QuestionBank], { name: 'myQuestionBanks' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    getMyQuestionBanks(@CurrentUser() user: { id: string }) {
        return this.questionBankService.getMyQuestionBanks(user.id);
    }

    @Query(() => QuestionBank, { name: 'questionBank' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    getQuestionBank(@Args('id') id: string, @CurrentUser() user: { id: string }) {
        return this.questionBankService.getQuestionBank(id, user.id);
    }

    @Mutation(() => QuestionBank)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    createQuestionBank(
        @Args('input') input: CreateQuestionBankInput,
        @CurrentUser() user: { id: string }
    ) {
        return this.questionBankService.createQuestionBank(user.id, input);
    }

    @Mutation(() => QuestionBank)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    updateQuestionBank(
        @Args('id') id: string,
        @Args('input') input: UpdateQuestionBankInput,
        @CurrentUser() user: { id: string }
    ) {
        return this.questionBankService.updateQuestionBank(id, user.id, input);
    }

    @Mutation(() => QuestionBank)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    deleteQuestionBank(
        @Args('id') id: string,
        @CurrentUser() user: { id: string }
    ) {
        return this.questionBankService.deleteQuestionBank(id, user.id);
    }

    @Mutation(() => BankQuestion)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    createBankQuestion(
        @Args('bankId') bankId: string,
        @Args('input') input: CreateBankQuestionInput,
        @CurrentUser() user: { id: string }
    ) {
        return this.questionBankService.createBankQuestion(user.id, { bankId, ...input });
    }

    @Mutation(() => BankQuestion)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    deleteBankQuestion(
        @Args('id') id: string,
        @CurrentUser() user: { id: string }
    ) {
        return this.questionBankService.deleteBankQuestion(id, user.id);
    }

    @Mutation(() => BankQuestion)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    updateBankQuestion(
        @Args('id') id: string,
        @Args('input') input: UpdateBankQuestionInput,
        @CurrentUser() user: { id: string }
    ) {
        return this.questionBankService.updateBankQuestion(user.id, id, input);
    }

    @Mutation(() => BulkImportResult)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async bulkImportQuestions(
        @Args('bankId') bankId: string,
        @Args('questions', { type: () => [BulkImportQuestionInput] }) questions: BulkImportQuestionInput[],
        @CurrentUser() user: { id: string }
    ) {
        return this.questionBankService.bulkImportQuestions(user.id, bankId, questions);
    }
}

@Resolver(() => QuestionBank)
export class QuestionBankFieldResolver {
    @ResolveField(() => Int, { name: 'questionCount' })
    questionCount(@Parent() bank: any) {
        if (bank._count?.questions !== undefined) return bank._count.questions;
        return bank.questions?.length || 0;
    }
}

@Resolver(() => BankQuestion)
export class BankQuestionResolver {
    @ResolveField(() => [String])
    options(@Parent() question: { options: any }) {
        try {
            if (Array.isArray(question.options)) {
                return question.options;
            }
            if (typeof question.options === 'string') {
                return JSON.parse(question.options);
            }
            return [];
        } catch {
            return [];
        }
    }
}
