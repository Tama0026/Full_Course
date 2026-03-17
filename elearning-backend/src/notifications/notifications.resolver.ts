import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationEntity, UnreadCount } from './entities/notification.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => NotificationEntity)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get current user's notifications (paginated).
   */
  @Query(() => [NotificationEntity], { name: 'myNotifications' })
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(
    @CurrentUser() user: { id: string },
    @Args('take', { type: () => Int, defaultValue: 20, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, defaultValue: 0, nullable: true }) skip?: number,
  ) {
    return this.notificationsService.getMyNotifications(user.id, take, skip);
  }

  /**
   * Get unread notification count.
   */
  @Query(() => UnreadCount, { name: 'unreadNotificationCount' })
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * Mark a single notification as read.
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markNotificationRead(
    @Args('notificationId', { type: () => String }) notificationId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.notificationsService.markAsRead(user.id, notificationId);
    return true;
  }

  /**
   * Mark all notifications as read.
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsRead(@CurrentUser() user: { id: string }) {
    await this.notificationsService.markAllAsRead(user.id);
    return true;
  }
}
