import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AssessmentsService } from './assessments.service';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    attemptId?: string;
}
export declare class ExamGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly assessmentsService;
    private readonly configService;
    private readonly jwtService;
    server: Server;
    private readonly logger;
    private connectedAttempts;
    constructor(assessmentsService: AssessmentsService, configService: ConfigService, jwtService: JwtService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleJoinExam(client: AuthenticatedSocket, data: {
        attemptId: string;
    }): Promise<void>;
    handleViolation(client: AuthenticatedSocket, data: {
        attemptId: string;
        type: string;
    }): Promise<void>;
    handleSaveAnswer(client: AuthenticatedSocket, data: {
        attemptId: string;
        answers: Record<string, string>;
    }): Promise<void>;
}
export {};
