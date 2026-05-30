/**
 * Initials avatar — deterministic tint from the name.
 * Matches the WAvatar look in the web design handoff.
 */
const TINTS = [
  'bg-primary/10 text-primary',
  'bg-secondary-100 text-secondary-700',
  'bg-accent/20 text-fg',
  'bg-info/10 text-info',
  'bg-warning/15 text-warning',
] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function tintFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length]!;
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold ${tintFor(name)}`}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.38)) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
