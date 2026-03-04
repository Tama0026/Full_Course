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
exports.CloudinarySignature = void 0;
const graphql_1 = require("@nestjs/graphql");
let CloudinarySignature = class CloudinarySignature {
    timestamp;
    signature;
    apiKey;
    cloudName;
    folder;
    type;
};
exports.CloudinarySignature = CloudinarySignature;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CloudinarySignature.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CloudinarySignature.prototype, "signature", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CloudinarySignature.prototype, "apiKey", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CloudinarySignature.prototype, "cloudName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CloudinarySignature.prototype, "folder", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CloudinarySignature.prototype, "type", void 0);
exports.CloudinarySignature = CloudinarySignature = __decorate([
    (0, graphql_1.ObjectType)()
], CloudinarySignature);
//# sourceMappingURL=cloudinary-signature.type.js.map