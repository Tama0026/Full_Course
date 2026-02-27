import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Custom decorator to extract the current authenticated user
 * from the GraphQL execution context.
 *
 * Usage: @CurrentUser() user: UserPayload
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        if (context.getType<any>() === 'graphql') {
            const ctx = GqlExecutionContext.create(context);
            return ctx.getContext().req?.user;
        }
        return context.switchToHttp().getRequest()?.user;
    },
);
