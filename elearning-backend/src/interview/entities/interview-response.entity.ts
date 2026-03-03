import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InterviewResponse {
    @Field()
    reply: string;

    @Field()
    courseId: string;

    @Field()
    courseName: string;
}
