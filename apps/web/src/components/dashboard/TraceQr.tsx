/**
 * Stylized inline-SVG QR placeholder. Deterministically renders a QR-like
 * matrix from the trace code (with the three finder squares) so previews look
 * real without pulling in a QR dependency. Not a scannable code — the canonical
 * trace link is always shown alongside it.
 */
export function TraceQr({ code, size = 168 }: { code: string; size?: number }) {
  const seed = hash(code);
  const grid = 16;
  const cell = 100 / grid;
  const cells: { x: number; y: number }[] = [];

  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const finder =
        (x < 3 && y < 3) || (x > grid - 4 && y < 3) || (x < 3 && y > grid - 4);
      const on = finder || (x * 5 + y * 11 + x * y * 3 + seed) % 3 === 0;
      if (on) cells.push({ x, y });
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR placeholder for ${code}`}
    >
      <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x * cell}
          y={c.y * cell}
          width={cell}
          height={cell}
          fill="#0F1A14"
        />
      ))}
    </svg>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 7;
}

/** Derive the public trace code from a batch id (e.g. BATCH-TBR-0291 → TBR0291). */
export function traceCodeFromBatch(batchId: string): string {
  return batchId.replace(/^BATCH-/i, '').replace(/-/g, '');
}
