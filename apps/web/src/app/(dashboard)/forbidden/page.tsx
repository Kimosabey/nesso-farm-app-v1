import Link from 'next/link';
import { LayoutGrid, ShieldX } from 'lucide-react';

export const metadata = {
  title: 'No access',
};

export default function ForbiddenPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 py-12 text-center">
      <div className="max-w-md">
        <div className="relative mx-auto mb-6 inline-block">
          <span className="select-none font-display text-[120px] font-bold leading-none tracking-tighter text-bg-muted">
            403
          </span>
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[18px] bg-warning/15 text-warning">
            <ShieldX size={32} />
          </span>
        </div>
        <h1 className="font-display text-[26px] font-bold text-fg">403 · No access</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-fg-muted">
          You don&apos;t have permission to view this page. Ask an admin for access.
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
        >
          <LayoutGrid size={16} /> Back to dashboard
        </Link>
      </div>
    </section>
  );
}
