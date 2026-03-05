import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AssessmentsService } from './assessments.service';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  attemptId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/exam',
})
export class ExamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('ExamGateway');

  private connectedAttempts = new Map<
    string,
    { socketId: string; disconnectTimer?: NodeJS.Timeout }
  >();

  constructor(
    private readonly assessmentsService: AssessmentsService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // ============ CONNECTION LIFECYCLE ============

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.warn(
          `Client ${client.id} connected without token — disconnecting`,
        );
        client.emit('auth-error', { message: 'Token không hợp lệ' });
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        client.disconnect(true);
        return;
      }

      // Validate JWT using NestJS JwtService
      const payload = this.jwtService.verify(token as string, { secret });
      const userId = payload.sub || payload.id;

      if (!userId) {
        client.emit('auth-error', {
          message: 'Token không chứa thông tin user',
        });
        client.disconnect(true);
        return;
      }

      client.userId = userId;
      this.logger.log(`Student ${userId} connected (socket: ${client.id})`);
    } catch (err) {
      this.logger.warn(
        `JWT validation failed for ${client.id}: ${(err as Error).message}`,
      );
      client.emit('auth-error', { message: 'Token hết hạn hoặc không hợp lệ' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const attemptId = client.attemptId;
    if (attemptId) {
      this.logger.log(
        `Student ${client.userId} disconnected from attempt ${attemptId}`,
      );

      // Start a 30-second grace timer for reconnection
      const timer = setTimeout(async () => {
        try {
          // If still disconnected after 30s, log a violation
          const existing = this.connectedAttempts.get(attemptId);
          if (existing && existing.socketId === client.id) {
            // Check if attempt is still in-progress before logging violation
            const attempt =
              await this.assessmentsService.getAttemptById(attemptId);
            if (attempt && attempt.status === 'IN_PROGRESS') {
              this.logger.warn(
                `Attempt ${attemptId}: no reconnection after 30s, logging violation`,
              );
              await this.assessmentsService.logViolation(
                attemptId,
                'DISCONNECT_TIMEOUT',
              );
            } else {
              this.logger.log(
                `Attempt ${attemptId}: already ${attempt?.status}, skipping disconnect violation`,
              );
            }
            this.connectedAttempts.delete(attemptId);
          }
        } catch (err) {
          this.logger.error(
            `Error handling disconnect timeout: ${(err as Error).message}`,
          );
        }
      }, 30_000);

      // Store the timer so we can cancel on reconnection
      const existing = this.connectedAttempts.get(attemptId);
      if (existing) {
        existing.disconnectTimer = timer;
      }
    }
  }

  // ============ EVENTS ============

  @SubscribeMessage('join-exam')
  async handleJoinExam(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { attemptId: string },
  ) {
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

      // Verify attempt belongs to user and is in-progress
      const attempt = await this.assessmentsService.getAttemptForSocket(
        attemptId,
        client.userId,
      );
      if (!attempt) {
        client.emit('error', {
          message: 'Không tìm thấy bài thi hoặc bài thi đã kết thúc',
        });
        return;
      }

      // Cancel any pending disconnect timer (reconnection case)
      const existing = this.connectedAttempts.get(attemptId);
      if (existing?.disconnectTimer) {
        clearTimeout(existing.disconnectTimer);
      }

      // Join room and track
      client.attemptId = attemptId;
      client.join(attemptId);
      this.connectedAttempts.set(attemptId, { socketId: client.id });

      // Send current state (so F5 doesn't reset violation count)
      client.emit('exam-state', {
        attemptId,
        violationCount: attempt.violationCount,
        maxViolations: attempt.assessment.maxViolations,
        status: attempt.status,
      });

      this.logger.log(
        `Student ${client.userId} joined exam room: ${attemptId} (violations: ${attempt.violationCount})`,
      );
    } catch (err) {
      this.logger.error(`join-exam error: ${(err as Error).message}`);
      client.emit('error', { message: 'Lỗi khi tham gia phòng thi' });
    }
  }

  @SubscribeMessage('violation')
  async handleViolation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { attemptId: string; type: string },
  ) {
    try {
      if (!client.userId || !data.attemptId) return;

      const result = await this.assessmentsService.logViolation(
        data.attemptId,
        data.type,
      );

      if (result.voided) {
        // Exam auto-voided — notify client immediately
        this.server.to(data.attemptId).emit('exam-voided', {
          reason: `Vi phạm vượt ngưỡng cho phép (${result.violationCount}/${result.maxViolations})`,
          violationCount: result.violationCount,
        });
        this.logger.warn(
          `Attempt ${data.attemptId} VOIDED — violations: ${result.violationCount}`,
        );
      } else {
        // Acknowledge violation with remaining count
        client.emit('violation-ack', {
          violationCount: result.violationCount,
          remaining: result.remaining,
          maxViolations: result.maxViolations,
        });
      }
    } catch (err) {
      this.logger.error(`violation handler error: ${(err as Error).message}`);
    }
  }

  @SubscribeMessage('save-answer')
  async handleSaveAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { attemptId: string; answers: Record<string, string> },
  ) {
    try {
      if (!client.userId || !data.attemptId || !data.answers) return;
      // Provide those intermediate answers to the service so it can be cached
      await this.assessmentsService.cacheAnswers(
        data.attemptId,
        client.userId,
        data.answers,
      );
    } catch (err) {
      // Ignore benign sync errors
      this.logger.debug(`save-answer sync error: ${(err as Error).message}`);
    }
  }
}
