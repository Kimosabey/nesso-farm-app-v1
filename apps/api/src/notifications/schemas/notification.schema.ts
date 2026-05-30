import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({
    required: true,
    enum: ['weather', 'activityReminder', 'approval', 'sync', 'system'],
    index: true,
  })
  kind!: 'weather' | 'activityReminder' | 'approval' | 'sync' | 'system';

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ type: Object })
  data?: Record<string, unknown>;

  @Prop({
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
    default: 'queued',
    index: true,
  })
  status!: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

  @Prop({ enum: ['push', 'inApp', 'sms'], default: 'inApp' })
  channel!: 'push' | 'inApp' | 'sms';

  @Prop({ default: () => new Date() })
  createdAt!: Date;

  @Prop()
  scheduledFor?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
