import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { Section } from './section.entity';

@ObjectType()
export class Course {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    description: string;

    @Field(() => Float)
    price: number;

    @Field()
    published: boolean;

    @Field()
    isActive: boolean;

    @Field()
    instructorId: string;

    @Field(() => User, { nullable: true })
    instructor?: User;

    @Field(() => [Section], { nullable: true })
    sections?: Section[];

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
