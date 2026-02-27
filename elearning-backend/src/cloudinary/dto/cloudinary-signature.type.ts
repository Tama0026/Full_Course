import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CloudinarySignature {
    @Field(() => Int)
    timestamp: number;

    @Field()
    signature: string;

    @Field()
    apiKey: string;

    @Field()
    cloudName: string;

    @Field()
    folder: string;

    @Field()
    type: string;
}
