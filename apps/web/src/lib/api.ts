/**
 * Typed fetch helper for the Nesso API.
 * Server-side use only (reads HttpOnly cookies).
 */
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
  cache?: RequestCache;
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache ?? 'no-store',
  });

  const text = await res.text();
  const parsed: unknown = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const msg =
      (parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string'
        ? parsed.message
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, parsed);
  }
  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// --- Auth helpers ---

export interface AuthSuccess {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    phone: string;
    role: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mustChangePassword: boolean;
  };
}

export interface MeResponse {
  id: string;
  phone: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  preferredLanguage: string;
  lastLoginAt?: string;
  mustChangePassword: boolean;
}

// --- Farmer types ---

export interface Farmer {
  _id: string;
  farmerId: string;
  firstName: string;
  lastName?: string;
  mobileNumber: string;
  gender?: 'M' | 'F' | 'Other';
  groupAssociation: 'INDEPENDENT' | 'FLOWER_AGENT' | 'FPO';
  isFlowerAgent: boolean;
  address?: {
    state?: string;
    district?: string;
    taluka?: string;
    village?: string;
    pincode?: string;
    line1?: string;
  };
  selectedCrops?: string[];
  productionPractice?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectionReason?: string;
  publicTraceConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerPage {
  data: Farmer[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FarmerStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface CreateFarmerInput {
  firstName: string;
  lastName?: string;
  mobileNumber: string;
  gender?: 'M' | 'F' | 'Other';
  groupAssociation?: 'INDEPENDENT' | 'FLOWER_AGENT' | 'FPO';
  isFlowerAgent?: boolean;
  address?: {
    state?: string;
    district?: string;
    village?: string;
    pincode?: string;
    line1?: string;
  };
  selectedCrops?: string[];
  productionPractice?: 'Organic' | 'Conventional' | 'NaturalFarming' | 'GAPCertified';
}

export const api = {
  passwordLogin(username: string, password: string) {
    return apiFetch<AuthSuccess>('/auth/password', {
      method: 'POST',
      body: { username, password },
    });
  },
  me(token: string) {
    return apiFetch<MeResponse>('/auth/me', { token });
  },
  listFarmers(
    token: string,
    params: {
      page?: number;
      pageSize?: number;
      q?: string;
      approvalStatus?: string;
      association?: string;
    } = {},
  ) {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.q) qs.set('q', params.q);
    if (params.approvalStatus) qs.set('approvalStatus', params.approvalStatus);
    if (params.association) qs.set('association', params.association);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<FarmerPage>(`/farmers${suffix}`, { token });
  },
  getFarmerStats(token: string) {
    return apiFetch<FarmerStats>('/farmers/stats', { token });
  },
  getFarmer(token: string, id: string) {
    return apiFetch<Farmer>(`/farmers/${id}`, { token });
  },
  createFarmer(token: string, input: CreateFarmerInput) {
    return apiFetch<Farmer>('/farmers', { token, method: 'POST', body: input });
  },
  approveFarmer(token: string, id: string, approved: boolean, reason?: string) {
    return apiFetch<Farmer>(`/farmers/${id}/approve`, {
      token,
      method: 'POST',
      body: { approved, reason },
    });
  },
  deleteFarmer(token: string, id: string) {
    return apiFetch<{ ok: true }>(`/farmers/${id}`, { token, method: 'DELETE' });
  },

  // --- Farms ---
  listFarms(token: string, params: { farmerId?: string; page?: number; pageSize?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.farmerId) qs.set('farmerId', params.farmerId);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<FarmPage>(`/farms${suffix}`, { token });
  },
  createFarm(token: string, input: CreateFarmInput) {
    return apiFetch<Farm>('/farms', { token, method: 'POST', body: input });
  },

  // --- Crops ---
  listCrops(token: string, params: { farmerId?: string; farmId?: string; year?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.farmerId) qs.set('farmerId', params.farmerId);
    if (params.farmId) qs.set('farmId', params.farmId);
    if (params.year) qs.set('year', String(params.year));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<CropPage>(`/crops${suffix}`, { token });
  },
  createCrop(token: string, input: CreateCropInput) {
    return apiFetch<Crop>('/crops', { token, method: 'POST', body: input });
  },

  // --- Activities ---
  listActivities(
    token: string,
    params: {
      farmerId?: string;
      farmId?: string;
      cropId?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const qs = new URLSearchParams();
    if (params.farmerId) qs.set('farmerId', params.farmerId);
    if (params.farmId) qs.set('farmId', params.farmId);
    if (params.cropId) qs.set('cropId', params.cropId);
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<ActivityPage>(`/activities${suffix}`, { token });
  },
  getActivityStats(token: string) {
    return apiFetch<Record<string, number>>('/activities/stats', { token });
  },
  createActivity(token: string, input: CreateActivityInput) {
    return apiFetch<Activity>('/activities', { token, method: 'POST', body: input });
  },

  // --- Catalog ---
  listInputs(token: string, params: { kind?: string; q?: string; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.kind) qs.set('kind', params.kind);
    if (params.q) qs.set('q', params.q);
    if (params.limit) qs.set('limit', String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<InputCatalogItem[]>(`/catalog/inputs${suffix}`, { token });
  },

  // --- Samples ---
  listSamples(
    token: string,
    params: { status?: string; page?: number; pageSize?: number } = {},
  ) {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<SamplePage>(`/samples${suffix}`, { token });
  },
  getSampleStats(token: string) {
    return apiFetch<Record<string, number>>('/samples/stats', { token });
  },

  // --- Audits ---
  listAudits(
    token: string,
    params: { status?: string; auditType?: string; page?: number; pageSize?: number } = {},
  ) {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.auditType) qs.set('auditType', params.auditType);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<AuditPage>(`/audits${suffix}`, { token });
  },
  getAuditStats(token: string) {
    return apiFetch<Record<string, number>>('/audits/stats', { token });
  },

  // --- Procurement ---
  listProcurement(
    token: string,
    params: { status?: string; page?: number; pageSize?: number } = {},
  ) {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<ProcurementPage>(`/procurement${suffix}`, { token });
  },
  getProcurementStats(token: string) {
    return apiFetch<{ total: number; pending: number; completed: number; totalValue: number }>(
      '/procurement/stats',
      { token },
    );
  },

  // --- Warehouses ---
  listWarehouses(token: string, params: { type?: string; page?: number; pageSize?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<WarehousePage>(`/warehouses${suffix}`, { token });
  },

  // --- Reports ---
  preHarvestReport(
    token: string,
    params: {
      approvalStatus?: string;
      includeFlowerAgents?: boolean;
      includeMissingFarm?: boolean;
    } = {},
  ) {
    const qs = new URLSearchParams();
    if (params.approvalStatus) qs.set('approvalStatus', params.approvalStatus);
    if (params.includeFlowerAgents === false) qs.set('includeFlowerAgents', 'false');
    if (params.includeMissingFarm) qs.set('includeMissingFarm', 'true');
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<PreHarvestReport>(`/reports/pre-harvest${suffix}`, { token });
  },
  farmerSummary(token: string, params: { farmerId: string; from?: string; to?: string }) {
    const qs = new URLSearchParams({ farmerId: params.farmerId });
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    return apiFetch<FarmerSummary>(`/reports/farmer-summary?${qs.toString()}`, { token });
  },

  // --- Notifications ---
  listNotifications(token: string, params: { page?: number; pageSize?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<NotificationInbox>(`/notifications${suffix}`, { token });
  },
  markNotificationRead(token: string, id: string) {
    return apiFetch<void>(`/notifications/${id}/read`, { token, method: 'PATCH' });
  },
  markAllNotificationsRead(token: string) {
    return apiFetch<{ updated: number }>('/notifications/read-all', {
      token,
      method: 'PATCH',
    });
  },

  // --- Inventory ---
  listInventory(
    token: string,
    params: { status?: string; warehouseId?: string; page?: number; pageSize?: number } = {},
  ) {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.warehouseId) qs.set('warehouseId', params.warehouseId);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<InventoryPage>(`/inventory${suffix}`, { token });
  },
  getInventoryStats(token: string) {
    return apiFetch<{
      total: number;
      available: number;
      processing: number;
      sold: number;
      transferred: number;
    }>('/inventory/stats', { token });
  },
};

// --- Phase 4 types ---

export interface Sample {
  _id: string;
  sampleCode: string;
  farmerId: string;
  farmerName?: string;
  association?: string;
  crop: string;
  variety: string;
  season?: string;
  status: 'Queue' | 'Sent' | 'Received' | 'Tested' | 'Approved' | 'Rejected';
  sentDate?: string;
  receivedDate?: string;
  testedDate?: string;
  notes?: string;
  createdAt: string;
}
export interface SamplePage {
  data: Sample[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Audit {
  _id: string;
  farmerId: string;
  farmerName?: string;
  association?: string;
  auditType: 'Internal' | 'External' | 'Compliance';
  description: string;
  remarks?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  auditDate: string;
  reviewedAt?: string;
  rejectionReason?: string;
  rejectionTags?: string[];
  createdAt: string;
}
export interface AuditPage {
  data: Audit[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Procurement {
  _id: string;
  procurementId: string;
  farmerId: string;
  farmerName?: string;
  crop: string;
  variety?: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  unit: 'kg' | 'quintal';
  procurementDate: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  linkedBatchId?: string;
  createdAt: string;
}
export interface ProcurementPage {
  data: Procurement[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Warehouse {
  _id: string;
  warehouseName: string;
  type: 'Storage' | 'FoodProcessing';
  ownership: 'Own' | 'Leased';
  capacity: number;
  totalArea: number;
  certificationStatus: string;
  certifyingAgency?: string;
  primaryContact?: { name?: string; mobileNumber?: string; email?: string };
  address?: { state?: string; district?: string; city?: string; pincode?: string };
  createdAt: string;
}
export interface WarehousePage {
  data: Warehouse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface InventoryBatch {
  _id: string;
  batchId: string;
  productName: string;
  variant?: string;
  grade?: string;
  supplier?: string;
  warehouseId?: string;
  warehouseName?: string;
  type: 'RawMaterial' | 'SemiProcessed' | 'FinishedGood';
  currentStage: string;
  status: 'AVAILABLE' | 'PROCESSING' | 'SOLD' | 'TRANSFERRED';
  quantity: number;
  unit: string;
  incomingDate: string;
  expiryDate?: string;
  qrCode?: string;
  stageHistory: Array<{ stage: string; at: string; by?: string; notes?: string }>;
  createdAt: string;
}
export interface InventoryPage {
  data: InventoryBatch[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// --- Farm types ---

export interface Farm {
  _id: string;
  farmId: string;
  farmerId: string;
  farmName: string;
  surveyNumber?: string;
  farmArea: number;
  growingArea: number;
  organicStage: string;
  location: { type: 'Point'; coordinates: [number, number] };
  address?: { state?: string; district?: string; village?: string; pincode?: string };
  status: 'active' | 'archived';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FarmPage {
  data: Farm[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateFarmInput {
  farmerId: string;
  farmName: string;
  surveyNumber?: string;
  farmArea: number;
  growingArea?: number;
  organicStage?: 'Certified' | 'InTransition' | 'Conventional';
  latitude: number;
  longitude: number;
  address?: { state?: string; district?: string; village?: string; pincode?: string };
}

// --- Crop types ---

export interface Crop {
  _id: string;
  cropId: string;
  farmId: string;
  farmerId: string;
  cropName: string;
  cropVariety?: string;
  cropType: 'Main' | 'Inter' | 'Border';
  unit: string;
  acre: number;
  estHarvest: number;
  practice: string;
  season: string;
  sowingDate?: string;
  harvestDate?: string;
  year?: number;
  createdAt: string;
}

export interface CropPage {
  data: Crop[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateCropInput {
  farmId: string;
  farmerId: string;
  cropName: string;
  cropVariety?: string;
  cropType?: 'Main' | 'Inter' | 'Border';
  unit?: 'kg' | 'quintal' | 'tonne' | 'nos';
  acre?: number;
  estHarvest?: number;
  practice?: 'CONVENTIONAL' | 'ORGANIC';
  season?: 'Kharif' | 'Rabi' | 'Summer' | 'Perennial' | 'Anytime' | 'All';
  sowingDate?: string;
  harvestDate?: string;
}

// --- Activity types ---

export interface ActivityInput {
  kind: 'Chemical' | 'Organic' | 'Inventory' | 'Other';
  itemId?: string;
  name: string;
  quantity: number;
  unit?: string;
  cost?: number;
}

export interface Activity {
  _id: string;
  farmId: string;
  farmerId: string;
  cropId?: string;
  activity: string;
  scheduledOn?: string;
  completedDate?: string;
  enteredDate: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  inputs: ActivityInput[];
  totalCost: number;
  notes?: string;
  photos?: string[];
  createdAt: string;
}

export interface ActivityPage {
  data: Activity[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateActivityInput {
  farmId: string;
  farmerId: string;
  cropId?: string;
  activity: string;
  scheduledOn?: string;
  completedDate?: string;
  status?: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  inputs?: ActivityInput[];
  notes?: string;
  clientRequestId?: string;
}

// --- Catalog types ---

export interface InputCatalogItem {
  _id: string;
  code: string;
  name: string;
  kind: 'Chemical' | 'Organic' | 'Inventory' | 'Other';
  unit: string;
  defaultCost: number;
}

// --- Reports types ---

export interface PreHarvestReport {
  generatedAt: string;
  ms: number;
  filters: Record<string, unknown>;
  totals: {
    farmersAll: number;
    farmersInScope: number;
    farmersMissingFarm: number;
    farms: number;
    crops: number;
  };
  rows: Array<{
    farmer: {
      id: string;
      farmerId: string;
      name: string;
      association?: string;
      district?: string;
    };
    farm: { id: string; farmId: string; name: string; areaAcres: number } | null;
    crop: { id: string; cropId: string; name: string; variety?: string } | null;
    activityRollup: {
      pending: number;
      completed: number;
      overdue: number;
      cancelled?: number;
      total: number;
      lastDate: string | null;
    };
  }>;
}

export interface FarmerSummary {
  farmer: {
    id: string;
    farmerId: string;
    name: string;
    mobileNumber: string;
    association: string;
    approvalStatus: string;
    productionPractice?: string;
    address?: Farmer['address'];
  };
  counts: { farms: number; crops: number; activities: number; procurements: number };
  activityStatus: {
    pending: number;
    completed: number;
    overdue: number;
    cancelled: number;
    total: number;
    lastDate: string | null;
  };
  financials: { totalProcurementValue: number; totalActivityCost: number; net: number };
  crops: Array<{
    cropId: string;
    name: string;
    variety?: string;
    season?: string;
    sowingDate?: string;
    harvestDate?: string;
  }>;
  generatedAt: string;
}

// --- Notifications types ---

export interface NotificationItem {
  _id: string;
  userId: string;
  kind: 'weather' | 'activityReminder' | 'approval' | 'sync' | 'system';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  channel: 'push' | 'inApp' | 'sms';
  createdAt: string;
  readAt?: string;
}

export interface NotificationInbox {
  data: NotificationItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unread: number;
}

// --- Token from cookie ---

export async function readAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get('nesso_session')?.value ?? null;
}
