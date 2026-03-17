import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

// Define locally to avoid IDE sync issues with Prisma Client
export enum NotificationType {
  ENROLLMENT = 'ENROLLMENT',
  BADGE = 'BADGE',
  CERTIFICATE = 'CERTIFICATE',
  REVIEW = 'REVIEW',
  COURSE_UPDATE = 'COURSE_UPDATE',
  SYSTEM = 'SYSTEM',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Type of notification',
});

@ObjectType()
export class NotificationEntity {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field({ nullable: true })
  data?: string;

  @Field({ nullable: true })
  link?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class UnreadCount {
  @Field(() => Int)
  count: number;
}
