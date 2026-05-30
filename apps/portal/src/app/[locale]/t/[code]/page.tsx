import { notFound } from 'next/navigation';

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
  };
  farm?: { farmId?: string; name?: string; areaAcres?: number; practice?: string };
  crop?: { name?: string; variety?: string; sowingDate?: string; harvestDate?: string };
  timeline: Array<{ stage: string; at: string; notes?: string }>;
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

export default async function TracePage({ params }: TracePageProps) {
  const { code } = await params;
  const trace = await fetchTrace(code);
  if (!trace) notFound();

  return (
    <main className="min-h-dvh bg-bg pb-16">
      <header className="brand-aurora">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-strong/40 bg-bg-elevated/60 px-3 py-1 text-xs font-medium text-fg-muted backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Verified by Nesso · {trace.code}
          </div>
          <h1 className="font-display text-4xl tracking-tight text-fg md:text-5xl">
            {trace.product?.name ?? 'Batch'}
            {trace.product?.variant ? (
              <span className="text-fg-muted"> — {trace.product.variant}</span>
            ) : null}
          </h1>
          {trace.batch?.harvestDate ? (
            <p className="mt-2 text-base text-fg-muted">
              Harvested {new Date(trace.batch.harvestDate).toLocaleDateString()}
              {trace.farmer?.district ? ` · ${trace.farmer.district}` : ''}
              {trace.farmer?.state ? `, ${trace.farmer.state}` : ''}
            </p>
          ) : null}
          {trace.scanCount && trace.scanCount > 0 ? (
            <p className="mt-2 text-xs text-fg-subtle">
              Scanned {trace.scanCount} {trace.scanCount === 1 ? 'time' : 'times'}
            </p>
          ) : null}
        </div>
      </header>

      <section className="mx-auto -mt-6 max-w-3xl px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {trace.farmer ? (
            <article className="glass rounded-2xl p-6 shadow-md">
              <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Farmer</h2>
              <p className="mt-2 font-display text-2xl text-fg">
                {trace.farmer.displayName ?? 'Anonymous'}
              </p>
              <p className="text-sm text-fg-muted">
                {[trace.farmer.village, trace.farmer.district, trace.farmer.state]
                  .filter(Boolean)
                  .join(' · ')}
                {trace.farmer.enrolledYear ? ` · since ${trace.farmer.enrolledYear}` : ''}
              </p>
            </article>
          ) : null}

          {trace.farm ? (
            <article className="glass rounded-2xl p-6 shadow-md">
              <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Farm</h2>
              <p className="mt-2 font-display text-2xl text-fg">
                {trace.farm.name ?? trace.farm.farmId}
              </p>
              <p className="text-sm text-fg-muted">
                {trace.farm.areaAcres ? `${trace.farm.areaAcres} acres` : '—'}
                {trace.farm.practice ? ` · ${trace.farm.practice}` : ''}
              </p>
            </article>
          ) : null}
        </div>

        {trace.crop ? (
          <article className="glass mt-4 rounded-2xl p-6 shadow-md">
            <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Crop</h2>
            <p className="mt-2 font-display text-xl text-fg">
              {trace.crop.name}
              {trace.crop.variety ? (
                <span className="text-fg-muted"> · {trace.crop.variety}</span>
              ) : null}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {trace.crop.sowingDate ? (
                <>
                  <dt className="text-fg-subtle">Sown</dt>
                  <dd className="text-right text-fg">
                    {new Date(trace.crop.sowingDate).toLocaleDateString()}
                  </dd>
                </>
              ) : null}
              {trace.crop.harvestDate ? (
                <>
                  <dt className="text-fg-subtle">Harvested</dt>
                  <dd className="text-right text-fg">
                    {new Date(trace.crop.harvestDate).toLocaleDateString()}
                  </dd>
                </>
              ) : null}
            </dl>
          </article>
        ) : null}

        <article className="glass mt-4 rounded-2xl p-6 shadow-md">
          <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Journey</h2>
          {trace.timeline.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">Stage history will appear here.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {trace.timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 inline-block size-2 rounded-full bg-primary" aria-hidden />
                  <div className="flex-1">
                    <p className="font-medium text-fg">{t.stage}</p>
                    <p className="text-sm text-fg-muted">
                      {new Date(t.at).toLocaleString()}
                      {t.notes ? ` · ${t.notes}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        {trace.warehouse?.name ? (
          <article className="glass mt-4 rounded-2xl p-6 shadow-md">
            <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Warehouse</h2>
            <p className="mt-2 font-display text-xl text-fg">{trace.warehouse.name}</p>
            <p className="text-sm text-fg-muted">
              {trace.warehouse.type ?? ''}
              {trace.warehouse.certificationStatus
                ? ` · ${trace.warehouse.certificationStatus}`
                : ''}
            </p>
          </article>
        ) : null}

        {trace.generatedAt ? (
          <p className="mt-8 text-center text-xs text-fg-subtle">
            Snapshot generated {new Date(trace.generatedAt).toLocaleString()}
          </p>
        ) : null}
      </section>
    </main>
  );
}
