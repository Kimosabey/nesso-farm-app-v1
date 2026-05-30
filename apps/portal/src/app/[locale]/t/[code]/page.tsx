import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Leaf, FileJson, ArrowRight } from 'lucide-react';
import { JourneyTimeline, type JourneyStage } from '@/components/JourneyTimeline';
import { FarmMap } from '@/components/FarmMap';

interface TracePayload {
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

interface TracePageProps {
  params: Promise<{ locale: string; code: string }>;
}

export const revalidate = 300; // 5 min ISR

async function fetchTrace(code: string): Promise<TracePayload | null> {
  const base =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000/api/v1';
  try {
    const res = await fetch(`${base}/public/trace/${encodeURIComponent(code)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as TracePayload;
  } catch {
    return null;
  }
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name?: string): string {
  if (!name) return '··';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function TracePage({ params }: TracePageProps) {
  const { code, locale } = await params;
  const trace = await fetchTrace(code);
  if (!trace) notFound();

  const cropName = trace.crop?.name ?? trace.product?.name ?? 'Batch';
  const grade = trace.product?.grade;
  const harvested = formatDate(trace.crop?.harvestDate ?? trace.batch?.harvestDate);
  const place = [trace.farmer?.village, trace.farmer?.district, trace.farmer?.state]
    .filter(Boolean)
    .join(', ');

  const subParts = [
    grade ? `Grade ${grade}` : null,
    harvested ? `Harvested ${harvested}` : null,
    place || null,
  ].filter(Boolean);

  const farmerName = trace.farmer?.displayName ?? 'Anonymous';
  const farmerGroup = trace.farmer?.association;
  const farmerLoc = [trace.farmer?.village, trace.farmer?.district].filter(Boolean).join(' · ');
  const farmName = trace.farm?.name ?? trace.farm?.farmId ?? 'Farm';

  return (
    <main className="min-h-dvh bg-bg pb-20">
      <div className="mx-auto max-w-[640px] px-[18px]">
        {/* Hero */}
        <section className="relative mt-2 aspect-[4/3.2] overflow-hidden rounded-[26px] shadow-lg">
          <div className="hero-photo absolute inset-0" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.18] px-3 py-1.5 font-mono text-xs font-medium backdrop-blur">
              <ShieldCheck size={14} strokeWidth={2.2} aria-hidden />
              {trace.code} · verified
            </span>
            <h1 className="font-display font-bold tracking-tight text-[clamp(32px,8vw,48px)] leading-[1.05]">
              {cropName}
            </h1>
            {subParts.length > 0 ? (
              <p className="mt-1.5 text-[15px] opacity-[0.92]">{subParts.join(' · ')}</p>
            ) : null}
          </div>
        </section>

        {/* Verified by Nesso trust card */}
        <div className="holo-shimmer mt-[18px] flex items-center gap-3 rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-primary to-primary-700 text-white">
            <ShieldCheck size={22} strokeWidth={2} aria-hidden />
          </span>
          <div>
            <b className="font-display text-[15px] text-fg">Verified by Nesso</b>
            <p className="text-[12.5px] text-fg-muted">
              This batch&apos;s journey is tamper-evident and traceable to source.
            </p>
          </div>
        </div>

        {/* Journey timeline */}
        <h2 className="mb-3.5 mt-9 text-xs font-bold uppercase tracking-[0.12em] text-secondary-700">
          The journey
        </h2>
        <div className="rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm">
          <JourneyTimeline stages={trace.timeline} />
        </div>

        {/* Farmer card */}
        <h2 className="mb-3.5 mt-9 text-xs font-bold uppercase tracking-[0.12em] text-secondary-700">
          Grown by
        </h2>
        <Link
          href={`/${locale}/farmer/${trace.farmer?.farmerId ?? ''}`}
          className="flex items-center gap-3.5 rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm transition hover:border-border-strong"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/[0.16] font-display text-xl font-bold text-primary ring-2 ring-inset ring-primary/[0.26]">
            {initials(farmerName)}
          </span>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-fg">{farmerName}</h3>
            {farmerLoc || farmerGroup ? (
              <p className="mt-0.5 text-[13px] text-fg-muted">
                {[farmerLoc, farmerGroup].filter(Boolean).join(' · ')}
              </p>
            ) : null}
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-50 px-2.5 py-1 text-[12.5px] font-semibold text-secondary-700">
              <Leaf size={14} strokeWidth={2.2} aria-hidden />
              View farmer profile
              <ArrowRight size={13} strokeWidth={2.2} aria-hidden />
            </span>
          </div>
        </Link>

        {/* Farm card */}
        <h2 className="mb-3.5 mt-9 text-xs font-bold uppercase tracking-[0.12em] text-secondary-700">
          Where it grew
        </h2>
        <Link
          href={`/${locale}/farm/${trace.farm?.farmId ?? ''}`}
          className="block rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm transition hover:border-border-strong"
        >
          <FarmMap />
          <h3 className="mt-3.5 inline-flex items-center gap-1.5 font-display text-lg font-bold text-fg">
            {farmName}
            <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
          </h3>
          <dl className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-4">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">Area</dt>
              <dd className="mt-0.5 text-[15px] font-semibold text-fg">
                {trace.farm?.areaAcres != null ? `${trace.farm.areaAcres} acres` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">Soil</dt>
              <dd className="mt-0.5 text-[15px] font-semibold text-fg">
                {trace.farm?.soil ?? trace.farm?.practice ?? '—'}
              </dd>
            </div>
          </dl>
        </Link>

        {/* Raw JSON link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/raw/${trace.code}`}
            className="inline-flex items-center gap-1.5 font-mono text-[13px] text-fg-subtle transition hover:text-fg"
          >
            <FileJson size={15} strokeWidth={2} aria-hidden />
            View raw trace data
          </Link>
        </div>

        {trace.generatedAt ? (
          <p className="mt-4 text-center font-mono text-[11px] text-fg-subtle">
            Snapshot {new Date(trace.generatedAt).toLocaleString()}
          </p>
        ) : null}
      </div>
    </main>
  );
}
