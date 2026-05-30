/**
 * API client for the Nesso mobile app.
 * - Token persisted in AsyncStorage (survives app restart).
 * - Writes go through outbox when offline; drained by SyncManager.
 */
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';
import { keychain, type PersistedUser } from '@/storage/keychain';
import { outbox } from '@/db/outbox';

/**
 * Pick the right API base URL for whatever device we're running on.
 *
 * Order of preference:
 *   1. `EXPO_PUBLIC_API_URL` env override — wins always.
 *   2. The IP of the machine that served us the JS bundle, taken from
 *      React Native's own `NativeModules.SourceCode.scriptURL`. This is
 *      the most reliable source: the device just downloaded the bundle
 *      from this address, so it definitely has a network route to it.
 *      Works identically in Expo Go and dev builds.
 *   3. `Constants.expoConfig.hostUri` as a secondary, since it's the
 *      canonical Expo signal even if it doesn't always populate.
 *   4. Platform-specific fallback (emulator loopback or localhost).
 */
function deriveHostFromScriptUrl(): string | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
  if (!scriptURL) return null;
  // e.g. http://192.168.1.4:8081/index.bundle?platform=android&dev=true
  const match = /^https?:\/\/([^/:]+)(?::\d+)?\//.exec(scriptURL);
  return match?.[1] ?? null;
}

function resolveApiBase(): string {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) return override;

  if (Platform.OS === 'web') return 'http://localhost:4000/api/v1';

  const bundleHost = deriveHostFromScriptUrl();
  if (bundleHost) return `http://${bundleHost}:4000/api/v1`;

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { hostUri?: string } | null | undefined)?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:4000/api/v1`;
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api/v1'
    : 'http://localhost:4000/api/v1';
}

const API_BASE = resolveApiBase();

let accessToken: string | null = null;
let isOnline = true;

export function setOnline(value: boolean): void {
  isOnline = value;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

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

export interface MeResponse extends PersistedUser {
  email?: string;
  preferredLanguage?: string;
  mustChangePassword?: boolean;
}

export interface Farmer {
  _id: string;
  farmerId: string;
  firstName: string;
  lastName?: string;
  mobileNumber: string;
  groupAssociation: 'INDEPENDENT' | 'FLOWER_AGENT' | 'FPO';
  isFlowerAgent: boolean;
  address?: {
    state?: string;
    district?: string;
    village?: string;
    pincode?: string;
  };
  productionPractice?: string;
  selectedCrops?: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
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
  };
  productionPractice?: 'Organic' | 'Conventional' | 'NaturalFarming' | 'GAPCertified';
  selectedCrops?: string[];
}

// --- session helpers ---

export async function loadSessionFromStorage(): Promise<MeResponse | null> {
  const token = await keychain.getAccess();
  const user = await keychain.getUser();
  if (token && user) {
    accessToken = token;
    return user;
  }
  return null;
}

export async function setSession(res: AuthSuccess): Promise<void> {
  accessToken = res.accessToken;
  await keychain.setSession({
    accessToken: res.accessToken,
    refreshToken: res.refreshToken,
    user: {
      id: res.user.id,
      phone: res.user.phone,
      role: res.user.role,
      firstName: res.user.firstName,
      lastName: res.user.lastName,
    },
  });
}

export async function clearSession(): Promise<void> {
  accessToken = null;
  await keychain.clear();
}

export function getAccessToken(): string | null {
  return accessToken;
}

// --- low-level fetch ---

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  const parsed: unknown = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const msg =
      parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string'
        ? parsed.message
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
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

// --- public API ---

export const api = {
  async passwordLogin(username: string, password: string): Promise<AuthSuccess> {
    const res = await request<AuthSuccess>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    await setSession(res);
    return res;
  },

  async otpVerify(firebaseIdToken: string): Promise<AuthSuccess> {
    const res = await request<AuthSuccess>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ firebaseIdToken }),
    });
    await setSession(res);
    return res;
  },

  me(): Promise<MeResponse> {
    return request<MeResponse>('/auth/me');
  },

  listFarmers(params: { status?: string; page?: number; pageSize?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.status) qs.set('approvalStatus', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<{
      data: Farmer[];
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }>(`/farmers${suffix}`);
  },

  farmerStats(): Promise<FarmerStats> {
    return request<FarmerStats>('/farmers/stats');
  },

  approveFarmer(id: string, approved: boolean, reason?: string) {
    return request<Farmer>(`/farmers/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved, reason }),
    });
  },

  /**
   * Online → POST /farmers immediately.
   * Offline → enqueue in SQLite outbox; SyncManager will drain.
   */
  async createFarmer(input: CreateFarmerInput): Promise<
    { mode: 'online'; farmer: Farmer } | { mode: 'queued'; outboxId: string }
  > {
    if (isOnline) {
      try {
        const farmer = await request<Farmer>('/farmers', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        return { mode: 'online', farmer };
      } catch (e) {
        // If it's an auth/validation error, propagate up (do NOT queue)
        if (e instanceof ApiError && e.status >= 400 && e.status < 500) throw e;
        // Network-ish error → fall through to queue
      }
    }
    const outboxId = await outbox.enqueue({
      endpoint: '/farmers',
      method: 'POST',
      payload: input as unknown as Record<string, unknown>,
    });
    return { mode: 'queued', outboxId };
  },

  createFarm(input: {
    farmerId: string;
    farmName: string;
    latitude: number;
    longitude: number;
    polygonPoints?: Array<{ lat: number; lng: number }>;
  }): Promise<{ _id: string; farmId: string }> {
    return request('/farms', { method: 'POST', body: JSON.stringify(input) });
  },

  createActivity(input: {
    farmId: string;
    farmerId: string;
    category: string;
    date: string;
    notes?: string;
    labourCount?: number;
    inputUsed?: string;
    weather?: string;
  }): Promise<{ _id: string }> {
    return request('/activities', { method: 'POST', body: JSON.stringify(input) });
  },

  acceptGRN(code: string): Promise<{ ok: boolean; message?: string }> {
    return request('/inventory/grn/accept', { method: 'POST', body: JSON.stringify({ code }) });
  },

  /**
   * Internal: drain a single outbox row. Used by SyncManager.
   */
  async _replay(endpoint: string, method: string, payload: string): Promise<void> {
    await request(endpoint, { method, body: payload });
  },

  async logout(): Promise<void> {
    await clearSession();
  },

  farmerById(id: string): Promise<Farmer> {
    return request<Farmer>(`/farmers/${id}`);
  },
};
