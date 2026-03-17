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
exports.WishlistResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const wishlist_service_1 = require("./wishlist.service");
const wishlist_entity_1 = require("./entities/wishlist.entity");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let WishlistResolver = class WishlistResolver {
    wishlistService;
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    async getMyWishlist(user) {
        return this.wishlistService.getMyWishlist(user.id);
    }
    async isInWishlist(courseId, user) {
        return this.wishlistService.isInWishlist(user.id, courseId);
    }
    async addToWishlist(courseId, user) {
        return this.wishlistService.addToWishlist(user.id, courseId);
    }
    async removeFromWishlist(courseId, user) {
        return this.wishlistService.removeFromWishlist(user.id, courseId);
    }
};
exports.WishlistResolver = WishlistResolver;
__decorate([
    (0, graphql_1.Query)(() => [wishlist_entity_1.WishlistItem], { name: 'myWishlist' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "getMyWishlist", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean, { name: 'isInWishlist' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('courseId', { type: () => String })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "isInWishlist", null);
__decorate([
    (0, graphql_1.Mutation)(() => wishlist_entity_1.WishlistItem),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('courseId', { type: () => String })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "addToWishlist", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('courseId', { type: () => String })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WishlistResolver.prototype, "removeFromWishlist", null);
exports.WishlistResolver = WishlistResolver = __decorate([
    (0, graphql_1.Resolver)(() => wishlist_entity_1.WishlistItem),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], WishlistResolver);
//# sourceMappingURL=wishlist.resolver.js.map