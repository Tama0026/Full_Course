import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * JWT Authentication Guard adapted for GraphQL.
 * Extracts the request from GQL context for Passport to process.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        if (context.getType<any>() === 'graphql') {
            const ctx = GqlExecutionContext.create(context);
            return ctx.getContext().req;
        }
        return context.switchToHttp().getRequest();
    }
}
