import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ABAC Guard — ensures an Instructor can only modify their own courses.
 * Extracts courseId from GraphQL args and verifies ownership.
 *
 * ADMIN users bypass this check.
 *
 * Usage: @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
 * Note: The resolver must accept a `courseId` or `id` argument.
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;
        const args = ctx.getArgs();

        // Admin bypasses ownership checks
        if (user.role === 'ADMIN') {
            return true;
        }

        // Extract course ID from various argument shapes
        const courseId: string | undefined =
            args.courseId || args.id || args.input?.courseId;

        if (!courseId) {
            throw new ForbiddenException('Course ID is required for ownership check');
        }

        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { instructorId: true },
        });

        if (!course) {
            throw new NotFoundException(`Course with ID "${courseId}" not found`);
        }

        if (course.instructorId !== user.id) {
            throw new ForbiddenException(
                'You can only modify courses that you own',
            );
        }

        return true;
    }
}
