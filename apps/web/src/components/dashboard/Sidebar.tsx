'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  CheckCheck,
  Sprout,
  Activity,
  TestTube,
  ClipboardCheck,
  ShoppingCart,
  Warehouse as WarehouseIcon,
  Boxes,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  pendingApprovals?: number;
}

export function Sidebar({ pendingApprovals = 0 }: SidebarProps) {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      items: [{ href: '/dashboard', label: 'Dashboard', icon: Home }],
    },
    {
      title: 'Onboarding',
      items: [
        { href: '/farmers', label: 'Farmers', icon: Users },
        { href: '/approvals', label: 'Approvals', icon: CheckCheck, badge: pendingApprovals },
        { href: '/farms', label: 'Farms', icon: Sprout },
      ],
    },
    {
      title: 'Operations',
      items: [{ href: '/activities', label: 'Activities', icon: Activity }],
    },
    {
      title: 'Quality',
      items: [
        { href: '/samples', label: 'Samples', icon: TestTube },
        { href: '/audits', label: 'Audits', icon: ClipboardCheck },
      ],
    },
    {
      title: 'Supply chain',
      items: [
        { href: '/procurement', label: 'Procurement', icon: ShoppingCart },
        { href: '/warehouses', label: 'Warehouses', icon: WarehouseIcon },
        { href: '/inventory', label: 'Inventory', icon: Boxes },
      ],
    },
    {
      title: 'Reports & setup',
      items: [
        { href: '/reports', label: 'Reports', icon: FileBarChart },
        { href: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-elevated md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="size-2 rounded-full bg-primary" aria-hidden />
        <span className="font-display text-lg tracking-tight text-fg">Nesso</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, idx) => (
          <div key={idx} className={idx > 0 ? 'mt-5' : ''}>
            {section.title ? (
              <h3 className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-fg-subtle">
                {section.title}
              </h3>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((it) => {
                const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-fg-muted hover:bg-bg-muted hover:text-fg'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden />
                      <span className="flex-1">{it.label}</span>
                      {it.badge && it.badge > 0 ? (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-fg">
                          {it.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border px-5 py-3 text-xs text-fg-subtle">
        v0.0.0 · Phase 4
      </div>
    </aside>
  );
}
