import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class LeaderboardEntry {
    @Field(() => ID)
    id: string;

    @Field()
    userId: string;

    @Field(() => Int)
    totalPoints: number;

    @Field()
    updatedAt: Date;

    // Resolved fields
    @Field({ nullable: true })
    userName?: string;

    @Field({ nullable: true })
    userAvatar?: string;

    @Field(() => Int, { nullable: true })
    rank?: number;
}
