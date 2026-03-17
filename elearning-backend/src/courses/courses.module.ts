import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesResolver, LessonResolver } from './courses.resolver';
import { CourseRepository } from './course.repository';
import { EmailModule } from '../email/email.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EmailModule, AiModule, NotificationsModule],
  providers: [
    CoursesService,
    CoursesResolver,
    LessonResolver,
    CourseRepository,
  ],
  exports: [CoursesService, CourseRepository],
})
export class CoursesModule { }
