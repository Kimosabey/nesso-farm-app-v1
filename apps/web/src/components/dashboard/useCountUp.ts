'use client';

import { useEffect, useState } from 'react';

/**
 * Count-up animation (cubic ease-out), 800ms — matches web_viz.jsx `useCount`.
 * Respects prefers-reduced-motion.
 */
export function useCountUp(target: number, dur = 800): number {
  const [v, setV] = useState(0);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setV(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);

  return v;
}
