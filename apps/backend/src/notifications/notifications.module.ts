import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notifications.schema';
import { CombinedSocketGateway } from 'src/socket/socket.gateway';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    ChatModule
  ],
  providers: [CombinedSocketGateway, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule { }