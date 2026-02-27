import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Enrollment Guard — blocks access to lesson content if the user
 * has not enrolled (purchased) the course.
 *
 * ADMIN and INSTRUCTOR (who owns the course) bypass this check.
 *
 * Expects a `lessonId` or `sectionId` or `courseId` argument in the resolver.
 */
@Injectable()
export class EnrollmentGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req?.user;
        const args = ctx.getArgs();

        let courseId: string | undefined = args.courseId;

        // If lessonId is provided, resolve courseId through section
        if (!courseId && args.lessonId) {
            const lesson: any = await this.prisma.lesson.findUnique({
                where: { id: args.lessonId },
                include: { section: { select: { courseId: true } } },
            });

            // Allow preview lessons to be publicly accessed
            if (lesson && lesson.isPreview) {
                return true;
            }
            if (lesson) {
                courseId = lesson.section?.courseId;
            }
        }

        // If user is not logged in at this point, they cannot access non-preview content
        if (!user) {
            throw new ForbiddenException('Bạn vui lòng đăng nhập để thao tác và xem nội dung.');
        }

        // Admin bypasses enrollment checks
        if (user.role === 'ADMIN') {
            return true;
        }

        // If sectionId is provided, resolve courseId
        if (!courseId && args.sectionId) {
            const section = await this.prisma.section.findUnique({
                where: { id: args.sectionId },
                select: { courseId: true },
            });
            courseId = section?.courseId;
        }

        if (!courseId) {
            throw new ForbiddenException('Unable to determine course for enrollment check');
        }

        // Instructors who own the course can access
        if (user.role === 'INSTRUCTOR') {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                select: { instructorId: true },
            });
            if (course?.instructorId === user.id) {
                return true;
            }
        }

        // Check enrollment
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
        });

        if (!enrollment) {
            throw new ForbiddenException(
                'Bạn cần phải mua khóa học này để có thể xem bài học. Nếu bạn vừa mua, vui lòng tải lại trang.',
            );
        }

        return true;
    }
}
