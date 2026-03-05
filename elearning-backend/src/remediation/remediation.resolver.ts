import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RemediationService } from './remediation.service';
import {
    RemediationReport,
    ReviewPathItem,
} from './entities/remediation.entity';

@Resolver(() => RemediationReport)
export class RemediationResolver {
    constructor(private readonly remediationService: RemediationService) { }

    @Query(() => [RemediationReport], { name: 'myRemediations' })
    @UseGuards(JwtAuthGuard)
    async getMyRemediations(
        @CurrentUser() user: { id: string; role: string },
    ) {
        return this.remediationService.getMyRemediations(user.id);
    }

    @Mutation(() => ReviewPathItem)
    @UseGuards(JwtAuthGuard)
    async completeReviewItem(
        @Args('itemId') itemId: string,
        @CurrentUser() user: { id: string; role: string },
    ) {
        return this.remediationService.completeReviewItem(itemId, user.id);
    }
}
