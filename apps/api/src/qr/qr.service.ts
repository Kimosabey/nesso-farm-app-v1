import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { QrCode, QrCodeDocument, TracePayload } from './schemas/qr-code.schema';
import { Inventory, InventoryDocument } from '../inventory/schemas/inventory.schema';
import { Procurement, ProcurementDocument } from '../procurement/schemas/procurement.schema';
import { Farmer, FarmerDocument } from '../farmers/schemas/farmer.schema';
import { Farm, FarmDocument } from '../farms/schemas/farm.schema';
import { Crop, CropDocument } from '../crops/schemas/crop.schema';

/**
 * URL-safe slug, 10 chars from base32 minus ambiguous I/O/0/1.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function mintCode(): string {
  const bytes = randomBytes(10);
  let out = '';
  for (let i = 0; i < 10; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

@Injectable()
export class QrService {
  constructor(
    @InjectModel(QrCode.name) private readonly qrModel: Model<QrCodeDocument>,
    @InjectModel(Inventory.name) private readonly invModel: Model<InventoryDocument>,
    @InjectModel(Procurement.name) private readonly procModel: Model<ProcurementDocument>,
    @InjectModel(Farmer.name) private readonly farmerModel: Model<FarmerDocument>,
    @InjectModel(Farm.name) private readonly farmModel: Model<FarmDocument>,
    @InjectModel(Crop.name) private readonly cropModel: Model<CropDocument>,
  ) {}

  /**
   * Create (or return existing) QR code for a batch and denormalize the
   * consumer-facing trace payload from the linked entities.
   */
  async generateForBatch(batchId: string): Promise<QrCodeDocument> {
    const existing = await this.qrModel.findOne({ batchId }).exec();
    if (existing) {
      const payload = await this.buildPayload(batchId);
      const updated = await this.qrModel
        .findOneAndUpdate({ batchId }, { $set: { payload } }, { new: true })
        .exec();
      return updated!;
    }

    // Mint a unique code (retry on collision; 3 attempts)
    let code = mintCode();
    for (let i = 0; i < 3; i++) {
      const collide = await this.qrModel.exists({ code }).exec();
      if (!collide) break;
      code = mintCode();
    }

    const payload = await this.buildPayload(batchId);
    const doc = await this.qrModel.create({ code, batchId, payload });

    // Stamp the code on the inventory row so the batch page can show it
    await this.invModel.updateOne({ batchId }, { $set: { qrCode: code } }).exec();

    return doc;
  }

  /**
   * Rebuild and persist the payload — call this whenever the underlying
   * inventory batch (or its linked entities) changes materially.
   */
  async refreshPayload(batchId: string): Promise<void> {
    const exists = await this.qrModel.exists({ batchId }).exec();
    if (!exists) return;
    const payload = await this.buildPayload(batchId);
    await this.qrModel
      .updateOne({ batchId }, { $set: { payload } })
      .exec();
  }

  async findByCode(code: string): Promise<QrCodeDocument> {
    const doc = await this.qrModel.findOne({ code }).exec();
    if (!doc) throw new NotFoundException('QR code not found');
    return doc;
  }

  async findByBatchId(batchId: string): Promise<QrCodeDocument | null> {
    return this.qrModel.findOne({ batchId }).exec();
  }

  async logScan(code: string): Promise<void> {
    const now = new Date();
    await this.qrModel
      .updateOne(
        { code },
        {
          $inc: { scanCount: 1 },
          $set: { lastScannedAt: now },
          $setOnInsert: { firstScannedAt: now },
        },
      )
      .exec();
    // setOnInsert won't fire on update — do a follow-up for firstScannedAt if null
    await this.qrModel
      .updateOne({ code, firstScannedAt: { $exists: false } }, { $set: { firstScannedAt: now } })
      .exec();
  }

  /**
   * Build the consumer-facing trace payload from the inventory batch and
   * its linked procurement / farmer / farm / crop / warehouse.
   * Honors farmers.publicTraceConsent — when false, redact PII.
   */
  private async buildPayload(batchId: string): Promise<TracePayload> {
    const inv = await this.invModel.findOne({ batchId, isDeleted: false }).lean().exec();
    if (!inv) {
      return {
        timeline: [],
        certifications: [],
        generatedAt: new Date().toISOString(),
      };
    }

    const proc = inv.linkedProcurementId
      ? await this.procModel.findOne({ _id: inv.linkedProcurementId }).lean().exec()
      : null;

    const farmer = proc
      ? await this.farmerModel.findOne({ _id: proc.farmerId }).lean().exec()
      : null;

    // Best-effort: find a farm + crop matching this farmer + crop name
    let farm = null;
    let crop = null;
    if (farmer && proc) {
      crop = await this.cropModel
        .findOne({
          farmerId: farmer._id?.toString(),
          cropName: proc.crop,
          isDeleted: false,
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      farm = crop
        ? await this.farmModel.findOne({ _id: crop.farmId, isDeleted: false }).lean().exec()
        : await this.farmModel
            .findOne({ farmerId: farmer._id?.toString(), isDeleted: false })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    const consent = farmer?.publicTraceConsent === true;
    const displayName = farmer
      ? consent
        ? `${farmer.firstName ?? ''} ${farmer.lastName ?? ''}`.trim()
        : `${(farmer.firstName ?? 'F')[0]}.${(farmer.lastName ?? '')[0] ?? ''}.`
      : 'Unknown';

    const timeline = (inv.stageHistory ?? []).map((s) => ({
      stage: s.stage,
      at: s.at instanceof Date ? s.at.toISOString() : String(s.at),
      notes: s.notes,
    }));

    return {
      product: { name: inv.productName, variant: inv.variant, grade: inv.grade },
      batch: {
        batchId: inv.batchId,
        harvestDate: crop?.harvestDate
          ? new Date(crop.harvestDate).toISOString()
          : inv.incomingDate
            ? new Date(inv.incomingDate).toISOString()
            : undefined,
        expiryDate: inv.expiryDate ? new Date(inv.expiryDate).toISOString() : undefined,
      },
      farmer: farmer
        ? {
            farmerId: farmer.farmerId,
            displayName,
            village: farmer.address?.village,
            district: farmer.address?.district,
            state: farmer.address?.state,
            enrolledYear:
              (farmer as { createdAt?: Date }).createdAt
                ? new Date((farmer as { createdAt: Date }).createdAt).getFullYear()
                : undefined,
          }
        : undefined,
      farm: farm
        ? {
            farmId: farm.farmId,
            name: farm.farmName,
            areaAcres: farm.farmArea,
            practice: farm.organicStage,
          }
        : undefined,
      crop: crop
        ? {
            name: crop.cropName,
            variety: crop.cropVariety,
            sowingDate: crop.sowingDate ? new Date(crop.sowingDate).toISOString() : undefined,
            harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString() : undefined,
          }
        : undefined,
      timeline,
      certifications: [], // populated when we wire audits/certifications
      warehouse: inv.warehouseName
        ? {
            name: inv.warehouseName,
            type: inv.type,
            certificationStatus: 'Conventional',
          }
        : undefined,
      generatedAt: new Date().toISOString(),
    };
  }
}
