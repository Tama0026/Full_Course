import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AchievementStats {
    @Field(() => Int)
    totalPoints: number;

    @Field(() => Int)
    globalRank: number;

    @Field(() => Float)
    percentile: number;

    @Field(() => Int)
    earnedBadges: number;

    @Field(() => Int)
    totalBadges: number;

    @Field({ nullable: true })
    userName?: string;

    @Field({ nullable: true })
    userAvatar?: string;
}

@ObjectType()
export class BadgeWithStatus {
    @Field()
    id: string;

    @Field()
    name: string;

    @Field()
    description: string;

    @Field()
    icon: string;

    @Field()
    criteria: string;

    @Field({ nullable: true })
    courseId?: string;

    @Field({ nullable: true })
    courseName?: string;

    @Field()
    earned: boolean;

    @Field({ nullable: true })
    awardedAt?: Date;
}
