import {
  LayoutGrid,
  CheckCheck,
  Users,
  Map as MapIcon,
  Activity,
  Sprout,
  ShieldCheck,
  ClipboardList,
  Boxes,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Marks the item whose badge is driven by pendingApprovals. */
  badgeKind?: 'approvals';
  /** Optional command-palette keyboard hint. */
  kbd?: string;
}

/**
 * Single flat workspace nav — order matches the Nesso web design spec.
 * Hrefs map to the routes that actually exist in this app:
 *   - Pre-harvest has no dedicated route → maps to /reports.
 *   - Quality → /samples.
 */
export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, kbd: 'G D' },
  { id: 'approvals', href: '/approvals', label: 'Approvals', icon: CheckCheck, badgeKind: 'approvals', kbd: 'G A' },
  { id: 'farmers', href: '/farmers', label: 'Farmers', icon: Users, kbd: 'G F' },
  { id: 'farms', href: '/farms', label: 'Farms', icon: MapIcon },
  { id: 'activities', href: '/activities', label: 'Activities', icon: Activity },
  { id: 'preharvest', href: '/reports', label: 'Pre-harvest', icon: Sprout },
  { id: 'quality', href: '/samples', label: 'Quality', icon: ShieldCheck },
  { id: 'procurement', href: '/procurement', label: 'Procurement', icon: ClipboardList },
  { id: 'inventory', href: '/inventory', label: 'Inventory', icon: Boxes },
  { id: 'reports', href: '/reports', label: 'Reports', icon: FileText, kbd: 'G R' },
];

export const SETTINGS_ITEM: NavItem = {
  id: 'settings',
  href: '/settings',
  label: 'Settings',
  icon: Settings,
};
