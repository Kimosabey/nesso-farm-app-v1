import Link from 'next/link';
import { MapPin, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { PortalHeader, PortalFooter } from '@/components/PortalChrome';
import { ScanCard } from '@/components/ScanCard';

const FEATURES: ReadonlyArray<{ Icon: typeof MapPin; title: string; copy: string }> = [
  {
    Icon: MapPin,
    title: 'Exact origin',
    copy: 'GPS-mapped farm boundary and the farmer who grew it.',
  },
  {
    Icon: Activity,
    title: 'Every activity',
    copy: 'Field-logged spraying, irrigation and harvest — timestamped.',
  },
  {
    Icon: ShieldCheck,
    title: 'Tamper-evident',
    copy: 'Recorded by field officers on the ground, not self-reported.',
  },
];

export default function PortalHomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <AuroraBackground />
      <PortalHeader />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-[1000px] px-4 pb-6 pt-[clamp(40px,8vw,90px)] text-center sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong/60 bg-bg-elevated/60 px-3 py-1 text-[12.5px] font-semibold text-secondary-700 backdrop-blur">
          <span className="size-[7px] rounded-full bg-primary" aria-hidden />
          Verified by Nesso
        </span>

        <h1 className="mx-auto mt-[18px] max-w-[14ch] font-display text-[clamp(34px,7vw,60px)] font-bold leading-[1.05] tracking-[-0.025em]">
          Know exactly where your{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(100deg,#0D783C,#518E6D 55%,#207647)' }}
          >
            flowers grew
          </span>
          .
        </h1>

        <p className="mx-auto mt-[18px] max-w-[54ch] text-[clamp(16px,2vw,19px)] text-fg-muted">
          Scan the QR on any Nesso-verified batch to trace it from the exact farm and farmer,
          through every field activity, to your hand.
        </p>

        {/* Scan card: QR illustration + batch-code input */}
        <ScanCard locale="en" />

        {/* Trust feature cards */}
        <div className="mx-auto mt-[50px] grid max-w-[840px] grid-cols-1 gap-4 min-[680px]:grid-cols-3">
          {FEATURES.map(({ Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-[18px] border border-border bg-bg-elevated p-[22px] text-left shadow-sm"
            >
              <span className="mb-3.5 grid size-[46px] place-items-center rounded-[13px] bg-primary-50 text-primary">
                <Icon className="size-[22px]" aria-hidden />
              </span>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-[13.5px] text-fg-muted">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-9">
          <Link
            href="/en/about"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted transition hover:text-fg"
          >
            Learn how verification works
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <div className="relative z-10 mt-12">
        <PortalFooter />
      </div>
    </div>
  );
}
