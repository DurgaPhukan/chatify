import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    required: true,
    type: String,
    enum: ['broadcast', 'invitation', 'chat', 'general'],
    default: 'general',
  })
  type: string;

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ type: String, default: null })
  referenceId?: string;

  @Prop({ required: true, type: Boolean, default: false })
  isRead: boolean;

  @Prop({ required: true, type: String })
  recipientId: string;

  @Prop({ required: true, type: String, index: true })
  senderId: string;

  @Prop({ type: Date, default: null })
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);