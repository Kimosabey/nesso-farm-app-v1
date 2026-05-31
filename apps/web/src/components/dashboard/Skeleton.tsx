/**
 * Loading skeletons — token-classed shimmer blocks (auto dark/light).
 * No raw hex; relies on `bg-bg-muted` + `animate-pulse`.
 */

interface SkeletonProps {
  /** Width — number (px) or any CSS length string. */
  w?: number | string;
  /** Height — number (px) or any CSS length string. */
  h?: number | string;
  className?: string;
}

function dim(v?: number | string): string | undefined {
  if (v == null) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

/** A single shimmer block. */
export function Skeleton({ w, h, className = '' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded bg-bg-muted ${className}`}
      style={{ width: dim(w), height: dim(h) }}
    />
  );
}

/** Table placeholder — header bar + N shimmer rows of M columns. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm"
    >
      {/* header bar */}
      <div className="flex items-center gap-4 border-b border-border bg-bg-muted px-3.5 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} h={12} className="flex-1" />
        ))}
      </div>
      {/* rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-3.5 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                h={14}
                className={c === 0 ? 'flex-1' : 'flex-1 opacity-80'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A single card placeholder — title line, body lines, footer pill. */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm ${className}`}
    >
      <Skeleton h={16} w="55%" />
      <div className="mt-4 space-y-2.5">
        <Skeleton h={12} />
        <Skeleton h={12} w="85%" />
        <Skeleton h={12} w="70%" />
      </div>
      <Skeleton h={24} w={96} className="mt-5 rounded-full" />
    </div>
  );
}
