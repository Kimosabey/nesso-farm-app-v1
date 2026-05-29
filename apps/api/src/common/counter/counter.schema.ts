import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

@Schema({ collection: 'counters', timestamps: true })
export class Counter {
  @Prop({ required: true, unique: true, index: true })
  key!: string; // e.g. "farmer:2026"

  @Prop({ required: true, default: 0 })
  value!: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
