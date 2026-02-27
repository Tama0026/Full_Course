import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class VideoProgress {
    @Field(() => ID)
    id: string;

    @Field()
    userId: string;

    @Field()
    lessonId: string;

    @Field(() => Float)
    currentTime: number;

    @Field()
    updatedAt: Date;
}
