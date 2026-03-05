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
exports.ExamGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const assessments_service_1 = require("./assessments.service");
const common_1 = require("@nestjs/common");
let ExamGateway = class ExamGateway {
    assessmentsService;
    configService;
    jwtService;
    server;
    logger = new common_1.Logger('ExamGateway');
    connectedAttempts = new Map();
    constructor(assessmentsService, configService, jwtService) {
        this.assessmentsService = assessmentsService;
        this.configService = configService;
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.query?.token;
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token — disconnecting`);
                client.emit('auth-error', { message: 'Token không hợp lệ' });
                client.disconnect(true);
                return;
            }
            const secret = this.configService.get('JWT_SECRET');
            if (!secret) {
                client.disconnect(true);
                return;
            }
            const payload = this.jwtService.verify(token, { secret });
            const userId = payload.sub || payload.id;
            if (!userId) {
                client.emit('auth-error', { message: 'Token không chứa thông tin user' });
                client.disconnect(true);
                return;
            }
            client.userId = userId;
            this.logger.log(`Student ${userId} connected (socket: ${client.id})`);
        }
        catch (err) {
            this.logger.warn(`JWT validation failed for ${client.id}: ${err.message}`);
            client.emit('auth-error', { message: 'Token hết hạn hoặc không hợp lệ' });
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        const attemptId = client.attemptId;
        if (attemptId) {
            this.logger.log(`Student ${client.userId} disconnected from attempt ${attemptId}`);
            const timer = setTimeout(async () => {
                try {
                    const existing = this.connectedAttempts.get(attemptId);
                    if (existing && existing.socketId === client.id) {
                        const attempt = await this.assessmentsService.getAttemptById(attemptId);
                        if (attempt && attempt.status === 'IN_PROGRESS') {
                            this.logger.warn(`Attempt ${attemptId}: no reconnection after 30s, logging violation`);
                            await this.assessmentsService.logViolation(attemptId, 'DISCONNECT_TIMEOUT');
                        }
                        else {
                            this.logger.log(`Attempt ${attemptId}: already ${attempt?.status}, skipping disconnect violation`);
                        }
                        this.connectedAttempts.delete(attemptId);
                    }
                }
                catch (err) {
                    this.logger.error(`Error handling disconnect timeout: ${err.message}`);
                }
            }, 30_000);
            const existing = this.connectedAttempts.get(attemptId);
            if (existing) {
                existing.disconnectTimer = timer;
            }
        }
    }
    async handleJoinExam(client, data) {
        try {
            if (!client.userId) {
                client.emit('auth-error', { message: 'Chưa xác thực' });
                return;
            }
            const { attemptId } = data;
            if (!attemptId) {
                client.emit('error', { message: 'attemptId is required' });
                return;
            }
            const attempt = await this.assessmentsService.getAttemptForSocket(attemptId, client.userId);
            if (!attempt) {
                client.emit('error', { message: 'Không tìm thấy bài thi hoặc bài thi đã kết thúc' });
                return;
            }
            const existing = this.connectedAttempts.get(attemptId);
            if (existing?.disconnectTimer) {
                clearTimeout(existing.disconnectTimer);
            }
            client.attemptId = attemptId;
            client.join(attemptId);
            this.connectedAttempts.set(attemptId, { socketId: client.id });
            client.emit('exam-state', {
                attemptId,
                violationCount: attempt.violationCount,
                maxViolations: attempt.assessment.maxViolations,
                status: attempt.status,
            });
            this.logger.log(`Student ${client.userId} joined exam room: ${attemptId} (violations: ${attempt.violationCount})`);
        }
        catch (err) {
            this.logger.error(`join-exam error: ${err.message}`);
            client.emit('error', { message: 'Lỗi khi tham gia phòng thi' });
        }
    }
    async handleViolation(client, data) {
        try {
            if (!client.userId || !data.attemptId)
                return;
            const result = await this.assessmentsService.logViolation(data.attemptId, data.type);
            if (result.voided) {
                this.server.to(data.attemptId).emit('exam-voided', {
                    reason: `Vi phạm vượt ngưỡng cho phép (${result.violationCount}/${result.maxViolations})`,
                    violationCount: result.violationCount,
                });
                this.logger.warn(`Attempt ${data.attemptId} VOIDED — violations: ${result.violationCount}`);
            }
            else {
                client.emit('violation-ack', {
                    violationCount: result.violationCount,
                    remaining: result.remaining,
                    maxViolations: result.maxViolations,
                });
            }
        }
        catch (err) {
            this.logger.error(`violation handler error: ${err.message}`);
        }
    }
    async handleSaveAnswer(client, data) {
        try {
            if (!client.userId || !data.attemptId || !data.answers)
                return;
            await this.assessmentsService.cacheAnswers(data.attemptId, client.userId, data.answers);
        }
        catch (err) {
            this.logger.debug(`save-answer sync error: ${err.message}`);
        }
    }
};
exports.ExamGateway = ExamGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ExamGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-exam'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExamGateway.prototype, "handleJoinExam", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('violation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExamGateway.prototype, "handleViolation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('save-answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExamGateway.prototype, "handleSaveAnswer", null);
exports.ExamGateway = ExamGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/exam',
    }),
    __metadata("design:paramtypes", [assessments_service_1.AssessmentsService,
        config_1.ConfigService,
        jwt_1.JwtService])
], ExamGateway);
//# sourceMappingURL=exam.gateway.js.map