import { Module } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import {
  QuestionBankResolver,
  QuestionBankFieldResolver,
  BankQuestionResolver,
} from './question-bank.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    QuestionBankService,
    QuestionBankResolver,
    QuestionBankFieldResolver,
    BankQuestionResolver,
  ],
  exports: [QuestionBankService],
})
export class QuestionBankModule {}
