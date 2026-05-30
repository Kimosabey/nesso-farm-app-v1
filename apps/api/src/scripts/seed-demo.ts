/**
 * Demo-data seed for the Nesso farm-to-fork platform.
 *
 * Populates a realistic Karnataka flower-farming dataset (Hassan belt) by
 * booting the Nest application context and driving the EXISTING services, so
 * IDs mint correctly, validation runs, and downstream side-effects (QR mint,
 * notifications) fire the same way they would in production.
 *
 * Idempotent: every demo farmer is tagged with a mobile number in the
 * 98765000XX range. On each run we hard-delete all records linked to that
 * marker (and the warehouses / batches / qr codes / notifications we create)
 * and then recreate a clean set, so re-running always yields the same realistic
 * dataset.
 *
 * Usage:
 *   pnpm --filter @nesso/api seed:demo      (after build)
 *   pnpm --filter @nesso/api seed:all       (admin + catalog + demo)
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { FarmersService } from '../farmers/farmers.service';
import { FarmsService } from '../farms/farms.service';
import { CropsService } from '../crops/crops.service';
import { ActivitiesService } from '../activities/activities.service';
import { SamplesService } from '../samples/samples.service';
import { AuditsService } from '../audits/audits.service';
import { ProcurementService } from '../procurement/procurement.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { InventoryService } from '../inventory/inventory.service';
import { QrService } from '../qr/qr.service';
import { NotificationsService } from '../notifications/notifications.service';

import { Farmer } from '../farmers/schemas/farmer.schema';
import { Farm } from '../farms/schemas/farm.schema';
import { Crop } from '../crops/schemas/crop.schema';
import { Activity } from '../activities/schemas/activity.schema';
import { Sample } from '../samples/schemas/sample.schema';
import { Audit } from '../audits/schemas/audit.schema';
import { Procurement } from '../procurement/schemas/procurement.schema';
import { Warehouse } from '../warehouses/schemas/warehouse.schema';
import { Inventory } from '../inventory/schemas/inventory.schema';
import { QrCode } from '../qr/schemas/qr-code.schema';
import { Notification } from '../notifications/schemas/notification.schema';

/* eslint-disable no-console */

// ---------------------------------------------------------------------------
// Marker + small helpers
// ---------------------------------------------------------------------------

/** All demo farmers get a mobile in this range — our idempotency marker. */
const DEMO_MOBILE_PREFIX = '98765000';
/** Demo warehouses carry this marker in their availableFacility text. */
const DEMO_WH_MARKER = '[demo]';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  return daysAgo(-n);
}
function iso(d: Date): string {
  return d.toISOString();
}
function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

// ---------------------------------------------------------------------------
// Source data
// ---------------------------------------------------------------------------

type Practice = 'Organic' | 'Conventional' | 'NaturalFarming' | 'GAPCertified';
type Assoc = 'INDEPENDENT' | 'FLOWER_AGENT' | 'FPO';
type Approval = 'approved' | 'pending' | 'rejected';

interface FarmerSeed {
  firstName: string;
  lastName: string;
  mobileSuffix: string; // appended to DEMO_MOBILE_PREFIX → 10 digits
  gender: 'M' | 'F';
  taluka: string;
  village: string;
  pincode: string;
  groupAssociation: Assoc;
  isFlowerAgent?: boolean;
  productionPractice: Practice;
  selectedCrops: string[];
  approval: Approval;
  rejectionReason?: string;
  publicTraceConsent?: boolean;
}

const FARMERS: FarmerSeed[] = [
  {
    firstName: 'Lakshmi', lastName: 'Gowda', mobileSuffix: '01', gender: 'F',
    taluka: 'Channarayapatna', village: 'Nuggehalli', pincode: '573116',
    groupAssociation: 'FPO', productionPractice: 'Organic',
    selectedCrops: ['Tuberose', 'Jasmine'], approval: 'approved', publicTraceConsent: true,
  },
  {
    firstName: 'Ravi', lastName: 'Kumar', mobileSuffix: '02', gender: 'M',
    taluka: 'Hassan', village: 'Shantigrama', pincode: '573220',
    groupAssociation: 'INDEPENDENT', productionPractice: 'Conventional',
    selectedCrops: ['Rose', 'Marigold'], approval: 'approved', publicTraceConsent: true,
  },
  {
    firstName: 'Manjunath', lastName: 'Setty', mobileSuffix: '03', gender: 'M',
    taluka: 'Belur', village: 'Halebeedu', pincode: '573121',
    groupAssociation: 'FLOWER_AGENT', isFlowerAgent: true, productionPractice: 'GAPCertified',
    selectedCrops: ['Tuberose', 'Chrysanthemum'], approval: 'approved', publicTraceConsent: true,
  },
  {
    firstName: 'Devamma', lastName: 'M', mobileSuffix: '04', gender: 'F',
    taluka: 'Arsikere', village: 'Gandasi', pincode: '573103',
    groupAssociation: 'FPO', productionPractice: 'NaturalFarming',
    selectedCrops: ['Jasmine', 'Marigold'], approval: 'approved', publicTraceConsent: true,
  },
  {
    firstName: 'Suresh', lastName: 'Hegde', mobileSuffix: '05', gender: 'M',
    taluka: 'Holenarasipura', village: 'Halekote', pincode: '573211',
    groupAssociation: 'INDEPENDENT', productionPractice: 'Organic',
    selectedCrops: ['Rose'], approval: 'approved', publicTraceConsent: true,
  },
  {
    firstName: 'Nagaraj', lastName: 'B', mobileSuffix: '06', gender: 'M',
    taluka: 'Channarayapatna', village: 'Hirisave', pincode: '573116',
    groupAssociation: 'FPO', productionPractice: 'Conventional',
    selectedCrops: ['Marigold', 'Chrysanthemum'], approval: 'approved',
  },
  {
    firstName: 'Shivakumar', lastName: 'Gowda', mobileSuffix: '07', gender: 'M',
    taluka: 'Hassan', village: 'Salagame', pincode: '573201',
    groupAssociation: 'FLOWER_AGENT', isFlowerAgent: true, productionPractice: 'GAPCertified',
    selectedCrops: ['Tuberose', 'Jasmine', 'Rose'], approval: 'approved', publicTraceConsent: true,
  },
  {
    firstName: 'Bhagya', lastName: 'Lakshmi', mobileSuffix: '08', gender: 'F',
    taluka: 'Belur', village: 'Bikkodu', pincode: '573115',
    groupAssociation: 'FPO', productionPractice: 'Organic',
    selectedCrops: ['Jasmine'], approval: 'approved', publicTraceConsent: true,
  },
  {
    firstName: 'Chandrappa', lastName: 'N', mobileSuffix: '09', gender: 'M',
    taluka: 'Arsikere', village: 'Javagal', pincode: '573124',
    groupAssociation: 'INDEPENDENT', productionPractice: 'NaturalFarming',
    selectedCrops: ['Marigold'], approval: 'pending',
  },
  {
    firstName: 'Gangamma', lastName: 'S', mobileSuffix: '10', gender: 'F',
    taluka: 'Holenarasipura', village: 'Hallimysore', pincode: '573211',
    groupAssociation: 'FPO', productionPractice: 'Conventional',
    selectedCrops: ['Tuberose', 'Marigold'], approval: 'pending',
  },
  {
    firstName: 'Yogesh', lastName: 'Rao', mobileSuffix: '11', gender: 'M',
    taluka: 'Hassan', village: 'Dudda', pincode: '573217',
    groupAssociation: 'INDEPENDENT', productionPractice: 'GAPCertified',
    selectedCrops: ['Rose', 'Chrysanthemum'], approval: 'pending',
  },
  {
    firstName: 'Pushpa', lastName: 'Devi', mobileSuffix: '12', gender: 'F',
    taluka: 'Channarayapatna', village: 'Bagur', pincode: '573116',
    groupAssociation: 'FLOWER_AGENT', isFlowerAgent: true, productionPractice: 'Conventional',
    selectedCrops: ['Jasmine', 'Tuberose'], approval: 'rejected',
    rejectionReason: 'Duplicate enrolment — already registered under another FPO',
  },
];

const SOIL_TYPES = ['Red loam', 'Black cotton', 'Sandy loam'];
const WATER_SOURCES = ['Borewell', 'Canal', 'Rain-fed'];
const OWNERSHIP = ['Own', 'Lease', 'Share'];
const FIELD_TYPES = ['Open', 'ShadeNet', 'Greenhouse'];
const ORGANIC_STAGE = ['Certified', 'InTransition', 'Conventional'];
const FARM_NAMES = [
  'North Block', 'Canal Field', 'Hill Plot', 'Temple Side Field', 'South Block',
  'Roadside Plot', 'Well Field', 'East Garden', 'Lower Field', 'Coconut Border Plot',
];

interface FarmSeed {
  farmerIdx: number;
  name: string;
  lat: number;
  lng: number;
  area: number;
}
// 15 farms spread across the approved farmers (indices 0-7).
const FARMS: FarmSeed[] = [
  { farmerIdx: 0, name: 'North Block', lat: 13.005, lng: 76.102, area: 2.5 },
  { farmerIdx: 0, name: 'Canal Field', lat: 13.012, lng: 76.118, area: 1.2 },
  { farmerIdx: 1, name: 'Hill Plot', lat: 13.041, lng: 76.083, area: 3.0 },
  { farmerIdx: 1, name: 'Roadside Plot', lat: 13.035, lng: 76.097, area: 0.8 },
  { farmerIdx: 2, name: 'Temple Side Field', lat: 13.215, lng: 75.965, area: 1.75 },
  { farmerIdx: 2, name: 'East Garden', lat: 13.221, lng: 75.978, area: 2.0 },
  { farmerIdx: 3, name: 'South Block', lat: 13.312, lng: 76.258, area: 4.5 },
  { farmerIdx: 3, name: 'Well Field', lat: 13.305, lng: 76.244, area: 1.0 },
  { farmerIdx: 4, name: 'Lower Field', lat: 12.785, lng: 76.218, area: 2.2 },
  { farmerIdx: 5, name: 'Coconut Border Plot', lat: 13.001, lng: 76.131, area: 0.5 },
  { farmerIdx: 5, name: 'North Block', lat: 13.008, lng: 76.139, area: 1.5 },
  { farmerIdx: 6, name: 'Canal Field', lat: 13.052, lng: 76.066, area: 3.4 },
  { farmerIdx: 6, name: 'Hill Plot', lat: 13.061, lng: 76.071, area: 1.1 },
  { farmerIdx: 7, name: 'Temple Side Field', lat: 13.198, lng: 75.951, area: 2.8 },
  { farmerIdx: 7, name: 'South Block', lat: 13.205, lng: 75.944, area: 0.9 },
];

/** Build a small 5-vertex polygon around a point (offsets ~0.001-0.0025 deg). */
function polygonAround(lat: number, lng: number): Array<{ lat: number; lng: number }> {
  return [
    { lat: lat + 0.0018, lng: lng - 0.0015 },
    { lat: lat + 0.0022, lng: lng + 0.0012 },
    { lat: lat + 0.0004, lng: lng + 0.0021 },
    { lat: lat - 0.0016, lng: lng + 0.0008 },
    { lat: lat - 0.0011, lng: lng - 0.0017 },
  ];
}

interface CropSeed {
  farmIdx: number;
  cropName: string;
  variety: string;
  sownDaysAgo: number;
  harvestInDays: number;
  acre: number;
  practice: 'ORGANIC' | 'CONVENTIONAL';
  season: string;
  multiple?: boolean;
}
const CROPS: CropSeed[] = [
  { farmIdx: 0, cropName: 'Tuberose', variety: 'Hybrid (Phule Rajani)', sownDaysAgo: 85, harvestInDays: 35, acre: 1.5, practice: 'ORGANIC', season: 'Perennial', multiple: true },
  { farmIdx: 1, cropName: 'Jasmine', variety: 'Mysore Mallige', sownDaysAgo: 110, harvestInDays: 20, acre: 1.0, practice: 'ORGANIC', season: 'Perennial', multiple: true },
  { farmIdx: 2, cropName: 'Rose', variety: 'Taj Mahal', sownDaysAgo: 70, harvestInDays: 25, acre: 2.0, practice: 'CONVENTIONAL', season: 'Anytime', multiple: true },
  { farmIdx: 4, cropName: 'Tuberose', variety: 'Single (Shringar)', sownDaysAgo: 95, harvestInDays: 28, acre: 1.0, practice: 'CONVENTIONAL', season: 'Perennial', multiple: true },
  { farmIdx: 6, cropName: 'Marigold', variety: 'African Tall Orange', sownDaysAgo: 60, harvestInDays: 18, acre: 3.0, practice: 'CONVENTIONAL', season: 'Kharif' },
  { farmIdx: 8, cropName: 'Jasmine', variety: 'Sambac (Gundu Mallige)', sownDaysAgo: 120, harvestInDays: 15, acre: 1.5, practice: 'ORGANIC', season: 'Perennial', multiple: true },
  { farmIdx: 9, cropName: 'Rose', variety: 'Gladiator', sownDaysAgo: 80, harvestInDays: 40, acre: 0.5, practice: 'ORGANIC', season: 'Anytime', multiple: true },
  { farmIdx: 11, cropName: 'Marigold', variety: 'French Pusa Narangi', sownDaysAgo: 55, harvestInDays: 22, acre: 2.5, practice: 'CONVENTIONAL', season: 'Kharif' },
  { farmIdx: 13, cropName: 'Tuberose', variety: 'Double (Suvasini)', sownDaysAgo: 90, harvestInDays: 30, acre: 1.8, practice: 'CONVENTIONAL', season: 'Perennial', multiple: true },
  { farmIdx: 5, cropName: 'Chrysanthemum', variety: 'Sevanthige (Yellow)', sownDaysAgo: 50, harvestInDays: 45, acre: 0.5, practice: 'ORGANIC', season: 'Rabi' },
];

interface ActivitySeed {
  cropIdx: number;
  activity: string;
  daysAgo: number;
  status?: 'Pending' | 'Completed';
  labour: number;
  inputs?: Array<{ kind: 'Chemical' | 'Organic' | 'Inventory' | 'Other'; name: string; quantity: number; unit: string; cost: number }>;
  notes: string;
}
const ACTIVITIES: ActivitySeed[] = [
  { cropIdx: 0, activity: 'Land preparation', daysAgo: 88, status: 'Completed', labour: 4, inputs: [{ kind: 'Organic', name: 'Cow dung manure', quantity: 500, unit: 'kg', cost: 4 }], notes: 'Deep ploughing + FYM incorporation' },
  { cropIdx: 0, activity: 'Bulb planting', daysAgo: 85, status: 'Completed', labour: 6, inputs: [{ kind: 'Inventory', name: 'Tuberose bulbs', quantity: 45000, unit: 'nos', cost: 6 }], notes: '30x20 cm spacing' },
  { cropIdx: 0, activity: 'Fertilizer application', daysAgo: 55, status: 'Completed', labour: 2, inputs: [{ kind: 'Chemical', name: 'DAP (18-46-0)', quantity: 100, unit: 'kg', cost: 28 }, { kind: 'Chemical', name: 'MOP (Muriate of potash)', quantity: 80, unit: 'kg', cost: 17 }], notes: 'Basal dose' },
  { cropIdx: 0, activity: 'Spraying (fungicide)', daysAgo: 30, status: 'Completed', labour: 1, inputs: [{ kind: 'Chemical', name: 'Mancozeb 75% WP', quantity: 2, unit: 'kg', cost: 380 }], notes: 'Leaf spot management, 2.5 g/L' },
  { cropIdx: 0, activity: 'Irrigation', daysAgo: 7, status: 'Completed', labour: 1, inputs: [{ kind: 'Other', name: 'Borewell water pump (per hour)', quantity: 4, unit: 'hour', cost: 40 }], notes: 'Drip, 4 hrs' },

  { cropIdx: 1, activity: 'Weeding', daysAgo: 60, status: 'Completed', labour: 5, notes: 'Manual weeding + earthing up' },
  { cropIdx: 1, activity: 'Fertilizer application', daysAgo: 40, status: 'Completed', labour: 2, inputs: [{ kind: 'Chemical', name: 'NPK 19-19-19', quantity: 50, unit: 'kg', cost: 32 }, { kind: 'Organic', name: 'Vermicompost', quantity: 200, unit: 'kg', cost: 10 }], notes: '' },
  { cropIdx: 1, activity: 'Harvest', daysAgo: 3, status: 'Completed', labour: 8, inputs: [{ kind: 'Other', name: 'Daily labor wage', quantity: 8, unit: 'day', cost: 350 }, { kind: 'Inventory', name: 'Harvest crates', quantity: 12, unit: 'nos', cost: 120 }], notes: 'Pre-dawn pick, 18 kg buds' },

  { cropIdx: 2, activity: 'Pruning', daysAgo: 65, status: 'Completed', labour: 4, notes: 'Hard pruning for October bloom' },
  { cropIdx: 2, activity: 'Spraying (insecticide)', daysAgo: 28, status: 'Completed', labour: 1, inputs: [{ kind: 'Chemical', name: 'Chlorpyrifos 20% EC', quantity: 1, unit: 'L', cost: 450 }], notes: 'Thrips control, 2 ml/L' },
  { cropIdx: 2, activity: 'Scouting', daysAgo: 14, status: 'Completed', labour: 1, notes: 'Mild aphid pressure on new shoots' },
  { cropIdx: 2, activity: 'Foliar spray (micronutrient)', daysAgo: 2, status: 'Pending', labour: 1, inputs: [{ kind: 'Chemical', name: 'NPK 19-19-19', quantity: 1, unit: 'kg', cost: 32 }], notes: 'Scheduled — 5 g/L' },

  { cropIdx: 3, activity: 'Fertilizer application', daysAgo: 50, status: 'Completed', labour: 2, inputs: [{ kind: 'Chemical', name: 'Urea (46-0-0)', quantity: 40, unit: 'kg', cost: 6 }], notes: 'Top dressing' },
  { cropIdx: 3, activity: 'Irrigation', daysAgo: 10, status: 'Completed', labour: 1, inputs: [{ kind: 'Other', name: 'Borewell water pump (per hour)', quantity: 3, unit: 'hour', cost: 40 }], notes: '' },
  { cropIdx: 3, activity: 'Scouting', daysAgo: 5, status: 'Completed', labour: 1, notes: 'Healthy crop, good spike emergence' },

  { cropIdx: 4, activity: 'Sowing', daysAgo: 60, status: 'Completed', labour: 3, inputs: [{ kind: 'Inventory', name: 'Marigold seeds', quantity: 250, unit: 'g', cost: 12 }], notes: 'Nursery raised, transplanted' },
  { cropIdx: 4, activity: 'Weeding', daysAgo: 35, status: 'Completed', labour: 6, notes: '' },
  { cropIdx: 4, activity: 'Spraying (fungicide)', daysAgo: 12, status: 'Completed', labour: 1, inputs: [{ kind: 'Chemical', name: 'Mancozeb 75% WP', quantity: 1.5, unit: 'kg', cost: 380 }], notes: 'Preventive' },

  { cropIdx: 5, activity: 'Fertilizer application', daysAgo: 45, status: 'Completed', labour: 2, inputs: [{ kind: 'Organic', name: 'Jeevamrutha', quantity: 200, unit: 'L', cost: 5 }], notes: 'Natural farming input' },
  { cropIdx: 5, activity: 'Harvest', daysAgo: 1, status: 'Completed', labour: 10, inputs: [{ kind: 'Other', name: 'Daily labor wage', quantity: 10, unit: 'day', cost: 350 }], notes: 'First flush, 22 kg' },

  { cropIdx: 6, activity: 'Pruning', daysAgo: 40, status: 'Completed', labour: 3, notes: '' },
  { cropIdx: 6, activity: 'Irrigation', daysAgo: 6, status: 'Completed', labour: 1, inputs: [{ kind: 'Other', name: 'Borewell water pump (per hour)', quantity: 5, unit: 'hour', cost: 40 }], notes: '' },

  { cropIdx: 7, activity: 'Spraying (insecticide)', daysAgo: 20, status: 'Completed', labour: 1, inputs: [{ kind: 'Chemical', name: 'Chlorpyrifos 20% EC', quantity: 0.5, unit: 'L', cost: 450 }], notes: 'Leaf eating caterpillar' },
  { cropIdx: 8, activity: 'Fertilizer application', daysAgo: 33, status: 'Completed', labour: 2, inputs: [{ kind: 'Organic', name: 'Neem cake', quantity: 50, unit: 'kg', cost: 35 }], notes: '' },
  { cropIdx: 9, activity: 'Scouting', daysAgo: 4, status: 'Pending', labour: 1, notes: 'Pinching due next week for branching' },
];

// 6 quality samples; status mix is achieved by walking the transition state machine.
interface SampleSeed {
  farmerIdx: number;
  crop: string;
  variety: string;
  season: string;
  // Forward transitions to walk after creation (creation lands in 'Queue').
  transitions: Array<{ status: 'Sent' | 'Received' | 'Tested' | 'Approved' | 'Rejected'; result?: Record<string, unknown>; notes?: string }>;
  notes?: string;
}
const SAMPLES: SampleSeed[] = [
  { farmerIdx: 0, crop: 'Tuberose', variety: 'Hybrid (Phule Rajani)', season: 'Perennial', notes: 'Pre-procurement MRL screen', transitions: [{ status: 'Sent' }, { status: 'Received' }, { status: 'Tested', result: { residue: 'BDL', moisture: '12%' } }, { status: 'Approved' }] },
  { farmerIdx: 1, crop: 'Jasmine', variety: 'Mysore Mallige', season: 'Perennial', notes: 'Routine batch QC', transitions: [{ status: 'Sent' }, { status: 'Received' }, { status: 'Tested', result: { residue: 'BDL' } }] },
  { farmerIdx: 2, crop: 'Rose', variety: 'Taj Mahal', season: 'Anytime', notes: 'Export consignment', transitions: [{ status: 'Sent' }, { status: 'Received' }] },
  { farmerIdx: 4, crop: 'Tuberose', variety: 'Single (Shringar)', season: 'Perennial', notes: 'New supplier baseline', transitions: [{ status: 'Sent' }] },
  { farmerIdx: 6, crop: 'Marigold', variety: 'African Tall Orange', season: 'Kharif', notes: 'Colour / petal QC', transitions: [] },
  { farmerIdx: 5, crop: 'Rose', variety: 'Gladiator', season: 'Anytime', notes: 'Residue above MRL on suspected sample', transitions: [{ status: 'Sent' }, { status: 'Received' }, { status: 'Tested', result: { residue: 'detected' } }, { status: 'Rejected', notes: 'Chlorpyrifos above MRL' }] },
];

