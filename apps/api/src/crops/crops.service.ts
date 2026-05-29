import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Crop, CropDocument } from './schemas/crop.schema';
import { CreateCropDto, ListCropsQueryDto } from './dto/crop.dto';
import { CounterService } from '../common/counter/counter.service';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

@Injectable()
export class CropsService {
  constructor(
    @InjectModel(Crop.name) private readonly model: Model<CropDocument>,
    private readonly counter: CounterService,
  ) {}

  async create(dto: CreateCropDto): Promise<CropDocument> {
    const year = new Date().getFullYear();
    const n = await this.counter.next(`crop:${year}`);
    const cropId = `NES-C-${year}-${String(n).padStart(5, '0')}`;
    return this.model.create({
      ...dto,
      cropId,
      year: dto.year ?? year,
      sowingDate: dto.sowingDate ? new Date(dto.sowingDate) : undefined,
      harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : undefined,
    });
  }

  async list(query: ListCropsQueryDto) {
    const filter: FilterQuery<CropDocument> = { isDeleted: false };
    if (query.farmId) filter.farmId = query.farmId;
    if (query.farmerId) filter.farmerId = query.farmerId;
    if (query.season) filter.season = query.season;
    if (query.year) filter.year = query.year;

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<CropDocument[]>,
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

  async findById(id: string): Promise<CropDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Crop not found');
    return doc;
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Crop not found');
    return { ok: true };
  }
}
