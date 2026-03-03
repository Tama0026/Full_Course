import { OnModuleInit } from '@nestjs/common';
import { GamificationService } from './gamification.service';
export declare class GamificationModule implements OnModuleInit {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    onModuleInit(): Promise<void>;
}
