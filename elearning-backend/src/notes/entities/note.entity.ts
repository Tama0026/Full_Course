import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';

@ObjectType()
export class Note {
    @Field(() => ID)
    id: string;

    @Field()
    content: string;

    @Field()
    userId: string;

    @Field()
    lessonId: string;

    @Field(() => Float)
    videoTimestamp: number;

    @Field(() => User, { nullable: true })
    user?: User;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
