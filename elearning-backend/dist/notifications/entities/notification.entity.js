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
exports.UnreadCount = exports.NotificationEntity = exports.NotificationType = void 0;
const graphql_1 = require("@nestjs/graphql");
var NotificationType;
(function (NotificationType) {
    NotificationType["ENROLLMENT"] = "ENROLLMENT";
    NotificationType["BADGE"] = "BADGE";
    NotificationType["CERTIFICATE"] = "CERTIFICATE";
    NotificationType["REVIEW"] = "REVIEW";
    NotificationType["COURSE_UPDATE"] = "COURSE_UPDATE";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
(0, graphql_1.registerEnumType)(NotificationType, {
    name: 'NotificationType',
    description: 'Type of notification',
});
let NotificationEntity = class NotificationEntity {
    id;
    userId;
    type;
    title;
    message;
    isRead;
    data;
    link;
    createdAt;
};
exports.NotificationEntity = NotificationEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], NotificationEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => NotificationType),
    __metadata("design:type", String)
], NotificationEntity.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], NotificationEntity.prototype, "isRead", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "link", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "createdAt", void 0);
exports.NotificationEntity = NotificationEntity = __decorate([
    (0, graphql_1.ObjectType)()
], NotificationEntity);
let UnreadCount = class UnreadCount {
    count;
};
exports.UnreadCount = UnreadCount;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UnreadCount.prototype, "count", void 0);
exports.UnreadCount = UnreadCount = __decorate([
    (0, graphql_1.ObjectType)()
], UnreadCount);
//# sourceMappingURL=notification.entity.js.map