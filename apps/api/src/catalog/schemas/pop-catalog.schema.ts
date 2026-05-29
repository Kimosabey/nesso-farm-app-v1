import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PopCatalogDocument = HydratedDocument<PopCatalog>;

@Schema({ _id: false })
export class PopActivity {
  @Prop() stage?: string; // e.g. "Vegetative", "Flowering"
  @Prop({ required: true }) daysFromSowing!: number;
  @Prop({ required: true }) activity!: string; // e.g. "Foliar spray"
  @Prop({ type: [String], default: [] }) recommendedInputs!: string[]; // input codes
  @Prop() notes?: string;
}
export const PopActivitySchema = SchemaFactory.createForClass(PopActivity);

@Schema({ timestamps: true, collection: 'popCatalog' })
export class PopCatalog {
  @Prop({ required: true, unique: true, index: true })
  popId!: string;

  @Prop({ required: true, index: true })
  crop!: string;

  @Prop({ required: true })
  variety!: string;

  @Prop({ required: true, index: true })
  year!: number;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: [PopActivitySchema], default: [] })
  activities!: PopActivity[];
}

export const PopCatalogSchema = SchemaFactory.createForClass(PopCatalog);
PopCatalogSchema.index({ crop: 1, variety: 1, year: -1 });
