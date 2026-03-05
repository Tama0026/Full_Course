import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AssessmentsService } from './assessments.service';
import {
  AssessmentsResolver,
  AssessmentQuestionResolver,
} from './assessments.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { RemediationModule } from '../remediation/remediation.module';
import { AiModule } from '../ai/ai.module';
import { ExamGateway } from './exam.gateway';

@Module({
  imports: [
    PrismaModule,
    RemediationModule,
    AiModule,
    ConfigModule,
    JwtModule.register({}),
  ],
  providers: [
    AssessmentsResolver,
    AssessmentQuestionResolver,
    AssessmentsService,
    ExamGateway,
  ],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
