import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  phone!: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, index: true, default: 'admin' })
  role!: string;

  @Prop()
  participantType?: string;

  @Prop()
  participantId?: string;

  @Prop()
  participantName?: string;

  @Prop({ default: 'en' })
  preferredLanguage!: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: 'active' | 'inactive';

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ default: false })
  mustChangePassword!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ phone: 1, isDeleted: 1 });
