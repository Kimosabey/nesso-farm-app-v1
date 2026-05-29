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
};

// --- Token from cookie ---

export async function readAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get('nesso_session')?.value ?? null;
}
