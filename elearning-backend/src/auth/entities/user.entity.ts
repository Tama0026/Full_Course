import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '../../common/enums/role.enum';

@ObjectType()
export class User {
    @Field(() => ID)
    id: string;

    @Field()
    email: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    headline?: string;

    @Field({ nullable: true })
    bio?: string;

    @Field({ nullable: true })
    avatar?: string;

    @Field({ nullable: true })
    aiRank?: string;

    // Password intentionally excluded from GraphQL type for security

    @Field(() => Role)
    role: Role;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
