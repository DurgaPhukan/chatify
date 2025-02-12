import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String, enum: ['broadcast', 'invitation', 'chat', 'general'] })
  type: string; // Notification type (e.g., broadcast, invitation, chat, or general)

  @Prop({ required: true, type: String })
  message: string; // The notification content

  @Prop({ type: String, required: false })
  referenceId: string; // Links the notification to another document (broadcast, chat, or invitation)

  @Prop({ required: true, type: Boolean, default: false })
  isRead: boolean; // Whether the notification has been read by the user

  @Prop({ required: true, type: String })
  recipientId: string; // User ID of the recipient

  @Prop({ required: true, type: String })
  senderId: string; // User ID of the sender (could be system or another user)
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
