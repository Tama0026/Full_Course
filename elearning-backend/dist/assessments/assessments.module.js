"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const assessments_service_1 = require("./assessments.service");
const assessments_resolver_1 = require("./assessments.resolver");
const prisma_module_1 = require("../prisma/prisma.module");
const remediation_module_1 = require("../remediation/remediation.module");
const exam_gateway_1 = require("./exam.gateway");
let AssessmentsModule = class AssessmentsModule {
};
exports.AssessmentsModule = AssessmentsModule;
exports.AssessmentsModule = AssessmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, remediation_module_1.RemediationModule, config_1.ConfigModule, jwt_1.JwtModule.register({})],
        providers: [assessments_resolver_1.AssessmentsResolver, assessments_resolver_1.AssessmentQuestionResolver, assessments_service_1.AssessmentsService, exam_gateway_1.ExamGateway],
        exports: [assessments_service_1.AssessmentsService],
    })
], AssessmentsModule);
//# sourceMappingURL=assessments.module.js.map