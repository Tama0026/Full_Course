import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesResolver, LessonResolver } from './courses.resolver';
import { CourseRepository } from './course.repository';

@Module({
    providers: [CoursesService, CoursesResolver, LessonResolver, CourseRepository],
    exports: [CoursesService, CourseRepository],
})
export class CoursesModule { }
