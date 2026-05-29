import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto, ListActivitiesQueryDto } from './dto/activity.dto';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 500;

@Injectable()
export class ActivitiesService {
  constructor(@InjectModel(Activity.name) private readonly model: Model<ActivityDocument>) {}

  async create(dto: CreateActivityDto): Promise<ActivityDocument> {
    // Idempotency: if a client replays the same request, return the existing record
    if (dto.clientRequestId) {
      const existing = await this.model.findOne({ clientRequestId: dto.clientRequestId }).exec();
      if (existing) return existing;
    }

    const totalCost = (dto.inputs ?? []).reduce(
      (sum, i) => sum + (i.quantity ?? 0) * (i.cost ?? 0),
      0,
    );

    // Auto-derive status if completedDate is set
    const status =
      dto.status ?? (dto.completedDate ? 'Completed' : 'Pending');

    return this.model.create({
      ...dto,
      scheduledOn: dto.scheduledOn ? new Date(dto.scheduledOn) : undefined,
      completedDate: dto.completedDate ? new Date(dto.completedDate) : undefined,
      enteredDate: new Date(),
      status,
      totalCost,
    });
  }

  /**
   * Batch upsert from mobile offline outbox. Each record is keyed by
   * its clientRequestId; duplicates within or across batches are no-ops.
   */
  async syncMany(records: CreateActivityDto[]): Promise<{
    received: number;
    created: number;
    duplicates: number;
    errors: Array<{ clientRequestId?: string; error: string }>;
  }> {
    let created = 0;
    let duplicates = 0;
    const errors: Array<{ clientRequestId?: string; error: string }> = [];
    for (const r of records) {
      try {
        if (r.clientRequestId) {
          const exists = await this.model
            .countDocuments({ clientRequestId: r.clientRequestId })
            .exec();
          if (exists > 0) {
            duplicates++;
            continue;
          }
        }
        await this.create(r);
        created++;
      } catch (e) {
        errors.push({
          clientRequestId: r.clientRequestId,
          error: e instanceof Error ? e.message : 'Unknown',
        });
      }
    }
    return { received: records.length, created, duplicates, errors };
  }

  async list(query: ListActivitiesQueryDto) {
    const filter: FilterQuery<ActivityDocument> = { isDeleted: false };
    if (query.farmId) filter.farmId = query.farmId;
    if (query.farmerId) filter.farmerId = query.farmerId;
    if (query.cropId) filter.cropId = query.cropId;
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.scheduledOn = {};
      if (query.from) filter.scheduledOn.$gte = new Date(query.from);
      if (query.to) filter.scheduledOn.$lte = new Date(query.to);
    }

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ scheduledOn: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<ActivityDocument[]>,
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findById(id: string): Promise<ActivityDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Activity not found');
    return doc;
  }

  async stats(): Promise<Record<string, number>> {
    const agg = await this.model
      .aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .exec();
    const out: Record<string, number> = { Pending: 0, Completed: 0, Overdue: 0, Cancelled: 0, total: 0 };
    for (const row of agg) {
      out[row._id as string] = row.count;
      out.total += row.count;
    }
    return out;
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Activity not found');
    return { ok: true };
  }
}
