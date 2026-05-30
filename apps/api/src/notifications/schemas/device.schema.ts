import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ timestamps: true, collection: 'devices' })
export class Device {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, unique: true, index: true })
  expoPushToken!: string;

  @Prop({ enum: ['ios', 'android', 'web'], required: true })
  platform!: 'ios' | 'android' | 'web';

  @Prop()
  appVersion?: string;

  @Prop()
  osVersion?: string;

  @Prop({ default: () => new Date() })
  lastSeenAt!: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
