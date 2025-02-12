import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BroadcastDocument = Broadcast & Document;

@Schema({ timestamps: true })
export class Broadcast {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId(), unique: true })
  id: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({
    type: Date,
    required: true,
    validate: {
      validator: function (value: Date) {
        return value > this.startTime;
      },
      message: 'End time must be greater than start time',
    },
  })
  endTime: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: String, enum: ['private', 'public'], required: true })
  visibility: 'private' | 'public';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId;
}

export const BroadcastSchema = SchemaFactory.createForClass(Broadcast);
