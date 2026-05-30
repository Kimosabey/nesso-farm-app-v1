'use client';

/**
 * Styled mini-map placeholder — terrain texture, a farm polygon, clustered
 * markers + zoom controls. SVG-only (no Leaflet) to avoid SSR pain.
 * Matches web_viz.jsx `MiniMap`.
 */
export function MiniMap() {
  const clusters: Array<[number, number, number]> = [
    [28, 42, 12],
    [52, 30, 28],
    [68, 58, 7],
    [42, 68, 16],
    [80, 40, 5],
  ];

  return (
    <div
      className="relative h-full min-h-[220px] w-full overflow-hidden rounded-2xl"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in oklab, #518E6D 22%, rgb(var(--bg-muted))), rgb(var(--bg-muted)))',
      }}
    >
      {/* terrain texture */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-50" aria-hidden>
        <defs>
          <pattern id="mm-contour" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M0 30 Q30 10 60 30 M0 50 Q30 30 60 50"
              fill="none"
              stroke="rgb(var(--border-strong))"
              strokeWidth="1"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mm-contour)" />
        <path
          d="M0 60 Q 300 50, 550 62 T 1000 58"
          fill="none"
          stroke="#0E7490"
          strokeWidth="3"
          opacity="0.4"
        />
      </svg>

      {/* farm polygon */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <polygon
          points="44,22 60,18 66,34 56,44 40,38"
          fill="color-mix(in oklab, #0D783C 22%, transparent)"
          stroke="#0D783C"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 2 }}
        />
      </svg>

      {/* clustered markers */}
      {clusters.map(([x, y, n], i) => {
        const big = n > 10;
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className="grid place-items-center rounded-full border-[2.5px] bg-primary font-bold text-primary-fg shadow-md"
              style={{
                width: big ? 38 : 28,
                height: big ? 38 : 28,
                fontSize: big ? 13 : 11,
                borderColor: 'rgb(var(--bg-elevated))',
              }}
            >
              {n}
            </div>
          </div>
        );
      })}

      {/* zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-[10px] shadow-md">
        <button
          type="button"
          className="grid h-[34px] w-[34px] place-items-center border-b border-border bg-bg-elevated text-lg text-fg"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="grid h-[34px] w-[34px] place-items-center bg-bg-elevated text-lg text-fg"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );
}
