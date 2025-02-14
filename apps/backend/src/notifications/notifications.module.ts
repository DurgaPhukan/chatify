import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from './schemas/notifications.schema';
import { ChatModule } from '../chat/chat.module'; // Import ChatModule
import { AppModule } from '../app.module'; // Import AppModule to access CombinedSocketGateway

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
    forwardRef(() => ChatModule), // Use forwardRef to avoid circular dependency
    forwardRef(() => AppModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule { }