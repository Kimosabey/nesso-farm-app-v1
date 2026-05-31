import Link from 'next/link';

interface ChromeProps {
  /** Active locale for nav links; defaults to `en`. */
  locale?: string;
}

/** Sticky brand top bar shared across portal routes. */
export function PortalHeader({ locale = 'en' }: ChromeProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/80 px-4 py-3.5 backdrop-blur-md sm:px-8 lg:px-10">
      <Link href="/" className="grid size-8 place-items-center rounded-[9px] bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nesso-logo.jpeg" alt="Nesso" className="size-[22px] rounded-[5px]" />
      </Link>
      <Link href="/" className="font-display text-[15px] font-bold tracking-[0.04em]">
        NESSO
      </Link>
      <nav className="ml-auto flex items-center gap-1">
        <Link
          href="/"
          className="rounded-[9px] px-3 py-2 text-[13.5px] font-semibold text-fg-muted transition hover:bg-bg-muted hover:text-fg"
        >
          Home
        </Link>
        <Link
          href={`/${locale}/about`}
          className="rounded-[9px] px-3 py-2 text-[13.5px] font-semibold text-fg-muted transition hover:bg-bg-muted hover:text-fg"
        >
          About
        </Link>
        <Link
          href={`/${locale}/privacy`}
          className="rounded-[9px] px-3 py-2 text-[13.5px] font-semibold text-fg-muted transition hover:bg-bg-muted hover:text-fg"
        >
          Privacy
        </Link>
      </nav>
    </header>
  );
}

/** Shared footer with NR Group credit + policy links. */
export function PortalFooter({ locale = 'en' }: ChromeProps) {
  return (
    <footer className="border-t border-border px-7 py-8 text-center">
      <p className="text-[12.5px] text-fg-subtle">
        Nesso · NR Group — farm-to-fork traceability
      </p>
      <div className="mt-2 flex justify-center gap-4 text-[12.5px] font-medium">
        <Link href={`/${locale}/about`} className="font-semibold text-primary transition hover:underline">
          About
        </Link>
        <Link
          href={`/${locale}/privacy`}
          className="font-semibold text-primary transition hover:underline"
        >
          Privacy
        </Link>
      </div>
      <p className="mt-2 font-mono text-[11px] text-fg-subtle">© 2026 · nesso.in</p>
    </footer>
  );
}
