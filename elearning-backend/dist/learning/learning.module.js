"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningModule = void 0;
const common_1 = require("@nestjs/common");
const learning_service_1 = require("./learning.service");
const learning_resolver_1 = require("./learning.resolver");
const enrollment_repository_1 = require("./enrollment.repository");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const gamification_module_1 = require("../gamification/gamification.module");
let LearningModule = class LearningModule {
};
exports.LearningModule = LearningModule;
exports.LearningModule = LearningModule = __decorate([
    (0, common_1.Module)({
        imports: [cloudinary_module_1.CloudinaryModule, gamification_module_1.GamificationModule],
        providers: [learning_service_1.LearningService, learning_resolver_1.LearningResolver, enrollment_repository_1.EnrollmentRepository],
        exports: [learning_service_1.LearningService],
    })
], LearningModule);
//# sourceMappingURL=learning.module.js.map