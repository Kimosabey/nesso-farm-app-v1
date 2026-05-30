import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Farmer, FarmerDocument } from '../farmers/schemas/farmer.schema';
import { Farm, FarmDocument } from '../farms/schemas/farm.schema';
import { Crop, CropDocument } from '../crops/schemas/crop.schema';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema';
import { Procurement, ProcurementDocument } from '../procurement/schemas/procurement.schema';

export interface PreHarvestReportFilters {
  approvalStatus?: string;
  includeFlowerAgents?: boolean;
  includeMissingFarm?: boolean;
}

export interface FarmerSummaryFilters {
  farmerId?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Farmer.name) private readonly farmerModel: Model<FarmerDocument>,
    @InjectModel(Farm.name) private readonly farmModel: Model<FarmDocument>,
    @InjectModel(Crop.name) private readonly cropModel: Model<CropDocument>,
    @InjectModel(Activity.name) private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Procurement.name) private readonly procModel: Model<ProcurementDocument>,
  ) {}

  /**
   * Pre-harvest aggregation report — joins farmer → farm → crop and
   * rolls up activity counts by status.
   */
  async preHarvest(filters: PreHarvestReportFilters) {
    const started = Date.now();
    const farmerFilter: Record<string, unknown> = { isDeleted: false };
    if (filters.approvalStatus) farmerFilter.approvalStatus = filters.approvalStatus;
    if (filters.includeFlowerAgents === false) farmerFilter.isFlowerAgent = { $ne: true };

    const farmers = await this.farmerModel.find(farmerFilter).lean().exec();

    // Bulk-fetch farms + crops + activities for the scoped farmers
    const farmerIds = farmers.map((f) => f._id?.toString()).filter(Boolean) as string[];
    const farmerStringIds = farmerIds;

    const [farms, crops, activities] = await Promise.all([
      this.farmModel.find({ farmerId: { $in: farmerStringIds }, isDeleted: false }).lean().exec(),
      this.cropModel.find({ farmerId: { $in: farmerStringIds }, isDeleted: false }).lean().exec(),
      this.activityModel
        .find({ farmerId: { $in: farmerStringIds }, isDeleted: false })
        .lean()
        .exec(),
    ]);

    const farmsByFarmer = new Map<string, typeof farms>();
    for (const f of farms) {
      const k = String(f.farmerId);
      if (!farmsByFarmer.has(k)) farmsByFarmer.set(k, []);
      farmsByFarmer.get(k)!.push(f);
    }

    const cropsByFarm = new Map<string, typeof crops>();
    for (const c of crops) {
      const k = String(c.farmId);
      if (!cropsByFarm.has(k)) cropsByFarm.set(k, []);
      cropsByFarm.get(k)!.push(c);
    }

    const activitiesByFarm = new Map<string, typeof activities>();
    for (const a of activities) {
      const k = String(a.farmId);
      if (!activitiesByFarm.has(k)) activitiesByFarm.set(k, []);
      activitiesByFarm.get(k)!.push(a);
    }

    const rows: Array<Record<string, unknown>> = [];
    let farmersInScope = 0;
    let farmersMissingFarm = 0;

    for (const farmer of farmers) {
      const fid = String(farmer._id);
      const farmerFarms = farmsByFarmer.get(fid) ?? [];
      if (farmerFarms.length === 0) {
        farmersMissingFarm++;
        if (filters.includeMissingFarm) {
          farmersInScope++;
          rows.push({
            farmer: {
              id: fid,
              farmerId: farmer.farmerId,
              name: `${farmer.firstName ?? ''} ${farmer.lastName ?? ''}`.trim(),
              association: farmer.isFlowerAgent ? 'FlowerAgent' : farmer.groupAssociation,
              district: farmer.address?.district,
            },
            farm: null,
            crop: null,
            activityRollup: { pending: 0, completed: 0, overdue: 0, total: 0, lastDate: null },
          });
        }
        continue;
      }
      farmersInScope++;
      for (const farm of farmerFarms) {
        const farmIdStr = String(farm._id);
        const farmCrops = cropsByFarm.get(farmIdStr) ?? [];
        const farmActs = activitiesByFarm.get(farmIdStr) ?? [];
        const rollup = aggregateActivities(farmActs as unknown as ActivityDocument[]);

        if (farmCrops.length === 0) {
          rows.push({
            farmer: {
              id: fid,
              farmerId: farmer.farmerId,
              name: `${farmer.firstName ?? ''} ${farmer.lastName ?? ''}`.trim(),
              association: farmer.isFlowerAgent ? 'FlowerAgent' : farmer.groupAssociation,
              district: farmer.address?.district,
            },
            farm: { id: farmIdStr, farmId: farm.farmId, name: farm.farmName, areaAcres: farm.farmArea },
            crop: null,
            activityRollup: rollup,
          });
        } else {
          for (const c of farmCrops) {
            rows.push({
              farmer: {
                id: fid,
                farmerId: farmer.farmerId,
                name: `${farmer.firstName ?? ''} ${farmer.lastName ?? ''}`.trim(),
                association: farmer.isFlowerAgent ? 'FlowerAgent' : farmer.groupAssociation,
                district: farmer.address?.district,
              },
              farm: {
                id: farmIdStr,
                farmId: farm.farmId,
                name: farm.farmName,
                areaAcres: farm.farmArea,
              },
              crop: {
                id: String(c._id),
                cropId: c.cropId,
                name: c.cropName,
                variety: c.cropVariety,
              },
              activityRollup: rollup,
            });
          }
        }
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      ms: Date.now() - started,
      filters,
      totals: {
        farmersAll: farmers.length,
        farmersInScope,
        farmersMissingFarm,
        farms: farms.length,
        crops: crops.length,
      },
      rows,
    };
  }

  async farmerSummary(filters: FarmerSummaryFilters) {
    if (!filters.farmerId) {
      throw new Error('farmerId is required');
    }
    const farmer = await this.farmerModel.findOne({ _id: filters.farmerId }).lean().exec();
    if (!farmer) return null;

    const dateFilter: Record<string, unknown> = {};
    if (filters.from) dateFilter.$gte = new Date(filters.from);
    if (filters.to) dateFilter.$lte = new Date(filters.to);
    const dateScope = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const fid = String(farmer._id);
    const [farms, crops, activities, procurements] = await Promise.all([
      this.farmModel.find({ farmerId: fid, isDeleted: false }).lean().exec(),
      this.cropModel.find({ farmerId: fid, isDeleted: false, ...dateScope }).lean().exec(),
      this.activityModel.find({ farmerId: fid, isDeleted: false, ...dateScope }).lean().exec(),
      this.procModel.find({ farmerId: fid, isDeleted: false, ...dateScope }).lean().exec(),
    ]);

    const totalProcurement = procurements.reduce(
      (sum, p) => (p.status === 'Cancelled' ? sum : sum + p.totalAmount),
      0,
    );
    const totalActivityCost = activities.reduce((sum, a) => sum + (a.totalCost ?? 0), 0);

    return {
      farmer: {
        id: fid,
        farmerId: farmer.farmerId,
        name: `${farmer.firstName ?? ''} ${farmer.lastName ?? ''}`.trim(),
        mobileNumber: farmer.mobileNumber,
        association: farmer.isFlowerAgent ? 'FlowerAgent' : farmer.groupAssociation,
        approvalStatus: farmer.approvalStatus,
        productionPractice: farmer.productionPractice,
        address: farmer.address,
      },
      counts: {
        farms: farms.length,
        crops: crops.length,
        activities: activities.length,
        procurements: procurements.length,
      },
      activityStatus: aggregateActivities(activities as unknown as ActivityDocument[]),
      financials: {
        totalProcurementValue: round2(totalProcurement),
        totalActivityCost: round2(totalActivityCost),
        net: round2(totalProcurement - totalActivityCost),
      },
      crops: crops.map((c) => ({
        cropId: c.cropId,
        name: c.cropName,
        variety: c.cropVariety,
        season: c.season,
        sowingDate: c.sowingDate,
        harvestDate: c.harvestDate,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}

function aggregateActivities(activities: ActivityDocument[]): {
  pending: number;
  completed: number;
  overdue: number;
  cancelled: number;
  total: number;
  lastDate: string | null;
} {
  const out = { pending: 0, completed: 0, overdue: 0, cancelled: 0, total: 0, lastDate: null as string | null };
  let lastTs = 0;
  for (const a of activities) {
    out.total++;
    if (a.status === 'Pending') out.pending++;
    else if (a.status === 'Completed') out.completed++;
    else if (a.status === 'Overdue') out.overdue++;
    else if (a.status === 'Cancelled') out.cancelled++;
    const d = a.completedDate ?? a.scheduledOn ?? a.enteredDate;
    if (d) {
      const t = new Date(d).getTime();
      if (t > lastTs) {
        lastTs = t;
        out.lastDate = new Date(t).toISOString();
      }
    }
  }
  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
