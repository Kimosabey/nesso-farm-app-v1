import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Farm, FarmDocument } from './schemas/farm.schema';
import { CreateFarmDto, ListFarmsQueryDto, NearbyQueryDto } from './dto/farm.dto';
import { CounterService } from '../common/counter/counter.service';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

@Injectable()
export class FarmsService {
  constructor(
    @InjectModel(Farm.name) private readonly model: Model<FarmDocument>,
    private readonly counter: CounterService,
  ) {}

  async create(dto: CreateFarmDto): Promise<FarmDocument> {
    const farmId = await this.counter.mintFarmId();
    return this.model.create({
      ...dto,
      farmId,
      location: { type: 'Point', coordinates: [dto.longitude, dto.latitude] },
      polygonPoints: dto.polygonPoints ?? [],
    });
  }

  async list(query: ListFarmsQueryDto) {
    const filter: FilterQuery<FarmDocument> = { isDeleted: false };
    if (query.farmerId) filter.farmerId = query.farmerId;
    if (query.flowerAgentId) filter.flowerAgentId = query.flowerAgentId;
    if (query.status) filter.status = query.status;

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<FarmDocument[]>,
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

  async findById(id: string): Promise<FarmDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Farm not found');
    return doc;
  }

  async nearby(q: NearbyQueryDto) {
    return this.model
      .find({
        isDeleted: false,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [q.lng, q.lat] },
            $maxDistance: q.radiusKm * 1000,
          },
        },
      })
      .limit(100)
      .lean()
      .exec();
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Farm not found');
    return { ok: true };
  }
}
