import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsResolver, AssessmentQuestionResolver } from './assessments.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AssessmentsResolver, AssessmentQuestionResolver, AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule { }
