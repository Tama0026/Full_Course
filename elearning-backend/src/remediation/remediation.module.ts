import { Module } from '@nestjs/common';
import { RemediationService } from './remediation.service';
import { RemediationResolver } from './remediation.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [PrismaModule, AiModule],
    providers: [RemediationService, RemediationResolver],
    exports: [RemediationService],
})
export class RemediationModule { }
