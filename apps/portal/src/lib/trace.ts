import type { JourneyStage } from '@/components/JourneyTimeline';

export interface TracePayload {
  code: string;
  product?: { name: string; variant?: string; grade?: string };
  batch?: { batchId: string; harvestDate?: string; expiryDate?: string };
  farmer?: {
    farmerId?: string;
    displayName?: string;
    village?: string;
    district?: string;
    state?: string;
    enrolledYear?: number;
    association?: string;
  };
  farm?: { farmId?: string; name?: string; areaAcres?: number; practice?: string; soil?: string };
  crop?: { name?: string; variety?: string; sowingDate?: string; harvestDate?: string };
  timeline: JourneyStage[];
  certifications: Array<{ kind: string; agency?: string; validUntil?: string }>;
  warehouse?: { name?: string; type?: string; certificationStatus?: string };
  generatedAt?: string;
  scanCount?: number;
}

/** ISR window shared by every public route (5 min). */
export const TRACE_REVALIDATE = 300;

function apiBase(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000/api/v1'
  );
}

/** Fetch the public trace payload for a code, or null if it isn't a valid trace. */
export async function fetchTrace(code: string): Promise<TracePayload | null> {
  try {
    const res = await fetch(`${apiBase()}/public/trace/${encodeURIComponent(code)}`, {
      next: { revalidate: TRACE_REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as TracePayload;
  } catch {
    return null;
  }
}

export function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function initials(name?: string): string {
  if (!name) return '··';
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '··'
  );
}

export function titleCase(s?: string): string {
  if (!s) return '';
  return s
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
