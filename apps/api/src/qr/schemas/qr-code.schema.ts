import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QrCodeDocument = HydratedDocument<QrCode>;

/**
 * Denormalized trace payload — a frozen snapshot of the consumer-facing
 * traceability timeline. Rebuilt on each inventory transition.
 */
@Schema({ _id: false })
export class TracePayload {
  @Prop({ type: Object }) product?: { name: string; variant?: string; grade?: string };
  @Prop({ type: Object }) batch?: { batchId: string; harvestDate?: string; expiryDate?: string };
  @Prop({ type: Object }) farmer?: {
    farmerId?: string;
    displayName?: string;
    village?: string;
    district?: string;
    state?: string;
    enrolledYear?: number;
  };
  @Prop({ type: Object }) farm?: {
    farmId?: string;
    name?: string;
    areaAcres?: number;
    practice?: string;
  };
  @Prop({ type: Object }) crop?: {
    name?: string;
    variety?: string;
    sowingDate?: string;
    harvestDate?: string;
  };
  @Prop({ type: [Object], default: [] }) timeline!: Array<{
    stage: string;
    at: string;
    notes?: string;
  }>;
  @Prop({ type: [Object], default: [] }) certifications!: Array<{
    kind: string;
    agency?: string;
    validUntil?: string;
  }>;
  @Prop({ type: Object }) warehouse?: {
    name?: string;
    type?: string;
    certificationStatus?: string;
  };
  @Prop() generatedAt?: string;
}
export const TracePayloadSchema = SchemaFactory.createForClass(TracePayload);

@Schema({ timestamps: true, collection: 'qrCodes' })
export class QrCode {
  @Prop({ required: true, unique: true, index: true })
  code!: string;

  @Prop({ required: true, index: true })
  batchId!: string;

  @Prop({ type: TracePayloadSchema, default: () => ({}) })
  payload!: TracePayload;

  @Prop({ default: 0 })
  scanCount!: number;

  @Prop()
  firstScannedAt?: Date;

  @Prop()
  lastScannedAt?: Date;
}

export const QrCodeSchema = SchemaFactory.createForClass(QrCode);
