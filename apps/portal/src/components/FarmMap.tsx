/** Stylized farm-plot map placeholder matching the Nesso QR portal design handoff. */
export function FarmMap({ height = 200 }: { height?: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        height,
        background: 'radial-gradient(120% 90% at 30% 20%, #3a5e3e, #21331f)',
      }}
    >
      {/* Furrow texture */}
      <svg className="absolute inset-0 size-full opacity-35" aria-hidden>
        <defs>
          <pattern
            id="farm-furrows"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(20)"
          >
            <path d="M0 10H40M0 26H40" stroke="#5b8a5f" strokeWidth="5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#farm-furrows)" />
      </svg>
      {/* Plot polygon (accent-yellow fill, green stroke, animated draw) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <polygon
          points="34,26 60,18 70,44 54,62 30,52"
          fill="rgba(241,212,18,0.18)"
          stroke="#F1D412"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          className="polygon-draw"
        />
      </svg>
    </div>
  );
}
