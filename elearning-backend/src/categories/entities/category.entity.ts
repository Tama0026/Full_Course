import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Category {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    slug: string;

    @Field(() => Int)
    order: number;

    @Field()
    createdAt: Date;
}
