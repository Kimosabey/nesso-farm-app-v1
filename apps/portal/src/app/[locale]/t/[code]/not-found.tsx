import Link from 'next/link';
import { ScanLine } from 'lucide-react';
import { PortalHeader, PortalFooter } from '@/components/PortalChrome';

export default function TraceNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <PortalHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 items-center px-[18px]">
        <div className="mx-auto max-w-[400px] py-20 text-center">
          <div className="relative inline-block">
            <span className="font-display text-[110px] font-bold leading-none text-bg-muted">?</span>
            <span className="absolute left-1/2 top-1/2 grid size-[60px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[18px] bg-primary-50 text-primary">
              <ScanLine className="size-7" aria-hidden />
            </span>
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em]">
            This trace code isn&apos;t valid
          </h1>
          <p className="mt-2.5 text-[15px] text-fg-muted">
            This QR code isn&apos;t a valid Nesso trace, or the batch was removed. Check the label
            and scan again.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-xl border border-border-strong bg-bg-elevated px-6 font-display text-[15px] font-semibold text-fg transition hover:bg-bg-muted"
            >
              Go home
            </Link>
            <Link
              href="/en/t/SAMPLE12"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-display text-[15px] font-semibold text-primary-fg shadow-md transition hover:bg-primary-700"
            >
              <ScanLine className="size-[18px]" aria-hidden />
              Try sample trace
            </Link>
          </div>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
