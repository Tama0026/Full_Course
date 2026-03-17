import { LearningService } from './learning.service';
import { Progress } from './entities/progress.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { Certificate } from './entities/certificate.entity';
import { VideoProgress } from './entities/video-progress.entity';
import { PaginationArgs } from '../common/dto/pagination.args';
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
    }, pagination: PaginationArgs): Promise<{
        items: ({
            course: {
                instructor: {
                    id: string;
                    email: string;
                };
                sections: ({
                    lessons: {
                        order: number;
                        id: string;
                        title: string;
                    }[];
                } & {
                    order: number;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    courseId: string;
                })[];
            } & {
                category: string | null;
                type: import("@prisma/client").$Enums.CourseType;
                description: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                price: number;
                enrollCode: string | null;
                thumbnail: string | null;
                learningOutcomes: string;
                averageRating: number;
                reviewCount: number;
                totalDuration: number;
                published: boolean;
                isActive: boolean;
                maxStudents: number | null;
                isApprovalRequired: boolean;
                instructorId: string;
            };
            progresses: {
                id: string;
                lessonId: string;
                completedAt: Date;
            }[];
        } & {
            id: string;
            userId: string;
            courseId: string;
            status: string;
            completedLessons: string;
            isFinished: boolean;
            isLocked: boolean;
            requestedAt: Date;
            enrolledAt: Date | null;
            lastRemindedAt: Date | null;
        })[];
        totalCount: number;
        hasMore: boolean;
    }>;
    checkIsEnrolled(courseId: string, user: {
        id: string;
    } | null): Promise<boolean>;
    claimCertificate(courseId: string, user: {
        id: string;
    }): Promise<Certificate>;
    getMyCertificates(user: {
        id: string;
    }): Promise<Certificate[]>;
    updateVideoProgress(user: {
        id: string;
    }, lessonId: string, currentTime: number): Promise<VideoProgress>;
    getVideoProgress(user: {
        id: string;
    }, lessonId: string): Promise<VideoProgress | null>;
}
