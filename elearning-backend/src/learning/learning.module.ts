import { Module } from '@nestjs/common';

import { LearningService } from './learning.service';
import { LearningResolver } from './learning.resolver';
import { EnrollmentRepository } from './enrollment.repository';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule],
    providers: [LearningService, LearningResolver, EnrollmentRepository],
    exports: [LearningService],
})
export class LearningModule { }
