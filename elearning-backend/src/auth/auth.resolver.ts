import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService, AuthResponseData } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { AuthResponse } from './dto/auth-response.type';
import { User } from './entities/user.entity';
import { Certificate } from '../learning/entities/certificate.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly authService: AuthService,
        private readonly prisma: PrismaService,
    ) { }

    // ==================== AUTH ====================

    @Mutation(() => AuthResponse)
    async register(@Args('input') input: RegisterInput): Promise<AuthResponseData> {
        return this.authService.register(input);
    }

    @Mutation(() => AuthResponse)
    async login(@Args('input') input: LoginInput): Promise<AuthResponseData> {
        return this.authService.login(input);
    }

    @Mutation(() => AuthResponse)
    async refreshToken(@Args('refreshToken') refreshToken: string): Promise<AuthResponseData> {
        return this.authService.refreshToken(refreshToken);
    }

    // ==================== PROFILE ====================

    @Query(() => User)
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser() user: { id: string }): Promise<User> {
        const fullUser = await this.prisma.user.findUnique({ where: { id: user.id } });
        if (!fullUser) throw new Error('User not found');
        return fullUser as unknown as User;
    }

    @Mutation(() => User)
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @CurrentUser() user: { id: string },
        @Args('input') input: UpdateProfileInput,
    ): Promise<User> {
        const updated = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                ...(input.name !== undefined && { name: input.name }),
                ...(input.headline !== undefined && { headline: input.headline }),
                ...(input.bio !== undefined && { bio: input.bio }),
                ...(input.avatar !== undefined && { avatar: input.avatar }),
            },
        });
        return updated as unknown as User;
    }

    // ==================== CERTIFICATES ====================

    @Query(() => [Certificate], { name: 'myCertificates' })
    @UseGuards(JwtAuthGuard)
    async getMyCertificates(@CurrentUser() user: { id: string }): Promise<Certificate[]> {
        const certs = await this.prisma.certificate.findMany({
            where: { userId: user.id },
            include: { course: true, user: true },
            orderBy: { issueDate: 'desc' },
        });
        return certs.map((c: any) => ({
            ...c,
            userName: c.user?.name || c.user?.email,
            courseName: c.course?.title,
        })) as unknown as Certificate[];
    }

    @Query(() => Certificate, { name: 'certificateByCode', nullable: true })
    async getCertificateByCode(@Args('code') code: string): Promise<Certificate | null> {
        const cert = await this.prisma.certificate.findUnique({
            where: { certificateCode: code },
            include: { course: true, user: true },
        });
        if (!cert) return null;
        return {
            ...cert,
            userName: (cert as any).user?.name || (cert as any).user?.email,
            courseName: (cert as any).course?.title,
        } as unknown as Certificate;
    }
}