// 4 audits; review (approve/reject) is performed by the admin as reviewer.
interface AuditSeed {
  farmerIdx: number;
  auditType: 'Internal' | 'External' | 'Compliance';
  description: string;
  daysAgo: number;
  review?: { approved: boolean; reason?: string; tags?: string[] };
}
const AUDITS: AuditSeed[] = [
  { farmerIdx: 0, auditType: 'Internal', description: 'Annual organic field inspection — input register, buffer zones, no prohibited inputs found.', daysAgo: 25, review: { approved: true } },
  { farmerIdx: 2, auditType: 'Compliance', description: 'GlobalGAP traceability & record-keeping audit ahead of export.', daysAgo: 18, review: { approved: true } },
  { farmerIdx: 4, auditType: 'External', description: 'Third-party natural-farming verification visit.', daysAgo: 9 },
  { farmerIdx: 5, auditType: 'Internal', description: 'Spot check after sample residue flag — pesticide use review.', daysAgo: 4, review: { approved: false, reason: 'Spray register incomplete; PHI not documented', tags: ['DocumentMissing', 'NonCompliance'] } },
];

interface WarehouseSeed {
  warehouseName: string;
  type: 'Storage' | 'FoodProcessing';
  lat: number;
  lng: number;
  capacity: number;
  certificationStatus: string;
  taluka: string;
  pincode: string;
}
const WAREHOUSES: WarehouseSeed[] = [
  { warehouseName: 'Hassan Central Cold Store', type: 'Storage', lat: 13.0072, lng: 76.0962, capacity: 50000, certificationStatus: 'Certified', taluka: 'Hassan', pincode: '573201' },
  { warehouseName: 'Belur Collection Center', type: 'Storage', lat: 13.1656, lng: 75.8665, capacity: 12000, certificationStatus: 'Conventional', taluka: 'Belur', pincode: '573115' },
];

// 5 procurement records linked to approved farmers. payment describes the
// post-create money flow we replay through recordPayment + transition.
interface ProcurementSeed {
  farmerIdx: number;
  crop: string;
  variety: string;
  quantity: number; // kg
  pricePerUnit: number; // ₹/kg
  daysAgo: number;
  // 'paid' → full payment + Completed, 'partial' → partial payment, 'unpaid' → none.
  payment: 'paid' | 'partial' | 'unpaid';
  complete?: boolean;
  // create a GRN/inventory batch (+ QR) from this procurement.
  grn?: { warehouseIdx: number; grade: string };
}
const PROCUREMENTS: ProcurementSeed[] = [
  { farmerIdx: 0, crop: 'Tuberose', variety: 'Hybrid (Phule Rajani)', quantity: 320, pricePerUnit: 65, daysAgo: 6, payment: 'paid', complete: true, grn: { warehouseIdx: 0, grade: 'A' } },
  { farmerIdx: 1, crop: 'Jasmine', variety: 'Mysore Mallige', quantity: 48, pricePerUnit: 480, daysAgo: 3, payment: 'partial', complete: true, grn: { warehouseIdx: 0, grade: 'Export' } },
  { farmerIdx: 6, crop: 'Marigold', variety: 'African Tall Orange', quantity: 540, pricePerUnit: 28, daysAgo: 10, payment: 'paid', complete: true },
  { farmerIdx: 2, crop: 'Rose', variety: 'Taj Mahal', quantity: 120, pricePerUnit: 90, daysAgo: 2, payment: 'unpaid' },
  { farmerIdx: 5, crop: 'Rose', variety: 'Gladiator', quantity: 75, pricePerUnit: 110, daysAgo: 1, payment: 'partial', grn: { warehouseIdx: 1, grade: 'B' } },
];

