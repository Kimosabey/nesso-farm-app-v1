import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditDocument = HydratedDocument<Audit>;

@Schema({ timestamps: true, collection: 'audits' })
export class Audit {
  @Prop({ required: true, index: true })
  farmerId!: string;

  @Prop()
  farmerName?: string;

  @Prop()
  association?: string;

  @Prop({
    required: true,
    enum: ['Internal', 'External', 'Compliance'],
    default: 'Internal',
    index: true,
  })
  auditType!: 'Internal' | 'External' | 'Compliance';

  @Prop({ required: true })
  description!: string;

  @Prop()
  remarks?: string;

  @Prop({
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  })
  status!: 'Pending' | 'Approved' | 'Rejected';

  @Prop({ required: true })
  auditDate!: Date;

  @Prop()
  reviewedBy?: string;

  @Prop()
  reviewedAt?: Date;

  @Prop({ index: true })
  createdBy?: string;

  @Prop({ type: [String], default: [] })
  attachments!: string[]; // S3 keys

  @Prop()
  rejectionReason?: string;

  @Prop({ type: [String], default: [] })
  rejectionTags!: string[]; // e.g. NonCompliance / DocumentMissing / DataMismatch

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
AuditSchema.index({ status: 1, auditDate: -1 });
