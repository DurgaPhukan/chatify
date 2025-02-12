import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) { }

  notify(event: string, data: any) {
    this.notificationsGateway.sendNotification(data);
  }
}