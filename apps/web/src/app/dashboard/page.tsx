import { redirect } from 'next/navigation';
import { api, readAccessToken, ApiError } from '@/lib/api';
import { logoutAction } from '../(auth)/login/actions';

export default async function DashboardPage() {
  const token = await readAccessToken();
  if (!token) redirect('/login');

  try {
    const me = await api.me(token);

    return (
      <main className="min-h-dvh bg-bg">
        <header className="border-b border-border bg-bg-elevated">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              <span className="font-display text-xl tracking-tight text-fg">Nesso</span>
              <span className="ml-2 rounded-full bg-bg-muted px-2 py-0.5 text-xs text-fg-muted">
                {me.role}
              </span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="h-9 rounded-md border border-border-strong px-3 text-sm text-fg transition hover:bg-bg-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="font-display text-4xl tracking-tight text-fg">
            Welcome, {me.firstName ?? me.phone}
          </h1>
          <p className="mt-2 text-base text-fg-muted">
            You're signed in as <code className="font-mono text-sm">{me.phone}</code>. The dashboard
            shell is here — Phase 2 wires the real KPIs, table, map, and feed.
          </p>

          {me.mustChangePassword ? (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
            >
              You're using the bootstrap admin password. Change it before going to production.
            </div>
          ) : null}

          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total farmers', value: '0' },
              { label: 'Total farms', value: '0' },
              { label: 'Active activities', value: '0' },
              { label: 'Pending approvals', value: '0' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm"
              >
                <dt className="text-xs uppercase tracking-wider text-fg-subtle">{s.label}</dt>
                <dd className="mt-1 font-display text-3xl tabular-nums text-fg">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-2xl border border-border bg-bg-muted p-5">
            <p className="font-display text-lg text-fg">Coming next · Phase 2</p>
            <p className="mt-2 text-sm text-fg-muted">
              Farmers list + approval queue + interactive farm map + filter builder. Module specs in
              <code className="ml-1 font-mono text-xs">docs/plan/modules/</code>.
            </p>
          </div>
        </section>
      </main>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login');
    }
    throw err;
  }
}
