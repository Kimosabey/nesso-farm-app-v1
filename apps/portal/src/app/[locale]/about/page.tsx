import Link from 'next/link';
import { ArrowLeft, ScanLine } from 'lucide-react';
import type { Metadata } from 'next';
import { PortalHeader, PortalFooter } from '@/components/PortalChrome';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Nesso — farm-to-fork traceability for Indian horticulture, by NR Group.',
};

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

const STEPS: ReadonlyArray<{ n: string; title: string; copy: string }> = [
  {
    n: '01',
    title: 'Register & map',
    copy: 'Field officers register farmers and map farm boundaries on the ground with GPS.',
  },
  {
    n: '02',
    title: 'Log activities',
    copy: 'Spraying, irrigation and harvest are logged on-site with photos and geotags.',
  },
  {
    n: '03',
    title: 'Grade & sample',
    copy: 'Quality samples are graded by partner labs and recorded against the batch.',
  },
  {
    n: '04',
    title: 'Seal the QR',
    copy: 'Each batch is sealed with a tamper-evident QR linking to this public record.',
  },
];

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PortalHeader locale={locale} />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-fg-muted transition hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>

        <span className="mt-6 inline-flex items-center rounded-full bg-secondary-50 px-3 py-1 text-[12.5px] font-semibold text-secondary-700">
          About Nesso
        </span>
        <h1 className="mt-4 font-display text-[clamp(28px,5vw,42px)] font-bold leading-[1.12] tracking-[-0.02em]">
          Trust, grown in the open.
        </h1>

        <p className="mt-3 text-[17px] leading-relaxed text-fg-muted">
          Nesso is a farm-to-fork traceability platform for Indian horticulture, built by NR Group.
          Every flower batch carries a QR that opens this public record.
        </p>

        <h2 className="mt-8 font-display text-[clamp(20px,3.5vw,26px)] font-bold tracking-[-0.02em]">
          Why it exists
        </h2>
        <p className="mt-3 leading-relaxed text-fg-muted">
          Flower supply chains are opaque — buyers rarely know which farm produced their stock, how
          it was grown, or whether the farmer was paid fairly. Nesso makes the whole chain legible:
          from the GPS-mapped plot, through every field activity, to the warehouse and dispatch.
        </p>

        <h2 className="mt-8 font-display text-[clamp(20px,3.5vw,26px)] font-bold tracking-[-0.02em]">
          How verification works
        </h2>
        <div className="mt-4 space-y-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex gap-4 rounded-[18px] border border-border bg-bg-elevated p-5 shadow-sm"
            >
              <span className="font-mono text-[13px] font-medium text-primary">{s.n}</span>
              <div>
                <h3 className="font-display text-base font-semibold text-fg">{s.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-fg-muted">{s.copy}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 leading-relaxed text-fg-muted">
          Nothing here is self-reported by sellers — it&apos;s recorded by trained officers and
          timestamped.
        </p>

        <h2 className="mt-8 font-display text-[clamp(20px,3.5vw,26px)] font-bold tracking-[-0.02em]">
          Built for the field
        </h2>
        <p className="mt-3 leading-relaxed text-fg-muted">
          The Nesso mobile app works offline-first, in twelve languages, designed to be read in
          sunlight and used through gloves. The dashboard gives FPOs and buyers a real-time view of
          the cluster.
        </p>

        <p className="mt-8 text-[13.5px] text-fg-subtle">
          A product of NR Group — building verified agri supply chains across India.
        </p>

        <div className="mt-7">
          <Link
            href={`/${locale}/t/SAMPLE12`}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-display text-[15px] font-semibold text-primary-fg shadow-md transition hover:bg-primary-700"
          >
            <ScanLine className="size-[18px]" aria-hidden />
            See a live trace
          </Link>
        </div>
      </main>

      <PortalFooter locale={locale} />
    </div>
  );
}
