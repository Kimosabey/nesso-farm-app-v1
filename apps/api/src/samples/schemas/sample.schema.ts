import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SampleDocument = HydratedDocument<Sample>;

export type SampleStatus = 'Queue' | 'Sent' | 'Received' | 'Tested' | 'Approved' | 'Rejected';

@Schema({ timestamps: true, collection: 'samples' })
export class Sample {
  @Prop({ required: true, unique: true, index: true })
  sampleCode!: string;

  @Prop({ required: true, index: true })
  farmerId!: string;

  @Prop()
  farmerName?: string;

  @Prop()
  association?: string;

  @Prop({ required: true })
  crop!: string;

  @Prop({ required: true })
  variety!: string;

  @Prop({ enum: ['Kharif', 'Rabi', 'Summer', 'Perennial', 'Anytime', 'All'] })
  season?: string;

  @Prop({
    required: true,
    enum: ['Queue', 'Sent', 'Received', 'Tested', 'Approved', 'Rejected'],
    default: 'Queue',
    index: true,
  })
  status!: SampleStatus;

  @Prop()
  sentDate?: Date;

  @Prop()
  receivedDate?: Date;

  @Prop()
  testedDate?: Date;

  @Prop({ type: Object })
  result?: Record<string, unknown>;

  @Prop()
  notes?: string;

  @Prop({ index: true })
  createdBy?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const SampleSchema = SchemaFactory.createForClass(Sample);
SampleSchema.index({ status: 1, createdAt: -1 });
