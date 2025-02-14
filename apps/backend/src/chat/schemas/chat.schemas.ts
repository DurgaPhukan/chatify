import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  creatorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true, index: true })
  roomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat', default: null })
  replyId: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentionIds: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  })
  status: 'sent' | 'delivered' | 'read';

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
