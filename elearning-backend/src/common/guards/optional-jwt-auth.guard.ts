import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Optional JWT Authentication Guard adapted for GraphQL.
 * Extracts the request from GQL context for Passport to process.
 * Unlike JwtAuthGuard, it DOES NOT throw an error if the user is unauthenticated.
 * It simply leaves `req.user` null/undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        if (context.getType<any>() === 'graphql') {
            const ctx = GqlExecutionContext.create(context);
            return ctx.getContext().req;
        }
        return context.switchToHttp().getRequest();
    }

    handleRequest(err: any, user: any, info: any) {
        // You can throw an exception based on either "info" or "err" arguments
        if (err) {
            console.error('OptionalJwtAuthGuard error:', err);
        }
        // return the user if found, otherwise return null (do not throw Unauthorized)
        return user || null;
    }
}
