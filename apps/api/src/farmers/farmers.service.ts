import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Farmer, FarmerDocument } from './schemas/farmer.schema';
import {
  CreateFarmerDto,
  UpdateFarmerDto,
  ListFarmersQueryDto,
  ApproveFarmerDto,
} from './dto/farmer.dto';
import { CounterService } from '../common/counter/counter.service';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

export interface PageEnvelope<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class FarmersService {
  constructor(
    @InjectModel(Farmer.name) private readonly model: Model<FarmerDocument>,
    private readonly counter: CounterService,
  ) {}

  async create(dto: CreateFarmerDto, actorId: string): Promise<FarmerDocument> {
    const existing = await this.model
      .findOne({ mobileNumber: dto.mobileNumber, isDeleted: false })
      .exec();
    if (existing) {
      throw new ConflictException('A farmer with this mobile number already exists');
    }
    const farmerId = await this.counter.mintFarmerId();
    const doc = await this.model.create({
      ...dto,
      farmerId,
      approvalStatus: 'pending',
      managedBy: actorId,
    });
    return doc;
  }

  async list(query: ListFarmersQueryDto): Promise<PageEnvelope<FarmerDocument>> {
    const filter: FilterQuery<FarmerDocument> = { isDeleted: false };
    if (query.approvalStatus) filter.approvalStatus = query.approvalStatus;
    if (query.association === 'flowerAgent') filter.isFlowerAgent = true;
    else if (query.association) filter.groupAssociation = query.association;
    if (query.district) filter['address.district'] = query.district;
    if (query.q) {
      const re = new RegExp(escapeRegex(query.q), 'i');
      filter.$or = [
        { firstName: re },
        { lastName: re },
        { mobileNumber: re },
        { farmerId: re },
      ];
    }

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<FarmerDocument[]>,
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

  async findById(id: string): Promise<FarmerDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Farmer not found');
    return doc;
  }

  async update(id: string, dto: UpdateFarmerDto): Promise<FarmerDocument> {
    const doc = await this.model
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: dto }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Farmer not found');
    return doc;
  }

  async approve(
    id: string,
    dto: ApproveFarmerDto,
    actorId: string,
  ): Promise<FarmerDocument> {
    const status = dto.approved ? 'approved' : 'rejected';
    const update: Record<string, unknown> = {
      approvalStatus: status,
      approvedBy: actorId,
      approvedAt: new Date(),
    };
    if (status === 'rejected') update.rejectionReason = dto.reason ?? null;
    else update.rejectionReason = null;

    const doc = await this.model
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: update }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Farmer not found');
    return doc;
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Farmer not found');
    // Phase 2.x: cascade to farms/crops/activities
    return { ok: true };
  }

  async countByStatus(): Promise<Record<string, number>> {
    const agg = await this.model
      .aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$approvalStatus', count: { $sum: 1 } } },
      ])
      .exec();
    const out: Record<string, number> = { pending: 0, approved: 0, rejected: 0, total: 0 };
    for (const row of agg) {
      out[row._id as string] = row.count;
      out.total += row.count;
    }
    return out;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
