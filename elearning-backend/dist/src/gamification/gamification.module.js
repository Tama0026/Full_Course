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
exports.GamificationModule = void 0;
const common_1 = require("@nestjs/common");
const gamification_service_1 = require("./gamification.service");
const gamification_resolver_1 = require("./gamification.resolver");
let GamificationModule = class GamificationModule {
    gamificationService;
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    async onModuleInit() {
        await this.gamificationService.seedBadges();
    }
};
exports.GamificationModule = GamificationModule;
exports.GamificationModule = GamificationModule = __decorate([
    (0, common_1.Module)({
        providers: [gamification_service_1.GamificationService, gamification_resolver_1.GamificationResolver],
        exports: [gamification_service_1.GamificationService],
    }),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], GamificationModule);
//# sourceMappingURL=gamification.module.js.map