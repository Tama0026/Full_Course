import { LearningService } from './learning.service';
import { Enrollment } from './entities/enrollment.entity';
import { Progress } from './entities/progress.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { Certificate } from './entities/certificate.entity';
export declare class LearningResolver {
    private readonly learningService;
    constructor(learningService: LearningService);
    markLessonComplete(lessonId: string, user: {
        id: string;
    }): Promise<Progress>;
    getCourseProgress(courseId: string, user: {
        id: string;
    } | null): Promise<CourseProgress>;
    getMyEnrollments(user: {
        id: string;
    }): Promise<Enrollment[]>;
    checkIsEnrolled(courseId: string, user: {
        id: string;
    } | null): Promise<boolean>;
    claimCertificate(courseId: string, user: {
        id: string;
    }): Promise<Certificate>;
    getMyCertificates(user: {
        id: string;
    }): Promise<Certificate[]>;
}
