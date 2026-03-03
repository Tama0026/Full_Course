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
exports.BadgeType = void 0;
const graphql_1 = require("@nestjs/graphql");
let BadgeType = class BadgeType {
    id;
    name;
    description;
    icon;
    criteria;
    courseId;
    courseName;
    creatorId;
    awardedAt;
};
exports.BadgeType = BadgeType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], BadgeType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeType.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeType.prototype, "criteria", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BadgeType.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BadgeType.prototype, "courseName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BadgeType.prototype, "creatorId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], BadgeType.prototype, "awardedAt", void 0);
exports.BadgeType = BadgeType = __decorate([
    (0, graphql_1.ObjectType)()
], BadgeType);
//# sourceMappingURL=badge.entity.js.map