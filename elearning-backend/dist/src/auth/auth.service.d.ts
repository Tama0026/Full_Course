import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './user.repository';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { User as PrismaUser } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
export interface AuthResponseData {
    accessToken: string;
    refreshToken: string;
    user: PrismaUser;
}
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly BCRYPT_ROUNDS;
    constructor(userRepository: UserRepository, jwtService: JwtService, configService: ConfigService);
    register(input: RegisterInput): Promise<AuthResponseData>;
    login(input: LoginInput): Promise<AuthResponseData>;
    refreshToken(refreshToken: string): Promise<AuthResponseData>;
    validateUser(userId: string): Promise<PrismaUser | null>;
    private generateTokens;
}
