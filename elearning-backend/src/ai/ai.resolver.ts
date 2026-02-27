import { Resolver, Query, Mutation, Args, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver()
export class AiResolver {
    constructor(private readonly aiService: AiService) { }

    @Query(() => String, { name: 'suggestCourses' })
    async searchCourses(@Args('query') query: string): Promise<string> {
        console.log(`[AiResolver] suggestCourses — query: "${query}"`);
        const result = await this.aiService.searchCourses(query);
        console.log(`[AiResolver] suggestCourses done — response length: ${result.length} chars`);
        return result;
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async generateLessonContent(
        @Args('title') title: string,
        @Args('nonce', { type: () => Float, nullable: true }) nonce?: number,
    ): Promise<string> {
        console.log(`[AiResolver] generateLessonContent — title: "${title}", nonce: ${nonce ?? 'none'}`);
        const result = await this.aiService.generateLessonContent(title);
        console.log(`[AiResolver] generateLessonContent done — ${result.length} chars`);
        return result;
    }

    /**
     * AI Professional Assessment — evaluates user skills based on completed courses.
     * Returns a JSON string with scores and recommendations.
     */
    @Mutation(() => String, { name: 'assessSkill' })
    @UseGuards(JwtAuthGuard)
    async assessSkill(
        @CurrentUser() user: { id: string },
    ): Promise<string> {
        console.log(`[AiResolver] assessSkill — userId: ${user.id}`);
        const result = await this.aiService.assessSkill(user.id);
        console.log(`[AiResolver] assessSkill done — ${result.length} chars`);
        return result;
    }

    /**
     * AI Tutor — answers a student question using current lesson as context.
     */
    @Mutation(() => String, { name: 'askTutor' })
    @UseGuards(JwtAuthGuard)
    async askTutor(
        @Args('question') question: string,
        @Args('lessonId') lessonId: string,
    ): Promise<string> {
        console.log(`[AiResolver] askTutor — lessonId: ${lessonId}`);
        return this.aiService.askTutor(question, lessonId);
    }
}
