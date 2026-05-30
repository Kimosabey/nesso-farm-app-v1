import Link from 'next/link';
import { Activity, ArrowUpRight, LayoutGrid, MapPin, ShieldCheck } from 'lucide-react';
import { readAccessToken } from '@/lib/api';
import { AuroraBackground } from '@/components/landing/aurora-background';

const STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '1,284', label: 'Farmers' },
  { value: '942', label: 'Farms mapped' },
  { value: '5', label: 'Talukas' },
  { value: '100%', label: 'Traceable' },
];

const PREVIEW_KPIS: ReadonlyArray<{ label: string; value: string; tone: string }> = [
  { label: 'Farmers', value: '1,284', tone: '#0D783C' },
  { label: 'Farms', value: '942', tone: '#3C6B51' },
  { label: 'Active crops', value: '376', tone: '#0E7490' },
  { label: 'Pending', value: '23', tone: '#9A8407' },
];

const FEATURES: ReadonlyArray<{
  Icon: typeof MapPin;
  title: string;
  copy: string;
}> = [
  {
    Icon: MapPin,
    title: 'Exact origin',
    copy: 'Every farm mapped to its GPS polygon — know precisely where each flower grew.',
  },
  {
    Icon: Activity,
    title: 'Every activity',
    copy: 'Sprays, irrigation, harvest — the full cultivation log, tamper-evident.',
  },
  {
    Icon: ShieldCheck,
    title: 'Provable trust',
    copy: 'Scan any batch QR to trace it back to the farmer and the field.',
  },
];

