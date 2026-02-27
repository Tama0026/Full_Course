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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const cloudinary_signature_type_1 = require("./dto/cloudinary-signature.type");
let CloudinaryResolver = class CloudinaryResolver {
    getUploadSignature() {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = {
            timestamp,
            folder: 'elearning/courses',
            type: 'upload',
        };
        const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET || '');
        return {
            timestamp,
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            folder: 'elearning/courses',
            type: 'upload'
        };
    }
};
exports.CloudinaryResolver = CloudinaryResolver;
__decorate([
    (0, graphql_1.Query)(() => cloudinary_signature_type_1.CloudinarySignature, { name: 'uploadSignature' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.INSTRUCTOR, role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", cloudinary_signature_type_1.CloudinarySignature)
], CloudinaryResolver.prototype, "getUploadSignature", null);
exports.CloudinaryResolver = CloudinaryResolver = __decorate([
    (0, graphql_1.Resolver)(() => cloudinary_signature_type_1.CloudinarySignature)
], CloudinaryResolver);
//# sourceMappingURL=cloudinary.resolver.js.map