import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
import type { Metadata } from 'next';
import { fetchTrace, formatDate, titleCase } from '@/lib/trace';
import { FarmMap } from '@/components/FarmMap';
import { PortalHeader, PortalFooter } from '@/components/PortalChrome';

export const revalidate = 300; // 5 min ISR

interface FarmPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ code?: string }>;
}

export const metadata: Metadata = {
  title: 'Farm',
  description: 'A GPS-mapped farm in the Nesso traceability network.',
};

export default async function FarmPage({ params, searchParams }: FarmPageProps) {
  const { locale, id } = await params;
  const { code } = await searchParams;

  // No standalone public farm endpoint exists — derive the public-safe farm
  // card from the trace payload when a trace code is available.
  const trace = code ? await fetchTrace(code) : null;
  const farm = trace?.farm;
  const crop = trace?.crop;
  const farmer = trace?.farmer;

  const farmName = farm?.name ?? farm?.farmId ?? `Farm ${id}`;
  const place = [farmer?.village, farmer?.district, farmer?.state].filter(Boolean).join(', ');
  const backHref = code ? `/${locale}/t/${code}` : '/';

  const meta: Array<{ k: string; v: string }> = [];
  if (farm?.areaAcres != null) meta.push({ k: 'Area', v: `${farm.areaAcres} acres` });
  if (farm?.soil) meta.push({ k: 'Soil', v: titleCase(farm.soil) });
  if (farm?.practice) meta.push({ k: 'Practice', v: titleCase(farm.practice) });
  if (place) meta.push({ k: 'Location', v: place });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PortalHeader locale={locale} />

      <main className="mx-auto max-w-[640px] px-[18px] pb-20 pt-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-fg-muted transition hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {code ? 'Back to trace' : 'Back to home'}
        </Link>

        {/* Map + header card */}
        <div className="mt-4 overflow-hidden rounded-[20px] border border-border bg-bg-elevated shadow-sm">
          <FarmMap height={260} />
          <div className="p-5">
            <h1 className="font-display text-[22px] font-bold tracking-[-0.02em]">{farmName}</h1>
            <p className="mt-0.5 text-[13px] text-fg-muted">
              {[farm?.farmId, place].filter(Boolean).join(' · ') || 'Limited public view'}
            </p>
            {meta.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-4">
                {meta.map((m) => (
                  <div key={m.k}>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
                      {m.k}
                    </dt>
                    <dd className="mt-0.5 text-[15px] font-semibold text-fg">{m.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* Current crops */}
        {crop?.name && (
          <>
            <h2 className="mb-3.5 mt-9 text-xs font-bold uppercase tracking-[0.12em] text-secondary-700">
              Crops grown
            </h2>
            <div className="rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm">
              <div className="flex items-center gap-3.5">
                <span className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                  <Leaf className="size-5" aria-hidden />
                </span>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-fg">{crop.name}</div>
                  <div className="text-[12.5px] text-fg-muted">
                    {[
                      crop.variety,
                      crop.sowingDate ? `sown ${formatDate(crop.sowingDate)}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'In cultivation'}
                  </div>
                </div>
                {crop.harvestDate && (
                  <span className="inline-flex items-center rounded-full bg-secondary-50 px-2.5 py-1 text-[12.5px] font-semibold text-secondary-700">
                    Harvested {formatDate(crop.harvestDate)}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {!trace && (
          <p className="mt-9 text-center text-[13px] text-fg-subtle">
            Open a farm from a verified trace to see its boundary, soil and crops.
          </p>
        )}
      </main>

      <PortalFooter locale={locale} />
    </div>
  );
}
