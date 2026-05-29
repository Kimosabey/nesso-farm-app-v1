import { notFound } from 'next/navigation';

interface TracePageProps {
  params: Promise<{ locale: string; code: string }>;
}

export const revalidate = 300; // 5 min ISR

const MOCK_TIMELINE = [
  { stage: 'Harvested', at: '2026-05-20', place: 'Mysuru, Karnataka' },
  { stage: 'Received', at: '2026-05-21', place: 'Warehouse A' },
  { stage: 'Cleaned', at: '2026-05-21', place: 'Warehouse A' },
  { stage: 'Packed', at: '2026-05-22', place: 'Warehouse A' },
  { stage: 'Dispatched', at: '2026-05-23', place: 'Bengaluru' },
];

export default async function TracePage({ params }: TracePageProps) {
  const { code } = await params;

  // Phase 5 wires this to GET /public/trace/:code
  if (code !== 'SAMPLE12') {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-bg pb-16">
      <header className="brand-aurora">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-strong/40 bg-bg-elevated/60 px-3 py-1 text-xs font-medium text-fg-muted backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Verified by Nesso · {code}
          </div>
          <h1 className="font-display text-4xl tracking-tight text-fg md:text-5xl">
            Tuberose — Hybrid
          </h1>
          <p className="mt-2 text-base text-fg-muted">
            Harvested 20 May 2026 · Mysuru, Karnataka
          </p>
        </div>
      </header>

      <section className="mx-auto -mt-6 max-w-3xl px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="glass rounded-2xl p-6 shadow-md">
            <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Farmer</h2>
            <p className="mt-2 font-display text-2xl text-fg">Ravi K.</p>
            <p className="text-sm text-fg-muted">Village Hosakote · Mysuru, KA · since 2024</p>
          </article>
          <article className="glass rounded-2xl p-6 shadow-md">
            <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Farm</h2>
            <p className="mt-2 font-display text-2xl text-fg">1.2 acres</p>
            <p className="text-sm text-fg-muted">Organic · loamy soil · borewell irrigation</p>
          </article>
        </div>

        <article className="glass mt-4 rounded-2xl p-6 shadow-md">
          <h2 className="text-sm uppercase tracking-wider text-fg-subtle">Journey</h2>
          <ol className="mt-4 space-y-3">
            {MOCK_TIMELINE.map((t) => (
              <li key={t.stage} className="flex items-start gap-3">
                <span className="mt-1 inline-block size-2 rounded-full bg-primary" aria-hidden />
                <div className="flex-1">
                  <p className="font-medium text-fg">{t.stage}</p>
                  <p className="text-sm text-fg-muted">
                    {t.at} · {t.place}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <p className="mt-8 text-center text-xs text-fg-subtle">
          This trace page is a mock — Phase 5 wires it to live data via{' '}
          <code className="rounded bg-bg-muted px-1.5 py-0.5 font-mono text-[11px]">
            GET /public/trace/{code}
          </code>
        </p>
      </section>
    </main>
  );
}
