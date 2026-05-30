import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Procurement, ProcurementDocument } from './schemas/procurement.schema';
import {
  CreateProcurementDto,
  ListProcurementQueryDto,
  RecordPaymentDto,
  TransitionProcurementDto,
} from './dto/procurement.dto';
import { CounterService } from '../common/counter/counter.service';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

@Injectable()
export class ProcurementService {
  constructor(
    @InjectModel(Procurement.name) private readonly model: Model<ProcurementDocument>,
    private readonly counter: CounterService,
  ) {}

  async create(dto: CreateProcurementDto): Promise<ProcurementDocument> {
    const date = new Date(dto.procurementDate);
    if (date > new Date()) {
      throw new BadRequestException('procurementDate cannot be in the future');
    }
    const year = date.getFullYear();
    const n = await this.counter.next(`procurement:${year}`);
    const procurementId = `NES-P-${year}-${String(n).padStart(5, '0')}`;
    const totalAmount = round2(dto.quantity * dto.pricePerUnit);
    return this.model.create({
      ...dto,
      procurementId,
      procurementDate: date,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Unpaid',
    });
  }

  async list(query: ListProcurementQueryDto) {
    const filter: FilterQuery<ProcurementDocument> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.association) filter.association = query.association;
    if (query.farmerId) filter.farmerId = query.farmerId;
    if (query.from || query.to) {
      filter.procurementDate = {};
      if (query.from) filter.procurementDate.$gte = new Date(query.from);
      if (query.to) filter.procurementDate.$lte = new Date(query.to);
    }

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ procurementDate: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<ProcurementDocument[]>,
      this.model.countDocuments(filter).exec(),
    ]);
    return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async findById(id: string): Promise<ProcurementDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Procurement not found');
    return doc;
  }

  async stats(): Promise<{ total: number; pending: number; completed: number; totalValue: number }> {
    const [counts] = await this.model
      .aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
            totalValue: {
              $sum: {
                $cond: [{ $ne: ['$status', 'Cancelled'] }, '$totalAmount', 0],
              },
            },
          },
        },
      ])
      .exec();
    return counts ?? { total: 0, pending: 0, completed: 0, totalValue: 0 };
  }

  async recordPayment(id: string, dto: RecordPaymentDto): Promise<ProcurementDocument> {
    const doc = await this.findById(id);
    if (doc.status === 'Cancelled') {
      throw new BadRequestException('Cannot record payment on a cancelled procurement');
    }
    const paid = doc.paymentRecords.reduce((sum, r) => sum + r.amount, 0) + dto.amount;
    if (paid > doc.totalAmount * 1.1) {
      throw new BadRequestException(
        `Payment ${paid} exceeds 110% of total ${doc.totalAmount}; review before recording`,
      );
    }
    const paymentStatus =
      paid >= doc.totalAmount - 0.01 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

    const updated = await this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          $push: { paymentRecords: { ...dto, date: new Date(dto.date) } },
          $set: { paymentStatus },
        },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Procurement not found');
    return updated;
  }

  async transition(id: string, dto: TransitionProcurementDto): Promise<ProcurementDocument> {
    const doc = await this.findById(id);
    if (doc.status === dto.status) return doc;
    if (doc.status === 'Cancelled') {
      throw new BadRequestException('Cancelled procurements cannot be transitioned');
    }
    const updated = await this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { status: dto.status } },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Procurement not found');
    return updated;
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Procurement not found');
    return { ok: true };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
