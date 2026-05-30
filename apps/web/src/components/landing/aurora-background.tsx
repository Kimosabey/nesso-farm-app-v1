/**
 * Aurora hero backdrop — three animated blur blobs behind the landing content.
 * Pure CSS keyframes (see globals.css). Decorative only.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <span className="aurora-blob aurora-blob-1" />
      <span className="aurora-blob aurora-blob-2" />
      <span className="aurora-blob aurora-blob-3" />
    </div>
  );
}
