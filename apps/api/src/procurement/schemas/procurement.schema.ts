import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProcurementDocument = HydratedDocument<Procurement>;

@Schema({ _id: false })
export class PaymentRecord {
  @Prop({ required: true }) amount!: number;
  @Prop({ required: true }) date!: Date;
  @Prop({ enum: ['Cash', 'Bank', 'UPI', 'Other'] }) method?: string;
  @Prop() referenceNo?: string;
}
export const PaymentRecordSchema = SchemaFactory.createForClass(PaymentRecord);

@Schema({ timestamps: true, collection: 'procurements' })
export class Procurement {
  @Prop({ required: true, unique: true, index: true })
  procurementId!: string;

  @Prop({ required: true, index: true })
  farmerId!: string;

  @Prop()
  farmerName?: string;

  @Prop()
  association?: string;

  @Prop({ required: true })
  crop!: string;

  @Prop()
  variety?: string;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  pricePerUnit!: number;

  @Prop({ required: true })
  totalAmount!: number; // auto-derived

  @Prop({ enum: ['kg', 'quintal'], default: 'kg' })
  unit!: string;

  @Prop({ required: true })
  procurementDate!: Date;

  @Prop({
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true,
  })
  status!: 'Pending' | 'Completed' | 'Cancelled';

  @Prop({
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid',
    index: true,
  })
  paymentStatus!: 'Unpaid' | 'Partial' | 'Paid';

  @Prop({ type: [PaymentRecordSchema], default: [] })
  paymentRecords!: PaymentRecord[];

  @Prop()
  linkedBatchId?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const ProcurementSchema = SchemaFactory.createForClass(Procurement);
ProcurementSchema.index({ status: 1, procurementDate: -1 });
