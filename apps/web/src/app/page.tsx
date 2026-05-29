import Link from 'next/link';
import { readAccessToken } from '@/lib/api';

export default async function HomePage() {
  const token = await readAccessToken();
  const cta = token
    ? { href: '/dashboard', label: 'Open dashboard' }
    : { href: '/login', label: 'Sign in' };

  return (
    <main className="brand-aurora relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-24">
      <div className="glass relative z-10 mx-auto w-full max-w-2xl rounded-3xl p-10 shadow-lg md:p-14">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong/40 bg-bg-elevated/60 px-3 py-1 text-xs font-medium text-fg-muted backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          Phase 0 · Scaffold ready
        </div>
        <h1 className="font-display text-4xl tracking-tight text-fg md:text-5xl">
          Hello, <span className="text-primary">Nesso</span>.
        </h1>
        <p className="mt-4 text-base text-fg-muted md:text-lg">
          Farm-to-fork traceability — admin dashboard. Built with Next.js 15, React 19, Tailwind,
          shadcn primitives, Framer Motion. Light + dark themes powered by the validated brand
          palette.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={cta.href}
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {cta.label}
          </Link>
          <a
            href="http://localhost:4000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center rounded-md border border-border-strong bg-bg-elevated px-5 text-sm font-medium text-fg transition hover:bg-bg-muted"
          >
            API docs ↗
          </a>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          {[
            { label: 'Mobile', value: 'Expo TS' },
            { label: 'Web', value: 'Next 15' },
            { label: 'Portal', value: 'Next 15' },
            { label: 'API', value: 'NestJS 10' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-bg-elevated/60 p-4 backdrop-blur"
            >
              <dt className="text-xs uppercase tracking-wider text-fg-subtle">{s.label}</dt>
              <dd className="mt-1 font-display text-lg text-fg">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
