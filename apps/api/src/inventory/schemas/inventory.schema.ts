import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

export type InventoryStatus = 'AVAILABLE' | 'PROCESSING' | 'SOLD' | 'TRANSFERRED';

@Schema({ _id: false })
export class StageHistoryEntry {
  @Prop({ required: true }) stage!: string;
  @Prop({ required: true }) at!: Date;
  @Prop() by?: string; // userId
  @Prop() notes?: string;
}
export const StageHistorySchema = SchemaFactory.createForClass(StageHistoryEntry);

@Schema({ timestamps: true, collection: 'inventory' })
export class Inventory {
  @Prop({ required: true, unique: true, index: true })
  batchId!: string;

  @Prop({ required: true })
  productName!: string;

  @Prop()
  variant?: string;

  @Prop()
  grade?: string;

  @Prop()
  supplier?: string;

  @Prop({ index: true })
  warehouseId?: string;

  @Prop()
  warehouseName?: string;

  @Prop({
    enum: ['RawMaterial', 'SemiProcessed', 'FinishedGood'],
    default: 'RawMaterial',
  })
  type!: 'RawMaterial' | 'SemiProcessed' | 'FinishedGood';

  @Prop({ default: 'Received' })
  currentStage!: string;

  @Prop({
    required: true,
    enum: ['AVAILABLE', 'PROCESSING', 'SOLD', 'TRANSFERRED'],
    default: 'AVAILABLE',
    index: true,
  })
  status!: InventoryStatus;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ default: 'kg' })
  unit!: string;

  @Prop({ required: true })
  incomingDate!: Date;

  @Prop()
  expiryDate?: Date;

  @Prop()
  qrCode?: string;

  @Prop({ index: true })
  linkedProcurementId?: string;

  @Prop()
  parentBatchId?: string;

  @Prop()
  sourceBatchId?: string;

  @Prop({ type: [StageHistorySchema], default: [] })
  stageHistory!: StageHistoryEntry[];

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
InventorySchema.index({ status: 1, incomingDate: -1 });
