import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class BadgeType {
    @Field(() => ID)
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
    creatorId: string;

    @Field({ nullable: true })
    awardedAt?: Date;
}
