import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CropDocument = HydratedDocument<Crop>;

@Schema({ timestamps: true, collection: 'crops' })
export class Crop {
  @Prop({ required: true, unique: true, index: true })
  cropId!: string;

  @Prop({ required: true, index: true })
  farmId!: string;

  @Prop({ required: true, index: true })
  farmerId!: string;

  @Prop({ required: true })
  cropName!: string;

  @Prop()
  cropVariety?: string;

  @Prop({ enum: ['Main', 'Inter', 'Border'], default: 'Main' })
  cropType!: 'Main' | 'Inter' | 'Border';

  @Prop({ enum: ['kg', 'quintal', 'tonne', 'nos'], default: 'kg' })
  unit!: string;

  @Prop({ default: 0 })
  acre!: number;

  @Prop({ default: 0 })
  mappedAcre!: number;

  @Prop({ default: 0 })
  estHarvest!: number;

  @Prop({ enum: ['RAINFED', 'IRRIGATION'], default: 'IRRIGATION' })
  waterType!: string;

  @Prop({ enum: ['SOWING', 'PLANTING'], default: 'SOWING' })
  method!: string;

  @Prop({ enum: ['CONVENTIONAL', 'ORGANIC'], default: 'CONVENTIONAL' })
  practice!: string;

  @Prop()
  sowingDate?: Date;

  @Prop()
  harvestDate?: Date;

  @Prop({ default: false })
  multipleHarvest!: boolean;

  @Prop({
    enum: ['Kharif', 'Rabi', 'Summer', 'Perennial', 'Anytime', 'All'],
    default: 'Anytime',
  })
  season!: string;

  @Prop({ index: true })
  year?: number;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const CropSchema = SchemaFactory.createForClass(Crop);
CropSchema.index({ farmId: 1, isDeleted: 1 });
CropSchema.index({ farmerId: 1, year: -1 });