export default async function HomePage() {
  const token = await readAccessToken();
  const cta = token
    ? { href: '/dashboard', label: 'Open dashboard' }
    : { href: '/login', label: 'Sign in to dashboard' };

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-fg">
      <AuroraBackground />

      {/* Top bar */}
      <header className="relative z-10 flex items-center gap-3 px-4 py-[18px] sm:px-8 lg:px-14">
        <span className="grid size-9 place-items-center rounded-[10px] bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nesso-logo.jpeg" alt="Nesso" className="size-[26px] rounded-[6px]" />
        </span>
        <span className="font-display text-[17px] font-bold tracking-[0.04em]">NESSO</span>
        <nav className="ml-6 hidden items-center gap-1 sm:flex">
          {['Platform', 'Traceability', 'Pricing', 'About'].map((n) => (
            <a
              key={n}
              href="#"
              className="rounded-[9px] px-3 py-2 text-[13.5px] font-semibold text-fg-muted transition hover:bg-bg-muted"
            >
              {n}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <a
            href="http://localhost:4000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 items-center rounded-[11px] border border-border-strong bg-bg-elevated px-4 text-[13.5px] font-semibold text-fg transition hover:bg-bg-muted sm:inline-flex"
          >
            API docs ↗
          </a>
          <Link
            href={cta.href}
            className="inline-flex h-10 items-center rounded-[11px] bg-primary px-4 text-[13.5px] font-semibold text-primary-fg shadow-sm transition hover:bg-primary-700"
          >
            {token ? 'Open dashboard' : 'Sign in'}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-[1000px] px-4 pb-6 pt-9 text-center sm:px-8 sm:pb-12 sm:pt-[86px]">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong/60 bg-bg-elevated/60 px-3 py-1 font-mono text-[12.5px] font-medium uppercase tracking-[0.14em] text-primary backdrop-blur">
          <span className="size-[7px] rounded-full bg-primary" aria-hidden />
          Verified farming OS
        </span>

        <h1 className="mx-auto mt-[18px] max-w-[15ch] font-display text-[clamp(34px,6.5vw,60px)] font-bold leading-[1.05] tracking-[-0.025em]">
          The operating system for{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(100deg,#0D783C,#518E6D 55%,#207647)',
            }}
          >
            verified farming
          </span>
          .
        </h1>

        <p className="mx-auto mt-5 max-w-[54ch] text-[clamp(16px,2vw,19px)] text-fg-muted">
          Register farmers, map farms, log every field activity, and prove provenance with a public
          QR trace — built for FPOs, agribusinesses and their field teams.
        </p>

        <div className="mt-[30px] flex flex-wrap justify-center gap-3">
          <Link
            href={cta.href}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-fg shadow-md transition hover:bg-primary-700"
          >
            {cta.label}
            <ArrowUpRight className="size-[18px]" aria-hidden />
          </Link>
          <a
            href="#contact"
            className="inline-flex h-12 items-center rounded-xl border border-border-strong bg-bg-elevated px-6 text-[15px] font-semibold text-fg transition hover:bg-bg-muted"
          >
            Book a demo
          </a>
        </div>

        <div className="mt-[30px] flex flex-wrap justify-center gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-[14px] border border-border bg-bg-elevated/80 px-5 py-3 shadow-sm backdrop-blur"
            >
              <div className="font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums">
                {s.value}
              </div>
              <div className="text-xs text-fg-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Product preview window */}
      <section className="relative z-10 mx-auto max-w-[980px] px-4 sm:px-8">
        <div className="overflow-hidden rounded-[18px] border border-border bg-bg-elevated shadow-lg">
          <div className="flex h-[38px] items-center gap-[7px] border-b border-border bg-bg-muted px-3.5">
            {['#FF6058', '#FFBD2E', '#28CA42'].map((c) => (
              <span
                key={c}
                className="size-[11px] rounded-full opacity-85"
                style={{ background: c }}
              />
            ))}
            <span className="ml-3 font-mono text-[11.5px] text-fg-subtle">app.nesso.in</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-[18px] sm:grid-cols-4">
            {PREVIEW_KPIS.map((k) => (
              <div key={k.label} className="rounded-xl bg-bg-muted p-3.5">
                <span
                  className="grid size-[30px] place-items-center rounded-[9px]"
                  style={{
                    color: k.tone,
                    background: `color-mix(in oklab, ${k.tone} 16%, rgb(var(--bg-elevated)))`,
                  }}
                >
                  <LayoutGrid className="size-4" aria-hidden />
                </span>
                <div className="mt-2.5 font-display text-2xl font-bold tracking-[-0.02em] tabular-nums">
                  {k.value}
                </div>
                <div className="text-xs text-fg-muted">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features + CTA band */}
      <section className="relative z-10 mx-auto max-w-[1000px] px-4 py-12 sm:px-8 sm:py-[72px]">
        <div className="grid grid-cols-1 gap-4 min-[680px]:grid-cols-3">
          {FEATURES.map(({ Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-[18px] border border-border bg-bg-elevated p-6 shadow-sm"
            >
              <span className="mb-4 grid size-[46px] place-items-center rounded-[13px] bg-primary-50 text-primary">
                <Icon className="size-[22px]" aria-hidden />
              </span>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-[7px] text-[13.5px] text-fg-muted">{copy}</p>
            </div>
          ))}
        </div>

        <div id="contact" className="mt-10 scroll-mt-24 text-center">
          <h2 className="font-display text-[clamp(22px,3.4vw,30px)] font-bold">
            Ready to scale verified farming?
          </h2>
          <p className="mt-2 text-[15px] text-fg-muted">
            Field officers use the mobile app with OTP. Staff &amp; admins sign in here.
          </p>
          <div className="mt-5">
            <Link
              href={cta.href}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-fg shadow-md transition hover:bg-primary-700"
            >
              {cta.label}
              <ArrowUpRight className="size-[18px]" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-7 py-7 text-center">
        <p className="font-mono text-[12.5px] text-fg-subtle">
          © 2026 NESSO · NR Group — farm-to-fork traceability
        </p>
        <div className="mt-2 flex justify-center gap-4 text-[12.5px] font-medium text-fg-muted">
          <a href="#" className="transition hover:text-fg">
            About
          </a>
          <a href="#" className="transition hover:text-fg">
            Privacy
          </a>
        </div>
        <p className="mt-2 font-mono text-[11px] text-fg-subtle">
          Developed by Harshan Aiyappa
        </p>
      </footer>
    </div>
  );
}
