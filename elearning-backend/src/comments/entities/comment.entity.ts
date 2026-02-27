import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';

@ObjectType()
export class Comment {
    @Field(() => ID)
    id: string;

    @Field()
    content: string;

    @Field()
    userId: string;

    @Field()
    lessonId: string;

    @Field({ nullable: true })
    parentId?: string;

    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => [Comment], { nullable: true })
    replies?: Comment[];

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
