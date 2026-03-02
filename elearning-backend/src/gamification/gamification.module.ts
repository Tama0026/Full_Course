import { Module, OnModuleInit } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationResolver } from './gamification.resolver';

@Module({
    providers: [GamificationService, GamificationResolver],
    exports: [GamificationService],
})
export class GamificationModule implements OnModuleInit {
    constructor(private readonly gamificationService: GamificationService) { }

    async onModuleInit() {
        // Seed default badges on app startup
        await this.gamificationService.seedBadges();
    }
}
