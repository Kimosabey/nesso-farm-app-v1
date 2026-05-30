import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Sample, SampleDocument, SampleStatus } from './schemas/sample.schema';
import {
  CreateSampleDto,
  ListSamplesQueryDto,
  TransitionSampleDto,
} from './dto/sample.dto';
import { CounterService } from '../common/counter/counter.service';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

// Allowed forward transitions. Admin override is handled by a separate flag.
const ALLOWED: Record<SampleStatus, SampleStatus[]> = {
  Queue: ['Sent', 'Rejected'],
  Sent: ['Received', 'Rejected'],
  Received: ['Tested', 'Rejected'],
  Tested: ['Approved', 'Rejected'],
  Approved: [],
  Rejected: [],
};

@Injectable()
export class SamplesService {
  constructor(
    @InjectModel(Sample.name) private readonly model: Model<SampleDocument>,
    private readonly counter: CounterService,
  ) {}

  async create(dto: CreateSampleDto): Promise<SampleDocument> {
    const year = new Date().getFullYear();
    const n = await this.counter.next(`sample:${year}`);
    const sampleCode = `NES-S-${year}-${String(n).padStart(5, '0')}`;
    return this.model.create({ ...dto, sampleCode, status: 'Queue' });
  }

  async list(query: ListSamplesQueryDto) {
    const filter: FilterQuery<SampleDocument> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.crop) filter.crop = query.crop;
    if (query.variety) filter.variety = query.variety;
    if (query.association) filter.association = query.association;
    if (query.farmerId) filter.farmerId = query.farmerId;

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<SampleDocument[]>,
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async findById(id: string): Promise<SampleDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Sample not found');
    return doc;
  }

  async stats(): Promise<Record<string, number>> {
    const agg = await this.model
      .aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .exec();
    const out: Record<string, number> = {
      Queue: 0, Sent: 0, Received: 0, Tested: 0, Approved: 0, Rejected: 0, total: 0,
    };
    for (const row of agg) {
      out[row._id as string] = row.count;
      out.total += row.count;
    }
    return out;
  }

  async transition(id: string, dto: TransitionSampleDto): Promise<SampleDocument> {
    const doc = await this.findById(id);
    const allowed = ALLOWED[doc.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition ${doc.status} → ${dto.status}. Allowed: [${allowed.join(', ') || 'none — terminal'}]`,
      );
    }

    const patch: Record<string, unknown> = { status: dto.status };
    const now = new Date();
    if (dto.status === 'Sent') patch.sentDate = now;
    else if (dto.status === 'Received') patch.receivedDate = now;
    else if (dto.status === 'Tested') patch.testedDate = now;
    if (dto.result) patch.result = dto.result;
    if (dto.notes) patch.notes = dto.notes;

    const updated = await this.model
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: patch }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Sample not found');
    return updated;
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Sample not found');
    return { ok: true };
  }
}
