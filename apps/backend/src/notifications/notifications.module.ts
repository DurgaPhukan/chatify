import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedSocketModule } from 'src/socket/socket.module';
import { NotificationsService } from './notifications.service';
import { NotificationSchema } from './schemas/notifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
    SharedSocketModule
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule { }