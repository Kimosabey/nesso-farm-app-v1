import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WarehouseDocument = HydratedDocument<Warehouse>;

@Schema({ _id: false })
export class WarehouseContact {
  @Prop() name?: string;
  @Prop() mobileNumber?: string;
  @Prop() email?: string;
}
export const WarehouseContactSchema = SchemaFactory.createForClass(WarehouseContact);

@Schema({ _id: false })
export class WarehouseAddress {
  @Prop() country?: string;
  @Prop() state?: string;
  @Prop() district?: string;
  @Prop() taluka?: string;
  @Prop() hobli?: string;
  @Prop() city?: string;
  @Prop() pincode?: string;
  @Prop() line1?: string;
}
export const WarehouseAddressSchema = SchemaFactory.createForClass(WarehouseAddress);

@Schema({ _id: false })
export class WarehouseGeo {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type!: 'Point';
  @Prop({ type: [Number] })
  coordinates?: [number, number]; // [lng, lat]
}
export const WarehouseGeoSchema = SchemaFactory.createForClass(WarehouseGeo);

@Schema({ timestamps: true, collection: 'warehouses' })
export class Warehouse {
  @Prop({ required: true, index: true })
  warehouseName!: string;

  @Prop({ enum: ['Storage', 'FoodProcessing'], default: 'Storage', index: true })
  type!: 'Storage' | 'FoodProcessing';

  @Prop()
  availableFacility?: string;

  @Prop({ type: WarehouseContactSchema, default: () => ({}) })
  primaryContact!: WarehouseContact;

  @Prop()
  incorporationDate?: Date;

  @Prop({ enum: ['Own', 'Leased'], default: 'Own' })
  ownership!: 'Own' | 'Leased';

  @Prop({ default: 0 })
  capacity!: number;

  @Prop({ default: 0 })
  totalArea!: number;

  @Prop({
    enum: ['Applied', 'Conventional', 'Certified'],
    default: 'Conventional',
  })
  certificationStatus!: string;

  @Prop()
  certifyingAgency?: string;

  @Prop({ type: WarehouseAddressSchema, default: () => ({}) })
  address!: WarehouseAddress;

  @Prop({ type: WarehouseGeoSchema, index: '2dsphere' })
  location?: WarehouseGeo;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
