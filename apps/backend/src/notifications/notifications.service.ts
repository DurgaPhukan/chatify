import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { NotificationsGateway } from './notifications.gateway';
import { Notification, NotificationDocument } from './schemas/notifications.schema';
import { CombinedSocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    private readonly notificationsGateway: CombinedSocketGateway,
  ) { }

  async createNotification(notificationData: Partial<Notification>): Promise<NotificationDocument> {
    const createdNotification = new this.notificationModel(notificationData);
    const savedNotification = await createdNotification.save();

    this.notificationsGateway.sendNotificationToUser(
      savedNotification.recipientId,
      savedNotification,
    );

    return savedNotification;
  }

  async getNotificationsForUser(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async updateNotification(
    notificationId: string,
    updateData: Partial<Notification>,
  ): Promise<NotificationDocument> {
    const updatedNotification = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true },
    );
    if (!updatedNotification) {
      throw new NotFoundException('Notification not found');
    }
    return updatedNotification;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const result = await this.notificationModel.findByIdAndDelete(notificationId);
    if (!result) {
      throw new NotFoundException('Notification not found');
    }
  }

  async broadcastNotification(
    notificationData: Partial<Notification>,
    recipientIds: string[],
  ): Promise<void> {
    for (const recipientId of recipientIds) {
      const createdNotification = new this.notificationModel({
        ...notificationData,
        recipientId,
      });
      const savedNotification = await createdNotification.save();

      this.notificationsGateway.sendNotificationToUser(recipientId, savedNotification);
    }
  }
}