interface NotificationSeed {
  kind: 'weather' | 'activityReminder' | 'approval' | 'sync' | 'system';
  title: string;
  body: string;
}
const NOTIFICATIONS: NotificationSeed[] = [
  { kind: 'approval', title: '3 farmers awaiting approval', body: 'Chandrappa N, Gangamma S and Yogesh Rao have completed onboarding and need review.' },
  { kind: 'weather', title: 'Weather advisory — Hassan', body: 'Light to moderate rain expected over the next 48h. Hold off on fungicide sprays.' },
  { kind: 'activityReminder', title: 'Foliar spray due', body: 'Rose (Taj Mahal) at Temple Side Field — micronutrient foliar spray scheduled today.' },
  { kind: 'system', title: 'Sample NES-S residue flag', body: 'A Rose (Gladiator) sample exceeded MRL and was rejected. A spot audit has been raised.' },
  { kind: 'sync', title: 'Mobile sync complete', body: '24 field activities synced from the agent app outbox.' },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { abortOnError: false });

  const config = app.get(ConfigService);
  const users = app.get(UsersService);
  const farmersSvc = app.get(FarmersService);
  const farmsSvc = app.get(FarmsService);
  const cropsSvc = app.get(CropsService);
  const activitiesSvc = app.get(ActivitiesService);
  const samplesSvc = app.get(SamplesService);
  const auditsSvc = app.get(AuditsService);
  const procurementSvc = app.get(ProcurementService);
  const warehousesSvc = app.get(WarehousesService);
  const inventorySvc = app.get(InventoryService);
  const qrSvc = app.get(QrService);
  const notificationsSvc = app.get(NotificationsService);

  // Direct model handles for the idempotent cleanup pass.
  const farmerModel = app.get<Model<any>>(getModelToken(Farmer.name));
  const farmModel = app.get<Model<any>>(getModelToken(Farm.name));
  const cropModel = app.get<Model<any>>(getModelToken(Crop.name));
  const activityModel = app.get<Model<any>>(getModelToken(Activity.name));
  const sampleModel = app.get<Model<any>>(getModelToken(Sample.name));
  const auditModel = app.get<Model<any>>(getModelToken(Audit.name));
  const procurementModel = app.get<Model<any>>(getModelToken(Procurement.name));
  const warehouseModel = app.get<Model<any>>(getModelToken(Warehouse.name));
  const inventoryModel = app.get<Model<any>>(getModelToken(Inventory.name));
  const qrModel = app.get<Model<any>>(getModelToken(QrCode.name));
  const notificationModel = app.get<Model<any>>(getModelToken(Notification.name));

  // --- Resolve the admin user (actor for created records) --------------------
  const adminPhone = config.get<string>('BOOTSTRAP_ADMIN_PHONE');
  if (!adminPhone) {
    console.error('BOOTSTRAP_ADMIN_PHONE must be set in .env (run seed:admin first).');
    await app.close();
    process.exit(1);
  }
  const admin = await users.findByPhone(adminPhone);
  if (!admin) {
    console.error(`No admin user found for ${adminPhone}. Run seed:admin first.`);
    await app.close();
    process.exit(1);
  }
  const adminId = admin._id!.toString();
  console.log(`Using admin ${adminPhone} (${adminId}) as actor.\n`);

  // --- Idempotent cleanup ----------------------------------------------------
  const mobileRe = new RegExp(`^${DEMO_MOBILE_PREFIX}\\d{2}$`);
  const existingDemoFarmers = await farmerModel
    .find({ mobileNumber: mobileRe })
    .select({ _id: 1 })
    .lean()
    .exec();

  if (existingDemoFarmers.length > 0) {
    console.log(`Found ${existingDemoFarmers.length} existing demo farmers — cleaning prior demo data...`);
    const demoFarmerIds: string[] = existingDemoFarmers.map((f: any) => f._id.toString());

    // Procurements → linked inventory batches → linked QR codes
    const demoProcs = await procurementModel
      .find({ farmerId: { $in: demoFarmerIds } })
      .select({ _id: 1 })
      .lean()
      .exec();
    const demoProcIds: string[] = demoProcs.map((p: any) => p._id.toString());
    const demoBatches = await inventoryModel
      .find({ linkedProcurementId: { $in: demoProcIds } })
      .select({ batchId: 1 })
      .lean()
      .exec();
    const demoBatchIds: string[] = demoBatches.map((b: any) => b.batchId);

    if (demoBatchIds.length > 0) {
      await qrModel.deleteMany({ batchId: { $in: demoBatchIds } }).exec();
      await inventoryModel.deleteMany({ batchId: { $in: demoBatchIds } }).exec();
    }
    await procurementModel.deleteMany({ farmerId: { $in: demoFarmerIds } }).exec();
    await sampleModel.deleteMany({ farmerId: { $in: demoFarmerIds } }).exec();
    await auditModel.deleteMany({ farmerId: { $in: demoFarmerIds } }).exec();
    await activityModel.deleteMany({ farmerId: { $in: demoFarmerIds } }).exec();
    await cropModel.deleteMany({ farmerId: { $in: demoFarmerIds } }).exec();
    await farmModel.deleteMany({ farmerId: { $in: demoFarmerIds } }).exec();
    await farmerModel.deleteMany({ _id: { $in: demoFarmerIds } }).exec();

    // Demo warehouses (tagged) + any orphaned batches/qr from them
    const demoWarehouses = await warehouseModel
      .find({ availableFacility: new RegExp(escapeRegex(DEMO_WH_MARKER)) })
      .select({ _id: 1 })
      .lean()
      .exec();
    const demoWhIds: string[] = demoWarehouses.map((w: any) => w._id.toString());
    if (demoWhIds.length > 0) {
      const orphanBatches = await inventoryModel
        .find({ warehouseId: { $in: demoWhIds } })
        .select({ batchId: 1 })
        .lean()
        .exec();
      const orphanBatchIds: string[] = orphanBatches.map((b: any) => b.batchId);
      if (orphanBatchIds.length > 0) {
        await qrModel.deleteMany({ batchId: { $in: orphanBatchIds } }).exec();
        await inventoryModel.deleteMany({ batchId: { $in: orphanBatchIds } }).exec();
      }
      await warehouseModel.deleteMany({ _id: { $in: demoWhIds } }).exec();
    }

    // Demo notifications for the admin (tagged in data.demo)
    await notificationModel.deleteMany({ userId: adminId, 'data.demo': true }).exec();
    console.log('Cleanup complete.\n');
  } else {
    console.log('No prior demo data found — seeding fresh.\n');
  }

  // --- Counters --------------------------------------------------------------
  const counts = {
    farmers: 0, farms: 0, crops: 0, activities: 0, samples: 0,
    audits: 0, warehouses: 0, procurements: 0, batches: 0, qr: 0, notifications: 0,
  };

  // --- Farmers ---------------------------------------------------------------
  const farmerIds: string[] = []; // Mongo _id, indexed by FARMERS position
  const farmerNames: string[] = [];
  const farmerAssoc: string[] = [];
  for (const f of FARMERS) {
    const doc = await farmersSvc.create(
      {
        firstName: f.firstName,
        lastName: f.lastName,
        mobileNumber: `${DEMO_MOBILE_PREFIX}${f.mobileSuffix}`,
        gender: f.gender,
        groupAssociation: f.groupAssociation,
        isFlowerAgent: f.isFlowerAgent ?? false,
        productionPractice: f.productionPractice,
        selectedCrops: f.selectedCrops,
        publicTraceConsent: f.publicTraceConsent ?? false,
        preferredLanguage: 'kn',
        address: {
          state: 'Karnataka',
          district: 'Hassan',
          taluka: f.taluka,
          village: f.village,
          pincode: f.pincode,
        },
      },
      adminId,
    );
    const id = doc._id!.toString();

    if (f.approval === 'approved') {
      await farmersSvc.approve(id, { approved: true }, adminId);
    } else if (f.approval === 'rejected') {
      await farmersSvc.approve(id, { approved: false, reason: f.rejectionReason }, adminId);
    }
    // 'pending' → leave as created.

    farmerIds.push(id);
    farmerNames.push(`${f.firstName} ${f.lastName}`.trim());
    farmerAssoc.push(f.groupAssociation);
    counts.farmers++;
  }
  console.log(`✓ ${counts.farmers} farmers`);

  // --- Farms -----------------------------------------------------------------
  const farmIds: string[] = []; // indexed by FARMS position
  for (let i = 0; i < FARMS.length; i++) {
    const fs = FARMS[i];
    const farmerId = farmerIds[fs.farmerIdx];
    const farmerSeed = FARMERS[fs.farmerIdx];
    const organicStage =
      farmerSeed.productionPractice === 'Organic' ? 'Certified'
        : farmerSeed.productionPractice === 'GAPCertified' ? 'InTransition'
          : pick(ORGANIC_STAGE, i);
    const doc = await farmsSvc.create({
      farmerId,
      farmName: fs.name,
      surveyNumber: `${(i % 9) + 21}/${(i % 4) + 1}`,
      farmArea: fs.area,
      growingArea: Math.round(fs.area * 0.85 * 100) / 100,
      organicStage,
      waterSource: pick(WATER_SOURCES, i),
      soilType: pick(SOIL_TYPES, i),
      ownership: pick(OWNERSHIP, i),
      fieldType: pick(FIELD_TYPES, i),
      latitude: fs.lat,
      longitude: fs.lng,
      polygonPoints: polygonAround(fs.lat, fs.lng),
      address: {
        state: 'Karnataka',
        district: 'Hassan',
        taluka: farmerSeed.taluka,
        village: farmerSeed.village,
        pincode: farmerSeed.pincode,
      },
    });
    farmIds.push(doc._id!.toString());
    counts.farms++;
  }
  console.log(`✓ ${counts.farms} farms`);

  // --- Crops -----------------------------------------------------------------
  const cropIds: string[] = []; // indexed by CROPS position
  const cropFarmerIdx: number[] = [];
  for (const c of CROPS) {
    const farmId = farmIds[c.farmIdx];
    const farmerIdx = FARMS[c.farmIdx].farmerIdx;
    const farmerId = farmerIds[farmerIdx];
    const doc = await cropsSvc.create({
      farmId,
      farmerId,
      cropName: c.cropName,
      cropVariety: c.variety,
      cropType: 'Main',
      unit: 'kg',
      acre: c.acre,
      mappedAcre: c.acre,
      estHarvest: Math.round(c.acre * 1800),
      waterType: 'IRRIGATION',
      method: c.cropName === 'Marigold' || c.cropName === 'Chrysanthemum' ? 'SOWING' : 'PLANTING',
      practice: c.practice,
      sowingDate: iso(daysAgo(c.sownDaysAgo)),
      harvestDate: iso(daysFromNow(c.harvestInDays)),
      multipleHarvest: c.multiple ?? false,
      season: c.season as any,
    });
    cropIds.push(doc._id!.toString());
    cropFarmerIdx.push(farmerIdx);
    counts.crops++;
  }
  console.log(`✓ ${counts.crops} crops`);

  // --- Activities ------------------------------------------------------------
  for (const a of ACTIVITIES) {
    const farmIdx = CROPS[a.cropIdx].farmIdx;
    const farmId = farmIds[farmIdx];
    const farmerId = farmerIds[FARMS[farmIdx].farmerIdx];
    const cropId = cropIds[a.cropIdx];
    const when = daysAgo(a.daysAgo);
    const completed = (a.status ?? 'Completed') === 'Completed';
    const labourInput = {
      kind: 'Other' as const,
      name: 'Daily labor wage',
      quantity: a.labour,
      unit: 'day',
      cost: 350,
    };
    const inputs = a.inputs ? [...a.inputs] : [];
    // Add labour as an input only if the activity didn't already list it.
    if (!inputs.some((i) => i.name === 'Daily labor wage')) inputs.push(labourInput);

    await activitiesSvc.create({
      farmId,
      farmerId,
      cropId,
      activity: a.activity,
      scheduledOn: iso(when),
      completedDate: completed ? iso(when) : undefined,
      status: a.status ?? 'Completed',
      inputs,
      notes: a.notes || undefined,
      clientRequestId: `demo-act-${a.cropIdx}-${a.activity}-${a.daysAgo}`.replace(/\s+/g, '_'),
    });
    counts.activities++;
  }
  console.log(`✓ ${counts.activities} activities`);

  // --- Samples ---------------------------------------------------------------
  for (const s of SAMPLES) {
    const farmerId = farmerIds[s.farmerIdx];
    const doc = await samplesSvc.create(
      {
        farmerId,
        farmerName: farmerNames[s.farmerIdx],
        association: farmerAssoc[s.farmerIdx],
        crop: s.crop,
        variety: s.variety,
        season: s.season as any,
        notes: s.notes,
      },
      adminId,
    );
    let id = doc._id!.toString();
    for (const t of s.transitions) {
      const updated = await samplesSvc.transition(id, {
        status: t.status,
        result: t.result,
        notes: t.notes,
      });
      id = updated._id!.toString();
    }
    counts.samples++;
  }
  console.log(`✓ ${counts.samples} samples`);

  // --- Audits ----------------------------------------------------------------
  // The admin creates the audit, but separation-of-duties forbids the creator
  // from reviewing it. So we review as a distinct reviewer id — a synthetic
  // demo reviewer id is fine, it's only stored as a string reference.
  const reviewerId = `demo-reviewer-${adminId.slice(-6)}`;
  for (const a of AUDITS) {
    const farmerId = farmerIds[a.farmerIdx];
    const doc = await auditsSvc.create(
      {
        farmerId,
        farmerName: farmerNames[a.farmerIdx],
        association: farmerAssoc[a.farmerIdx],
        auditType: a.auditType,
        description: a.description,
        auditDate: iso(daysAgo(a.daysAgo)),
      },
      adminId,
    );
    if (a.review) {
      await auditsSvc.review(
        doc._id!.toString(),
        { approved: a.review.approved, reason: a.review.reason, tags: a.review.tags },
        reviewerId,
      );
    }
    counts.audits++;
  }
  console.log(`✓ ${counts.audits} audits`);

  // --- Warehouses ------------------------------------------------------------
  const warehouseIds: string[] = []; // indexed by WAREHOUSES position
  for (const w of WAREHOUSES) {
    const doc = await warehousesSvc.create({
      warehouseName: w.warehouseName,
      type: w.type,
      availableFacility: `${DEMO_WH_MARKER} Cold storage, grading & packing`,
      ownership: 'Own',
      capacity: w.capacity,
      totalArea: Math.round(w.capacity / 20),
      certificationStatus: w.certificationStatus,
      latitude: w.lat,
      longitude: w.lng,
      address: {
        country: 'India',
        state: 'Karnataka',
        district: 'Hassan',
        taluka: w.taluka,
        pincode: w.pincode,
      },
    });
    warehouseIds.push(doc._id!.toString());
    counts.warehouses++;
  }
  console.log(`✓ ${counts.warehouses} warehouses`);

  // --- Procurement (+ payments, transitions, GRN/batch/QR) -------------------
  const qrCodes: string[] = [];
  for (const p of PROCUREMENTS) {
    const farmerId = farmerIds[p.farmerIdx];
    const proc = await procurementSvc.create({
      farmerId,
      farmerName: farmerNames[p.farmerIdx],
      association: farmerAssoc[p.farmerIdx],
      crop: p.crop,
      variety: p.variety,
      quantity: p.quantity,
      pricePerUnit: p.pricePerUnit,
      unit: 'kg',
      procurementDate: iso(daysAgo(p.daysAgo)),
    });
    const procId = proc._id!.toString();
    const total = proc.totalAmount;

    if (p.payment === 'paid') {
      await procurementSvc.recordPayment(procId, {
        amount: total,
        date: iso(daysAgo(Math.max(0, p.daysAgo - 1))),
        method: 'Bank',
        referenceNo: `UTR${100000 + counts.procurements}`,
      });
    } else if (p.payment === 'partial') {
      await procurementSvc.recordPayment(procId, {
        amount: Math.round(total * 0.5 * 100) / 100,
        date: iso(daysAgo(Math.max(0, p.daysAgo - 1))),
        method: 'UPI',
        referenceNo: `UPI${200000 + counts.procurements}`,
      });
    }
    if (p.complete) {
      await procurementSvc.transition(procId, { status: 'Completed' });
    }
    counts.procurements++;

    // Optional GRN → inventory batch (+ auto-minted QR)
    if (p.grn) {
      try {
        const batch = await inventorySvc.acceptGrn(
          {
            procurementId: procId,
            warehouseId: warehouseIds[p.grn.warehouseIdx],
            quantity: p.quantity,
            grade: p.grn.grade,
            unit: 'kg',
            type: 'RawMaterial',
            expiryDate: iso(daysFromNow(7)),
          },
          adminId,
        );
        counts.batches++;
        if (batch.qrCode) {
          qrCodes.push(batch.qrCode);
          counts.qr++;
        } else {
          // acceptGrn mints QR best-effort; re-read to confirm.
          const qr = await qrSvc.findByBatchId(batch.batchId);
          if (qr) {
            qrCodes.push(qr.code);
            counts.qr++;
          }
        }
      } catch (e) {
        console.warn(`[procurement] GRN failed for ${procId}:`, e instanceof Error ? e.message : e);
      }
    }
  }
  console.log(`✓ ${counts.procurements} procurements, ${counts.batches} inventory batches, ${counts.qr} QR codes`);

  // --- Notifications (for the admin) -----------------------------------------
  for (const n of NOTIFICATIONS) {
    await notificationsSvc.create({
      userId: adminId,
      kind: n.kind,
      title: n.title,
      body: n.body,
      data: { demo: true },
    });
    counts.notifications++;
  }
  console.log(`✓ ${counts.notifications} notifications`);

  // --- Summary ---------------------------------------------------------------
  console.log('\n=========================================================');
  console.log(
    `✓ Seeded ${counts.farmers} farmers, ${counts.farms} farms, ${counts.crops} crops, ` +
      `${counts.activities} activities, ${counts.samples} samples, ${counts.audits} audits, ` +
      `${counts.warehouses} warehouses, ${counts.procurements} procurements, ` +
      `${counts.batches} inventory batches, ${counts.qr} QR codes, ${counts.notifications} notifications.`,
  );
  if (qrCodes.length > 0) {
    console.log('\nPublic trace codes (open /public/trace/:code on the portal):');
    for (const c of qrCodes) console.log(`  • ${c}`);
  }
  console.log('=========================================================');

  await app.close();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
