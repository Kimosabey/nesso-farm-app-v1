import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { CreateWarehouseDto, ListWarehousesQueryDto } from './dto/warehouse.dto';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

@Injectable()
export class WarehousesService {
  constructor(@InjectModel(Warehouse.name) private readonly model: Model<WarehouseDocument>) {}

  async create(dto: CreateWarehouseDto): Promise<WarehouseDocument> {
    const { latitude, longitude, ...rest } = dto;
    const doc: Record<string, unknown> = {
      ...rest,
      incorporationDate: dto.incorporationDate ? new Date(dto.incorporationDate) : undefined,
    };
    if (latitude !== undefined && longitude !== undefined) {
      doc.location = { type: 'Point', coordinates: [longitude, latitude] };
    }
    return this.model.create(doc);
  }

  async list(query: ListWarehousesQueryDto) {
    const filter: FilterQuery<WarehouseDocument> = { isDeleted: false };
    if (query.type) filter.type = query.type;
    if (query.certificationStatus) filter.certificationStatus = query.certificationStatus;

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ warehouseName: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<WarehouseDocument[]>,
      this.model.countDocuments(filter).exec(),
    ]);
    return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async findById(id: string): Promise<WarehouseDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Warehouse not found');
    return doc;
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Warehouse not found');
    return { ok: true };
  }
}
