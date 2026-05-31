'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Users,
  BookOpen,
  SlidersHorizontal,
  History,
  Building2,
  Leaf,
  Droplet,
  Activity,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Avatar } from '@/components/dashboard/Avatar';
import { StatusPill } from '@/components/dashboard/StatusPill';

const SECTIONS = [
  { key: 'users', label: 'Users & roles', icon: Users },
  { key: 'catalogs', label: 'Catalogs', icon: BookOpen },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { key: 'audit', label: 'Audit log', icon: History },
  { key: 'organization', label: 'Organization', icon: Building2 },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

export default function SettingsPage() {
  const [active, setActive] = useState<SectionKey>('users');

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-8">
      <PageHeader title="Settings" sub="Workspace configuration" />

      <div className="grid items-start gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sub-nav */}
        <nav
          className="flex gap-1 overflow-x-auto lg:flex-col"
          aria-label="Settings sections"
        >
          {SECTIONS.map((s) => {
            const on = active === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                aria-current={on ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm transition ${
                  on
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'font-medium text-fg-muted hover:bg-bg-muted hover:text-fg'
                }`}
              >
                <Icon size={16} />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <div>
          {active === 'users' && <UsersSection />}
          {active === 'catalogs' && <CatalogsSection />}
          {active === 'preferences' && <PreferencesSection />}
          {active === 'audit' && <AuditSection />}
          {active === 'organization' && <OrganizationSection />}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Users & roles ---------------- */

const TEAM = [
  { name: 'Ravi Teja', email: 'ravi@nesso.in', role: 'Field Officer', status: 'active' },
  { name: 'Priya Nair', email: 'priya@nesso.in', role: 'Admin', status: 'active' },
  { name: 'Karan Shah', email: 'karan@nesso.in', role: 'Verifier', status: 'active' },
  { name: 'Meera Iyer', email: 'meera@nesso.in', role: 'Field Officer', status: 'invited' },
] as const;

function UsersSection() {
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-[15px] font-bold text-fg">Team members</h2>
          <p className="mt-0.5 text-xs text-fg-subtle">Staff users managed here</p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
        >
          <Plus size={15} /> Invite
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <tbody className="divide-y divide-border">
            {TEAM.map((u) => (
              <tr key={u.email} className="transition hover:bg-bg-muted/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size={36} />
                    <div>
                      <div className="font-semibold text-fg">{u.name}</div>
                      <div className="text-xs text-fg-subtle">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill kind={u.status === 'active' ? 'approved' : 'pending'}>
                    {u.status === 'active' ? 'Active' : 'Invited'}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---------------- Catalogs ---------------- */

const CATALOGS = [
  { name: 'Crops', count: '12', icon: Leaf },
  { name: 'Inputs', count: '184', icon: Droplet },
  { name: 'Activity types', count: '9', icon: Activity },
  { name: 'Grades', count: '4', icon: CheckCircle2 },
] as const;

function CatalogsSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CATALOGS.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.name}>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} />
              </span>
              <div className="flex-1">
                <div className="font-display text-2xl font-bold text-fg">{c.count}</div>
                <div className="text-sm text-fg-muted">{c.name}</div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
              >
                Manage <ChevronRight size={15} />
              </button>
            </div>
          </Card>
        );
      })}
      <p className="text-sm text-fg-subtle sm:col-span-2">
        Input &amp; POP catalogs are managed here. Changes apply across field apps and reports.
      </p>
    </div>
  );
}

/* ---------------- Preferences ---------------- */

function PreferencesSection() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [notifyApproval, setNotifyApproval] = useState(true);
  const [notifyWeather, setNotifyWeather] = useState(true);
  const [notifySync, setNotifySync] = useState(false);

  return (
    <div className="space-y-4">
      <Card pad={false}>
        <SettingRow label="Theme" hint="Light or dark appearance for this device">
          <div className="inline-flex rounded-lg border border-border bg-bg-elevated p-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                !isDark ? 'bg-primary/10 text-primary' : 'text-fg-muted hover:text-fg'
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isDark ? 'bg-primary/10 text-primary' : 'text-fg-muted hover:text-fg'
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted transition hover:text-fg"
            >
              System
            </button>
          </div>
        </SettingRow>
        <SettingRow label="Language" hint="Interface language" last>
          <select
            defaultValue="en"
            className="h-10 rounded-lg border border-border bg-bg-elevated px-3 text-sm text-fg shadow-sm"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ · Kannada</option>
            <option value="hi">हिन्दी · Hindi</option>
          </select>
        </SettingRow>
      </Card>

      <Card pad={false}>
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="font-display text-[15px] font-bold text-fg">Notifications</h2>
          <p className="mt-0.5 text-xs text-fg-subtle">Choose what reaches your inbox</p>
        </div>
        <Toggle
          label="Approval activity"
          hint="New KYC and farm approvals awaiting review"
          on={notifyApproval}
          onToggle={() => setNotifyApproval((v) => !v)}
        />
        <Toggle
          label="Weather alerts"
          hint="Rain and advisory warnings for mapped farms"
          on={notifyWeather}
          onToggle={() => setNotifyWeather((v) => !v)}
        />
        <Toggle
          label="Sync health"
          hint="Field-app sync failures and queued records"
          on={notifySync}
          onToggle={() => setNotifySync((v) => !v)}
          last
        />
      </Card>
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  onToggle,
  last,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 ${
        last ? '' : 'border-b border-border'
      }`}
    >
      <div>
        <div className="text-sm font-semibold text-fg">{label}</div>
        <div className="mt-0.5 text-xs text-fg-muted">{hint}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          on ? 'bg-primary' : 'bg-border-strong'
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-bg-elevated shadow transition ${
            on ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SettingRow({
  label,
  hint,
  last,
  children,
}: {
  label: string;
  hint?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
        last ? '' : 'border-b border-border'
      }`}
    >
      <div>
        <div className="text-sm font-semibold text-fg">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-fg-muted">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

/* ---------------- Audit log ---------------- */

const AUDIT = [
  { who: 'Priya Nair', what: 'approved FRM-2839', time: '12m' },
  { who: 'Ravi Teja', what: 'logged ACT-1192', time: '1h' },
  { who: 'Karan Shah', what: 'rejected FRM-2836', time: '3h' },
  { who: 'System', what: 'synced 12 records', time: '5h' },
  { who: 'Priya Nair', what: 'invited meera@nesso.in', time: '1d' },
] as const;

function AuditSection() {
  return (
    <Card pad={false}>
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="font-display text-[15px] font-bold text-fg">Recent admin actions</h2>
        <p className="mt-0.5 text-xs text-fg-subtle">A read-only feed of workspace changes</p>
      </div>
      <ul className="divide-y divide-border">
        {AUDIT.map((a, i) => (
          <li key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Avatar name={a.who} size={32} />
            <p className="flex-1 text-sm text-fg">
              <span className="font-semibold">{a.who}</span> {a.what}
            </p>
            <span className="font-mono text-xs text-fg-subtle">{a.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------------- Organization ---------------- */

function OrganizationSection() {
  return (
    <Card>
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 font-display text-xl font-bold text-primary">
          NR
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-fg">NR Group</h2>
          <p className="text-sm text-fg-muted">Hassan, Karnataka · Horticulture</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-5 pt-5 sm:grid-cols-4">
        {[
          ['Plan', 'Enterprise'],
          ['Members', '14'],
          ['Clusters', '3'],
          ['Since', 'Jan 2026'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{k}</dt>
            <dd className="mt-1 font-display text-base font-bold text-fg">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-xs text-fg-subtle">
        Organization details are read-only. Contact your NESSO account manager to make changes.
      </p>
    </Card>
  );
}

/* ---------------- Shared ---------------- */

function Card({
  children,
  pad = true,
}: {
  children: React.ReactNode;
  pad?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm ${
        pad ? 'p-5' : ''
      }`}
    >
      {children}
    </div>
  );
}
