import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InputCatalog, InputCatalogDocument } from './schemas/input-catalog.schema';
import { PopCatalog, PopCatalogDocument } from './schemas/pop-catalog.schema';

export interface ListInputsQuery {
  kind?: string;
  q?: string;
  limit?: number;
}

export interface ListPopQuery {
  crop?: string;
  variety?: string;
  year?: number;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(InputCatalog.name) private readonly inputs: Model<InputCatalogDocument>,
    @InjectModel(PopCatalog.name) private readonly pops: Model<PopCatalogDocument>,
  ) {}

  async listInputs(q: ListInputsQuery) {
    const filter: Record<string, unknown> = {};
    if (q.kind) filter.kind = q.kind;
    if (q.q) {
      const re = new RegExp(escapeRegex(q.q), 'i');
      filter.$or = [{ name: re }, { searchTokens: re }, { code: re }];
    }
    return this.inputs
      .find(filter)
      .sort({ kind: 1, name: 1 })
      .limit(Math.min(200, q.limit ?? 100))
      .lean()
      .exec();
  }

  async listPop(q: ListPopQuery) {
    const filter: Record<string, unknown> = {};
    if (q.crop) filter.crop = q.crop;
    if (q.variety) filter.variety = q.variety;
    if (q.year) filter.year = q.year;
    return this.pops.find(filter).sort({ year: -1, crop: 1 }).lean().exec();
  }

  async findPopById(popId: string) {
    return this.pops.findOne({ popId }).lean().exec();
  }

  async upsertInput(doc: Partial<InputCatalog>) {
    return this.inputs
      .findOneAndUpdate({ code: doc.code }, { $set: doc }, { upsert: true, new: true })
      .exec();
  }

  async upsertPop(doc: Partial<PopCatalog>) {
    return this.pops
      .findOneAndUpdate({ popId: doc.popId }, { $set: doc }, { upsert: true, new: true })
      .exec();
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
