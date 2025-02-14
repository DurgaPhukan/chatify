import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  creatorId: Types.ObjectId; // The user who created the message

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true, index: true })
  roomId: Types.ObjectId; // The room or channel the message belongs to

  @Prop({ type: Types.ObjectId, ref: 'Chat', default: null })
  replyId: Types.ObjectId | null; // If this message is a reply to another message

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentionIds: Types.ObjectId[]; // Users mentioned in the message

  @Prop({ type: [String], default: [] })
  attachments: string[]; // Array of URLs for attachments (images, files, etc.)

  @Prop({
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  })
  status: 'sent' | 'delivered' | 'read'; // Status of the message

  @Prop({ type: Date, default: null })
  deletedAt: Date | null; // For soft deletes
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Indexes
// ChatSchema.index({ creatorId: 1 });
// ChatSchema.index({ roomId: 1 });
// ChatSchema.index({ createdAt: 1 });
