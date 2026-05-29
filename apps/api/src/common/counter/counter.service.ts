import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter, CounterDocument } from './counter.schema';

@Injectable()
export class CounterService {
  constructor(@InjectModel(Counter.name) private readonly model: Model<CounterDocument>) {}

  /**
   * Atomically increment & return the next value for a key.
   * Used to mint NES-F-YYYY-NNNNN-style sequential IDs.
   */
  async next(key: string): Promise<number> {
    const doc = await this.model
      .findOneAndUpdate(
        { key },
        { $inc: { value: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
    return doc.value;
  }

  async mintFarmerId(): Promise<string> {
    const year = new Date().getFullYear();
    const n = await this.next(`farmer:${year}`);
    return `NES-F-${year}-${String(n).padStart(5, '0')}`;
  }

  async mintFarmId(): Promise<string> {
    const year = new Date().getFullYear();
    const n = await this.next(`farm:${year}`);
    return `NES-FM-${year}-${String(n).padStart(5, '0')}`;
  }
}
