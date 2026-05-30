import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Farmer, FarmerDocument } from './schemas/farmer.schema';
import { Farm, FarmDocument } from '../farms/schemas/farm.schema';
import { Crop, CropDocument } from '../crops/schemas/crop.schema';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema';
import { Sample, SampleDocument } from '../samples/schemas/sample.schema';
import { Audit, AuditDocument } from '../audits/schemas/audit.schema';
import {
  CreateFarmerDto,
  UpdateFarmerDto,
  ListFarmersQueryDto,
  ApproveFarmerDto,
} from './dto/farmer.dto';
import { CounterService } from '../common/counter/counter.service';
import { NotificationsService } from '../notifications/notifications.service';

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
    @InjectModel(Farm.name) private readonly farms: Model<FarmDocument>,
    @InjectModel(Crop.name) private readonly crops: Model<CropDocument>,
    @InjectModel(Activity.name) private readonly activities: Model<ActivityDocument>,
    @InjectModel(Sample.name) private readonly samples: Model<SampleDocument>,
    @InjectModel(Audit.name) private readonly audits: Model<AuditDocument>,
    private readonly counter: CounterService,
    private readonly notifications: NotificationsService,
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

    // Best-effort: notify the user who onboarded this farmer
    if (doc.managedBy && doc.managedBy !== actorId) {
      void this.notifications
        .create({
          userId: doc.managedBy,
          kind: 'approval',
          title: dto.approved ? 'Farmer approved' : 'Farmer rejected',
          body: dto.approved
            ? `${doc.firstName} ${doc.lastName ?? ''} (${doc.farmerId}) has been approved.`
            : `${doc.firstName} ${doc.lastName ?? ''} (${doc.farmerId}) was rejected${
                dto.reason ? `: ${dto.reason}` : '.'
              }`,
          data: { farmerId: doc._id?.toString(), approved: dto.approved },
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('[approval-notify] failed:', e);
        });
    }

    return doc;
  }

  /**
   * Soft-delete a farmer and cascade the same soft-delete to every
   * record that references them. We mark instead of dropping rows so:
   *   - audit history is preserved (deleted=true rows are queryable)
   *   - approvals / procurements that already shipped don't disappear
   *
   * Procurement + QR + warehouse records are intentionally NOT cascaded —
   * they represent transactions that physically occurred and must remain
   * intact for traceability + financial reconciliation.
   */
  async softDelete(id: string): Promise<{ ok: true; cascaded: Record<string, number> }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Farmer not found');

    const filter = { farmerId: id, isDeleted: false };
    const update = { $set: { isDeleted: true } };
    const [farms, crops, activities, samples, audits] = await Promise.all([
      this.farms.updateMany(filter, update).then((r) => r.modifiedCount),
      this.crops.updateMany(filter, update).then((r) => r.modifiedCount),
      this.activities.updateMany(filter, update).then((r) => r.modifiedCount),
      this.samples.updateMany(filter, update).then((r) => r.modifiedCount),
      this.audits.updateMany(filter, update).then((r) => r.modifiedCount),
    ]);

    return { ok: true, cascaded: { farms, crops, activities, samples, audits } };
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
