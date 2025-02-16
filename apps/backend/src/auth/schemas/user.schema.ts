import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId(), unique: true })
  id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    required: function (this: User) {
      // Password is required only if the user is not registered via Google
      return !this.isGoogleUser;
    },
  })
  password: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false }) // Flag to indicate Google user registration
  isGoogleUser: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
