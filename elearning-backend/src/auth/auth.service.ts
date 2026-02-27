import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { User as PrismaUser } from '@prisma/client';

/** JWT payload interface */
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

/** Auth response shape */
export interface AuthResponseData {
    accessToken: string;
    refreshToken: string;
    user: PrismaUser;
}

@Injectable()
export class AuthService {
    private readonly BCRYPT_ROUNDS = 10;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Register a new user.
     */
    async register(input: RegisterInput): Promise<AuthResponseData> {
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(
            input.password,
            this.BCRYPT_ROUNDS,
        );

        const user = await this.userRepository.create({
            email: input.email,
            password: hashedPassword,
            role: input.role || 'STUDENT',
        });

        const tokens = this.generateTokens(user);

        return {
            ...tokens,
            user,
        };
    }

    /**
     * Login with email and password.
     */
    async login(input: LoginInput): Promise<AuthResponseData> {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = this.generateTokens(user);

        return {
            ...tokens,
            user,
        };
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    async refreshToken(refreshToken: string): Promise<AuthResponseData> {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.userRepository.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const tokens = this.generateTokens(user);

            return {
                ...tokens,
                user,
            };
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    /**
     * Validate user by ID (used by JWT Strategy).
     */
    async validateUser(userId: string): Promise<PrismaUser | null> {
        return this.userRepository.findById(userId);
    }

    /**
     * Generate access + refresh token pair.
     */
    private generateTokens(user: PrismaUser): {
        accessToken: string;
        refreshToken: string;
    } {
        const payload: Record<string, unknown> = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ||
                '15m') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
                '7d') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        });

        return { accessToken, refreshToken };
    }
}
