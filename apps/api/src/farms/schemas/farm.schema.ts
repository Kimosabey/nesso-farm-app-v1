import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FarmDocument = HydratedDocument<Farm>;

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type!: 'Point';

  @Prop({ type: [Number], required: true }) // [lng, lat] per GeoJSON
  coordinates!: [number, number];
}
export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema({ _id: false })
export class PolygonPoint {
  @Prop({ required: true }) lat!: number;
  @Prop({ required: true }) lng!: number;
}
export const PolygonPointSchema = SchemaFactory.createForClass(PolygonPoint);

@Schema({ _id: false })
export class FarmAddress {
  @Prop() state?: string;
  @Prop() district?: string;
  @Prop() taluka?: string;
  @Prop() hobli?: string;
  @Prop() city?: string;
  @Prop() pincode?: string;
}
export const FarmAddressSchema = SchemaFactory.createForClass(FarmAddress);

@Schema({ timestamps: true, collection: 'farms' })
export class Farm {
  @Prop({ required: true, unique: true, index: true })
  farmId!: string;

  @Prop({ required: true, index: true })
  farmerId!: string;

  @Prop()
  farmerName?: string;

  @Prop({ required: true })
  farmName!: string;

  @Prop()
  surveyNumber?: string;

  @Prop({ default: 0 })
  farmArea!: number; // acres

  @Prop({ default: 0 })
  growingArea!: number;

  @Prop({
    enum: ['Certified', 'InTransition', 'Conventional'],
    default: 'Conventional',
  })
  organicStage!: string;

  @Prop() previousPractice?: string;
  @Prop() waterSource?: string;
  @Prop() soilType?: string;
  @Prop({ enum: ['Own', 'Lease', 'Share'] }) ownership?: string;
  @Prop({ enum: ['Open', 'Greenhouse', 'ShadeNet'] }) fieldType?: string;

  @Prop({ type: GeoPointSchema, required: true, index: '2dsphere' })
  location!: GeoPoint;

  @Prop({ type: [PolygonPointSchema], default: [] })
  polygonPoints!: PolygonPoint[];

  @Prop()
  mapScreenshotKey?: string;

  @Prop({ type: FarmAddressSchema, default: () => ({}) })
  address!: FarmAddress;

  @Prop({ index: true })
  flowerAgentId?: string;

  @Prop({ enum: ['active', 'archived'], default: 'active', index: true })
  status!: 'active' | 'archived';

  @Prop({
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  })
  approvalStatus!: 'pending' | 'approved' | 'rejected';

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const FarmSchema = SchemaFactory.createForClass(Farm);
FarmSchema.index({ farmerId: 1, isDeleted: 1 });
