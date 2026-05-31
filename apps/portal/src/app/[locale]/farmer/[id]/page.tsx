import Link from 'next/link';
import { ArrowLeft, Leaf, MapPin, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { fetchTrace, initials, titleCase } from '@/lib/trace';
import { PortalHeader, PortalFooter } from '@/components/PortalChrome';

export const revalidate = 300; // 5 min ISR

interface FarmerPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ code?: string }>;
}

export const metadata: Metadata = {
  title: 'Farmer profile',
  description: 'A verified producer on the Nesso traceability platform.',
};

export default async function FarmerProfilePage({ params, searchParams }: FarmerPageProps) {
  const { locale } = await params;
  const { code } = await searchParams;

  // No standalone public farmer endpoint exists — derive the public-safe
  // profile from the trace payload when a trace code is available.
  const trace = code ? await fetchTrace(code) : null;
  const farmer = trace?.farmer;

  const name = farmer?.displayName ?? 'Verified producer';
  const group = farmer?.association;
  const place = [farmer?.village, farmer?.district, farmer?.state].filter(Boolean).join(', ');
  const enrolled = farmer?.enrolledYear;
  const farm = trace?.farm;
  const crop = trace?.crop;
  const backHref = code ? `/${locale}/t/${code}` : '/';

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

        {/* Header card */}
        <div className="mt-4 flex items-center gap-4 rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm">
          <span className="grid size-[72px] shrink-0 place-items-center rounded-full bg-primary/[0.16] font-display text-[26px] font-bold text-primary ring-2 ring-inset ring-primary/[0.26]">
            {initials(farmer?.displayName)}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">{name}</h1>
            {(place || enrolled) && (
              <p className="mt-0.5 text-sm text-fg-muted">
                {[place, enrolled ? `since ${enrolled}` : null].filter(Boolean).join(' · ')}
              </p>
            )}
            {group && (
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-secondary-50 px-2.5 py-1 text-[12.5px] font-semibold text-secondary-700">
                <Leaf size={14} strokeWidth={2.2} aria-hidden />
                {group} member
              </span>
            )}
          </div>
        </div>

        {/* Verified producer trust line */}
        <div className="mt-3.5 flex items-center gap-2.5 rounded-[16px] border border-border bg-bg-elevated p-4 shadow-sm">
          <ShieldCheck className="size-[18px] shrink-0 text-primary" strokeWidth={2.2} aria-hidden />
          <p className="text-[13px] text-fg-muted">
            Verified producer · registered and mapped on the ground by a Nesso field officer.
          </p>
        </div>

        {/* About / meta */}
        <h2 className="mb-3.5 mt-9 text-xs font-bold uppercase tracking-[0.12em] text-secondary-700">
          About the farmer
        </h2>
        <div className="rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm">
          <p className="text-[14.5px] leading-relaxed text-fg-muted">
            Personal contact details are privacy-redacted and shown only with the farmer&apos;s
            consent. This is a limited public view of a producer in the Nesso network.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-4">
            {group && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
                  Association
                </dt>
                <dd className="mt-0.5 text-[15px] font-semibold text-fg">{group}</dd>
              </div>
            )}
            {place && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
                  Location
                </dt>
                <dd className="mt-0.5 text-[15px] font-semibold text-fg">{place}</dd>
              </div>
            )}
            {crop?.name && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
                  Crops
                </dt>
                <dd className="mt-0.5 text-[15px] font-semibold text-fg">
                  {[crop.name, crop.variety].filter(Boolean).join(' · ')}
                </dd>
              </div>
            )}
            {enrolled && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
                  Enrolled
                </dt>
                <dd className="mt-0.5 text-[15px] font-semibold text-fg">{enrolled}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Farms list (single farm available from trace) */}
        {farm && (farm.name || farm.farmId) && (
          <>
            <h2 className="mb-3.5 mt-9 text-xs font-bold uppercase tracking-[0.12em] text-secondary-700">
              Farms
            </h2>
            <div className="rounded-[20px] border border-border bg-bg-elevated p-5 shadow-sm">
              <Link
                href={`/${locale}/farm/${farm.farmId ?? ''}${code ? `?code=${encodeURIComponent(code)}` : ''}`}
                className="flex items-center gap-3.5"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                  <MapPin className="size-5" aria-hidden />
                </span>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-fg">
                    {farm.name ?? farm.farmId}
                  </div>
                  <div className="text-[12.5px] text-fg-muted">
                    {[
                      crop?.name,
                      farm.areaAcres != null ? `${farm.areaAcres} acres` : null,
                      titleCase(farm.practice),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <span className="text-fg-subtle">→</span>
              </Link>
            </div>
          </>
        )}

        {!trace && (
          <p className="mt-9 text-center text-[13px] text-fg-subtle">
            Open a farmer&apos;s profile from a verified trace to see their farms and crops.
          </p>
        )}
      </main>

      <PortalFooter locale={locale} />
    </div>
  );
}
