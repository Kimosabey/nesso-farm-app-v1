import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Inventory, InventoryDocument, InventoryStatus } from './schemas/inventory.schema';
import {
  AcceptGrnDto,
  ListInventoryQueryDto,
  ProcessInventoryDto,
  SellInventoryDto,
  TransferInventoryDto,
  TransitionInventoryDto,
} from './dto/inventory.dto';
import { CounterService } from '../common/counter/counter.service';
import { ProcurementService } from '../procurement/procurement.service';
import { WarehousesService } from '../warehouses/warehouses.service';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

// Allowed forward transitions
const ALLOWED: Record<InventoryStatus, InventoryStatus[]> = {
  AVAILABLE: ['PROCESSING', 'SOLD', 'TRANSFERRED'],
  PROCESSING: ['AVAILABLE'],          // processing → back to available next stage
  SOLD: [],                            // terminal
  TRANSFERRED: [],                     // terminal
};

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private readonly model: Model<InventoryDocument>,
    private readonly counter: CounterService,
    private readonly procurement: ProcurementService,
    private readonly warehouses: WarehousesService,
  ) {}

  async acceptGrn(dto: AcceptGrnDto, actorId: string): Promise<InventoryDocument> {
    const proc = await this.procurement.findById(dto.procurementId);
    if (proc.status === 'Cancelled') {
      throw new BadRequestException('Cannot accept GRN from a cancelled procurement');
    }
    const wh = await this.warehouses.findById(dto.warehouseId);

    const year = new Date().getFullYear();
    const n = await this.counter.next(`batch:${year}`);
    const batchId = `NES-B-${year}-${String(n).padStart(5, '0')}`;

    const now = new Date();
    const stageHistory = [{ stage: 'Received', at: now, by: actorId, notes: 'GRN accepted' }];

    return this.model.create({
      batchId,
      productName: proc.crop,
      variant: proc.variety,
      grade: dto.grade,
      supplier: proc.farmerName ?? proc.farmerId,
      warehouseId: wh._id?.toString(),
      warehouseName: wh.warehouseName,
      type: dto.type ?? 'RawMaterial',
      currentStage: 'Received',
      status: 'AVAILABLE',
      quantity: dto.quantity,
      unit: dto.unit ?? proc.unit,
      incomingDate: now,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      linkedProcurementId: proc._id?.toString(),
      stageHistory,
    });
  }

  async list(query: ListInventoryQueryDto) {
    const filter: FilterQuery<InventoryDocument> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.warehouseId) filter.warehouseId = query.warehouseId;
    if (query.grade) filter.grade = query.grade;
    if (query.supplier) filter.supplier = query.supplier;
    if (query.from || query.to) {
      filter.incomingDate = {};
      if (query.from) filter.incomingDate.$gte = new Date(query.from);
      if (query.to) filter.incomingDate.$lte = new Date(query.to);
    }

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ incomingDate: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<InventoryDocument[]>,
      this.model.countDocuments(filter).exec(),
    ]);
    return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async findByBatchId(batchId: string): Promise<InventoryDocument> {
    const doc = await this.model.findOne({ batchId, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Batch not found');
    return doc;
  }

  async findById(id: string): Promise<InventoryDocument> {
    const doc = await this.model.findOne({ _id: id, isDeleted: false }).exec();
    if (!doc) throw new NotFoundException('Batch not found');
    return doc;
  }

  async transition(
    id: string,
    dto: TransitionInventoryDto,
    actorId: string,
  ): Promise<InventoryDocument> {
    const doc = await this.findById(id);
    const allowed = ALLOWED[doc.status];
    if (!allowed.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Cannot transition ${doc.status} → ${dto.toStatus}. Allowed: [${allowed.join(', ') || 'none — terminal'}]`,
      );
    }
    const now = new Date();
    return this.appendAndReturn(id, {
      status: dto.toStatus,
      currentStage: dto.toStage ?? doc.currentStage,
      stageEntry: {
        stage: dto.toStage ?? `→ ${dto.toStatus}`,
        at: now,
        by: actorId,
        notes: dto.notes,
      },
    });
  }

  async process(
    id: string,
    dto: ProcessInventoryDto,
    actorId: string,
  ): Promise<InventoryDocument> {
    const doc = await this.findById(id);
    if (doc.status === 'SOLD' || doc.status === 'TRANSFERRED') {
      throw new BadRequestException(`Cannot process a ${doc.status} batch`);
    }
    return this.appendAndReturn(id, {
      status: 'PROCESSING',
      currentStage: dto.toStage,
      stageEntry: { stage: dto.toStage, at: new Date(), by: actorId, notes: dto.notes },
    });
  }

  async sell(id: string, dto: SellInventoryDto, actorId: string): Promise<InventoryDocument> {
    const doc = await this.findById(id);
    if (doc.status === 'SOLD' || doc.status === 'TRANSFERRED') {
      throw new BadRequestException(`Batch is already ${doc.status}`);
    }
    if (dto.quantity > doc.quantity) {
      throw new BadRequestException(
        `Sell quantity ${dto.quantity} exceeds available ${doc.quantity}`,
      );
    }

    if (dto.quantity === doc.quantity) {
      // Full sell
      return this.appendAndReturn(id, {
        status: 'SOLD',
        currentStage: `Sold to ${dto.buyer}`,
        stageEntry: {
          stage: `Sold to ${dto.buyer}`,
          at: new Date(),
          by: actorId,
          notes: dto.notes,
        },
      });
    }

    // Partial sell — split into a child SOLD batch and reduce parent quantity
    const year = new Date().getFullYear();
    const n = await this.counter.next(`batch:${year}`);
    const childBatchId = `NES-B-${year}-${String(n).padStart(5, '0')}`;
    const now = new Date();

    await this.model.create({
      batchId: childBatchId,
      productName: doc.productName,
      variant: doc.variant,
      grade: doc.grade,
      supplier: doc.supplier,
      warehouseId: doc.warehouseId,
      warehouseName: doc.warehouseName,
      type: doc.type,
      currentStage: `Sold to ${dto.buyer}`,
      status: 'SOLD',
      quantity: dto.quantity,
      unit: doc.unit,
      incomingDate: doc.incomingDate,
      linkedProcurementId: doc.linkedProcurementId,
      parentBatchId: doc.batchId,
      stageHistory: [
        ...doc.stageHistory,
        {
          stage: `Sold to ${dto.buyer}`,
          at: now,
          by: actorId,
          notes: dto.notes,
        },
      ],
    });

    return this.appendAndReturn(id, {
      quantity: doc.quantity - dto.quantity,
      stageEntry: {
        stage: `Partial sell ${dto.quantity}${doc.unit} → ${dto.buyer} (child ${childBatchId})`,
        at: now,
        by: actorId,
        notes: dto.notes,
      },
    });
  }

  async transfer(
    id: string,
    dto: TransferInventoryDto,
    actorId: string,
  ): Promise<InventoryDocument> {
    const doc = await this.findById(id);
    if (doc.status === 'SOLD' || doc.status === 'TRANSFERRED') {
      throw new BadRequestException(`Batch is already ${doc.status}`);
    }
    if (dto.quantity > doc.quantity) {
      throw new BadRequestException(
        `Transfer quantity ${dto.quantity} exceeds available ${doc.quantity}`,
      );
    }
    const dest = await this.warehouses.findById(dto.toWarehouseId);

    const year = new Date().getFullYear();
    const n = await this.counter.next(`batch:${year}`);
    const childBatchId = `NES-B-${year}-${String(n).padStart(5, '0')}`;
    const now = new Date();

    await this.model.create({
      batchId: childBatchId,
      productName: doc.productName,
      variant: doc.variant,
      grade: doc.grade,
      supplier: doc.supplier,
      warehouseId: dest._id?.toString(),
      warehouseName: dest.warehouseName,
      type: doc.type,
      currentStage: 'Received (transfer)',
      status: 'AVAILABLE',
      quantity: dto.quantity,
      unit: doc.unit,
      incomingDate: now,
      linkedProcurementId: doc.linkedProcurementId,
      sourceBatchId: doc.batchId,
      stageHistory: [
        {
          stage: `Transfer in from ${doc.batchId}`,
          at: now,
          by: actorId,
          notes: dto.notes,
        },
      ],
    });

    if (dto.quantity === doc.quantity) {
      return this.appendAndReturn(id, {
        status: 'TRANSFERRED',
        currentStage: `Transferred to ${dest.warehouseName}`,
        stageEntry: {
          stage: `Transferred ${dto.quantity}${doc.unit} → ${dest.warehouseName} (${childBatchId})`,
          at: now,
          by: actorId,
          notes: dto.notes,
        },
      });
    }

    return this.appendAndReturn(id, {
      quantity: doc.quantity - dto.quantity,
      stageEntry: {
        stage: `Partial transfer ${dto.quantity}${doc.unit} → ${dest.warehouseName} (${childBatchId})`,
        at: now,
        by: actorId,
        notes: dto.notes,
      },
    });
  }

  async stats(): Promise<{
    total: number;
    available: number;
    processing: number;
    sold: number;
    transferred: number;
  }> {
    const [counts] = await this.model
      .aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', 'PROCESSING'] }, 1, 0] } },
            sold: { $sum: { $cond: [{ $eq: ['$status', 'SOLD'] }, 1, 0] } },
            transferred: { $sum: { $cond: [{ $eq: ['$status', 'TRANSFERRED'] }, 1, 0] } },
          },
        },
      ])
      .exec();
    return counts ?? { total: 0, available: 0, processing: 0, sold: 0, transferred: 0 };
  }

  async softDelete(id: string): Promise<{ ok: true }> {
    const res = await this.model.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (res.matchedCount === 0) throw new NotFoundException('Batch not found');
    return { ok: true };
  }

  private async appendAndReturn(
    id: string,
    patch: {
      status?: InventoryStatus;
      currentStage?: string;
      quantity?: number;
      stageEntry: { stage: string; at: Date; by?: string; notes?: string };
    },
  ): Promise<InventoryDocument> {
    const set: Record<string, unknown> = {};
    if (patch.status) set.status = patch.status;
    if (patch.currentStage) set.currentStage = patch.currentStage;
    if (patch.quantity !== undefined) set.quantity = patch.quantity;
    const updated = await this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: set, $push: { stageHistory: patch.stageEntry } },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Batch not found');
    return updated;
  }
}
