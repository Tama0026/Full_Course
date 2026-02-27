import { User } from '../entities/user.entity';
export declare class AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
