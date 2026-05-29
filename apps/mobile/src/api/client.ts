/**
 * Minimal API client for the Nesso mobile app.
 * No axios for v0 — fetch is enough and saves bundle size.
 * Phase 2 swaps the in-memory token for MMKV persistence.
 */

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000/api/v1'; // 10.0.2.2 = Android emulator localhost

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string | null, refresh: string | null): void {
  accessToken = access;
  refreshToken = refresh;
}

export function getAccessToken(): string | null {
  return accessToken;
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

export interface MeResponse {
  id: string;
  phone: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
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

export const api = {
  async passwordLogin(username: string, password: string): Promise<AuthSuccess> {
    const res = await request<AuthSuccess>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },
  me(): Promise<MeResponse> {
    return request<MeResponse>('/auth/me');
  },
  logout(): void {
    setTokens(null, null);
  },
};
