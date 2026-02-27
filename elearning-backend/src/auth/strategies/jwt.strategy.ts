import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        super({
            // Extract JWT from the 'access_token' cookie first,
            // then fall back to the Authorization Bearer header.
            jwtFromRequest: ExtractJwt.fromExtractors([
                // 1) Cookie extractor (used by browser via Next.js rewrite proxy)
                (req: any) => {
                    const cookie = req?.cookies?.access_token
                        || req?.headers?.cookie
                            ?.split(';')
                            .find((c: string) => c.trim().startsWith('access_token='))
                            ?.split('=')[1];
                    return cookie || null;
                },
                // 2) Bearer token extractor (used by server-side Apollo Client)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    /**
     * Validate the JWT payload and return the user object.
     * This user object will be attached to req.user.
     */
    async validate(
        payload: JwtPayload,
    ): Promise<{ id: string; email: string; role: string }> {
        const user = await this.authService.validateUser(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
}
