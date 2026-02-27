import { AuthService, AuthResponseData } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { User } from './entities/user.entity';
import { Certificate } from '../learning/entities/certificate.entity';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthResolver {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    register(input: RegisterInput): Promise<AuthResponseData>;
    login(input: LoginInput): Promise<AuthResponseData>;
    refreshToken(refreshToken: string): Promise<AuthResponseData>;
    me(user: {
        id: string;
    }): Promise<User>;
    updateProfile(user: {
        id: string;
    }, input: UpdateProfileInput): Promise<User>;
    getMyCertificates(user: {
        id: string;
    }): Promise<Certificate[]>;
    getCertificateByCode(code: string): Promise<Certificate | null>;
}
