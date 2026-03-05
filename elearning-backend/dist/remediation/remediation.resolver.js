"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemediationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const remediation_service_1 = require("./remediation.service");
const remediation_entity_1 = require("./entities/remediation.entity");
let RemediationResolver = class RemediationResolver {
    remediationService;
    constructor(remediationService) {
        this.remediationService = remediationService;
    }
    async getMyRemediations(user) {
        return this.remediationService.getMyRemediations(user.id);
    }
    async completeReviewItem(itemId, user) {
        return this.remediationService.completeReviewItem(itemId, user.id);
    }
};
exports.RemediationResolver = RemediationResolver;
__decorate([
    (0, graphql_1.Query)(() => [remediation_entity_1.RemediationReport], { name: 'myRemediations' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RemediationResolver.prototype, "getMyRemediations", null);
__decorate([
    (0, graphql_1.Mutation)(() => remediation_entity_1.ReviewPathItem),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('itemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemediationResolver.prototype, "completeReviewItem", null);
exports.RemediationResolver = RemediationResolver = __decorate([
    (0, graphql_1.Resolver)(() => remediation_entity_1.RemediationReport),
    __metadata("design:paramtypes", [remediation_service_1.RemediationService])
], RemediationResolver);
//# sourceMappingURL=remediation.resolver.js.map