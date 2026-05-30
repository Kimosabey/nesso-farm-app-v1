import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Audit, AuditDocument } from './schemas/audit.schema';
import { CreateAuditDto, ListAuditsQueryDto, ReviewAuditDto } from './dto/audit.dto';
import { NotificationsService } from '../notifications/notifications.service';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

@Injectable()
export class AuditsService {
  constructor(
    @InjectModel(Audit.name) private readonly model: Model<AuditDocument>,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateAuditDto, actorId: string): Promise<AuditDocument> {
    if (new Date(dto.auditDate) > new Date()) {
      throw new BadRequestException('auditDate cannot be in the future');
    }
    return this.model.create({
      ...dto,
      auditDate: new Date(dto.auditDate),
      status: 'Pending',
      createdBy: actorId,
    });
  }

  async list(query: ListAuditsQueryDto) {
    const filter: FilterQuery<AuditDocument> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.auditType) filter.auditType = query.auditType;
    if (query.association) filter.association = query.association;
    if (query.farmerId) filter.farmerId = query.farmerId;

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ auditDate: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<AuditDocument[]>,
      this.model.countDocuments(filter).exec(),
    ]);
    return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async findById(id: string): Promise<AuditDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Audit not found');
    return doc;
  }

  async review(id: string, dto: ReviewAuditDto, reviewerId: string): Promise<AuditDocument> {
    const doc = await this.findById(id);

    // Separation of duties: an auditor cannot approve an audit they created
    if (doc.createdBy && doc.createdBy === reviewerId) {
      throw new ForbiddenException(
        'Separation of duties: you cannot review an audit you created',
      );
    }

    if (doc.status !== 'Pending') {
      throw new BadRequestException(`Audit is already ${doc.status}; cannot re-review`);
    }

    if (!dto.approved && (!dto.reason || dto.reason.trim().length < 3)) {
      throw new BadRequestException('Rejection requires a reason (≥ 3 chars)');
    }

    const patch: Record<string, unknown> = {
      status: dto.approved ? 'Approved' : 'Rejected',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    };
    if (!dto.approved) {
      patch.rejectionReason = dto.reason;
      patch.rejectionTags = dto.tags ?? [];
    }

    const updated = await this.model
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: patch }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Audit not found');

    // Notify the auditor's creator
    if (updated.createdBy && updated.createdBy !== reviewerId) {
      void this.notifications
        .create({
          userId: updated.createdBy,
          kind: 'approval',
          title: dto.approved ? 'Audit approved' : 'Audit rejected',
          body: dto.approved
            ? `Your ${updated.auditType.toLowerCase()} audit was approved.`
            : `Your ${updated.auditType.toLowerCase()} audit was rejected: ${dto.reason}`,
          data: { auditId: updated._id?.toString(), approved: dto.approved },
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('[audit-notify] failed:', e);
        });
    }

    return updated;
  }

  async stats(): Promise<Record<string, number>> {
    const agg = await this.model
      .aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .exec();
    const out: Record<string, number> = { Pending: 0, Approved: 0, Rejected: 0, total: 0 };
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
    if (res.matchedCount === 0) throw new NotFoundException('Audit not found');
    return { ok: true };
  }
}
