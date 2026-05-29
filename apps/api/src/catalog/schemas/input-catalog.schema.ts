import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InputCatalogDocument = HydratedDocument<InputCatalog>;

@Schema({ timestamps: true, collection: 'inputCatalog' })
export class InputCatalog {
  @Prop({ required: true, unique: true, index: true })
  code!: string;

  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ required: true, enum: ['Chemical', 'Organic', 'Inventory', 'Other'], index: true })
  kind!: 'Chemical' | 'Organic' | 'Inventory' | 'Other';

  @Prop({ required: true, default: 'kg' })
  unit!: string;

  @Prop({ default: 0 })
  defaultCost!: number;

  @Prop({ type: [String], default: [], index: true })
  searchTokens!: string[];
}

export const InputCatalogSchema = SchemaFactory.createForClass(InputCatalog);
InputCatalogSchema.index({ name: 'text', searchTokens: 'text' });
