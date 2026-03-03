import { Module } from '@nestjs/common';
import { InterviewResolver } from './interview.resolver';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [AiModule],
    providers: [InterviewResolver],
})
export class InterviewModule { }
