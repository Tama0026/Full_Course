"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, context) => {
    if (context.getType() === 'graphql') {
        const ctx = graphql_1.GqlExecutionContext.create(context);
        return ctx.getContext().req?.user;
    }
    return context.switchToHttp().getRequest()?.user;
});
//# sourceMappingURL=current-user.decorator.js.map