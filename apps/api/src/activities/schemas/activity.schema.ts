import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ _id: false })
export class ActivityInput {
  @Prop({ enum: ['Chemical', 'Organic', 'Inventory', 'Other'], required: true })
  kind!: 'Chemical' | 'Organic' | 'Inventory' | 'Other';

  @Prop()
  itemId?: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: 0 })
  quantity!: number;

  @Prop()
  unit?: string;

  @Prop({ default: 0 })
  cost!: number;
}
export const ActivityInputSchema = SchemaFactory.createForClass(ActivityInput);

@Schema({ _id: false })
export class GeoTag {
  @Prop() lat?: number;
  @Prop() lng?: number;
  @Prop() accuracy?: number;
}
export const GeoTagSchema = SchemaFactory.createForClass(GeoTag);

@Schema({ timestamps: true, collection: 'activities' })
export class Activity {
  @Prop({ required: true, index: true })
  farmId!: string;

  @Prop({ index: true })
  cropId?: string;

  @Prop({ required: true, index: true })
  farmerId!: string;

  @Prop({ required: true })
  activity!: string;

  @Prop()
  cropAge?: string;

  @Prop()
  scheduledOn?: Date;

  @Prop()
  completedDate?: Date;

  @Prop({ default: () => new Date() })
  enteredDate!: Date;

  @Prop({
    enum: ['Pending', 'Completed', 'Overdue', 'Cancelled'],
    default: 'Pending',
    index: true,
  })
  status!: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';

  @Prop()
  popCompliance?: string;

  @Prop({ type: [ActivityInputSchema], default: [] })
  inputs!: ActivityInput[];

  @Prop({ default: 0 })
  totalCost!: number;

  @Prop()
  notes?: string;

  @Prop({ type: [String], default: [] })
  photos!: string[]; // S3 keys

  @Prop({ type: GeoTagSchema })
  geoTag?: GeoTag;

  // Idempotency key from mobile outbox — unique per submission
  @Prop({ index: true, sparse: true, unique: true })
  clientRequestId?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ farmId: 1, scheduledOn: -1 });
ActivitySchema.index({ status: 1, scheduledOn: 1 });
ActivitySchema.index({ scheduledOn: -1 });
