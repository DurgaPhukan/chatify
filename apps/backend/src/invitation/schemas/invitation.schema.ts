import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvitationDocument = Invitation & Document;

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields
export class Invitation {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId(), unique: true })
  id: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['sent_by_creator', 'requested_by_user'],
    required: true
  })
  invitationType: 'sent_by_creator' | 'requested_by_user';

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  })
  status: 'pending' | 'accepted' | 'rejected';

  @Prop({ type: Types.ObjectId, ref: 'Broadcast', required: true })
  broadcastId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  joineeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
