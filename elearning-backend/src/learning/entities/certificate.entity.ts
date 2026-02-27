import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Certificate {
    @Field(() => ID)
    id: string;

    @Field()
    certificateCode: string;

    @Field()
    userId: string;

    @Field()
    courseId: string;

    @Field()
    issueDate: Date;

    @Field()
    createdAt: Date;

    @Field({ nullable: true })
    courseNameAtIssue?: string;

    @Field({ nullable: true })
    certificateUrl?: string;

    // Resolved fields
    @Field({ nullable: true })
    userName?: string;

    @Field({ nullable: true })
    courseName?: string;
}
