import { Role } from '../../common/enums/role.enum';
export declare class User {
    id: string;
    email: string;
    name?: string;
    headline?: string;
    bio?: string;
    avatar?: string;
    aiRank?: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
