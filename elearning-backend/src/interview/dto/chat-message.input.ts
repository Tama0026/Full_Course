import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ChatMessageInput {
    @Field()
    role: string; // 'user' or 'assistant'

    @Field()
    content: string;
}
