import { ObjectType, Field, ID } from '@nestjs/graphql';
import { OrderStatus } from '../../common/enums/role.enum';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@ObjectType()
export class Order {
    @Field(() => ID)
    id: string;

    @Field()
    userId: string;

    @Field()
    courseId: string;

    @Field(() => OrderStatus)
    status: OrderStatus;

    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => Course, { nullable: true })
    course?: Course;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
