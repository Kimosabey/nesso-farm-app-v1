'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Check,
  Sprout,
  Scissors,
  FlaskConical,
  Warehouse,
  Truck,
  QrCode,
  MapPin,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';

export interface JourneyStage {
  stage: string;
  at: string;
  notes?: string;
}

/** Map a stage key to a sensible icon + human label. */
function stageMeta(stage: string): { Icon: LucideIcon; label: string } {
  const key = stage.toLowerCase();
  if (key.includes('regist')) return { Icon: ClipboardCheck, label: 'Registered' };
  if (key.includes('map')) return { Icon: MapPin, label: 'Mapped' };
  if (key.includes('plant') || key.includes('sow') || key.includes('grow') || key.includes('grew'))
    return { Icon: Sprout, label: titleCase(stage) };
  if (key.includes('harvest')) return { Icon: Scissors, label: 'Harvested' };
  if (key.includes('sampl') || key.includes('qualit') || key.includes('grade') || key.includes('check'))
    return { Icon: FlaskConical, label: 'Quality checked' };
  if (key.includes('procur')) return { Icon: Truck, label: 'Procured' };
  if (key.includes('stor') || key.includes('warehouse')) return { Icon: Warehouse, label: 'Stored' };
  if (key.includes('qr') || key.includes('mint') || key.includes('seal'))
    return { Icon: QrCode, label: 'QR minted' };
  if (key.includes('dispatch') || key.includes('ship')) return { Icon: Truck, label: titleCase(stage) };
  return { Icon: Check, label: titleCase(stage) };
}

function titleCase(s: string): string {
  return s
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatWhen(at: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return at;
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function JourneyTimeline({ stages }: { stages: JourneyStage[] }) {
  const ref = useRef<HTMLDivElement>(null);

  // Drive the fill height from scroll progress through the timeline.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.7', 'end 0.6'],
  });
  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (stages.length === 0) {
    return <p className="text-sm text-fg-muted">Stage history will appear here.</p>;
  }

  return (
    <div ref={ref} className="relative pl-[34px]">
      {/* Base track */}
      <div className="absolute left-[11px] bottom-1.5 top-1.5 w-0.5 rounded-full bg-border" aria-hidden />
      {/* Scroll-linked fill */}
      <motion.div
        aria-hidden
        style={{ height: fillHeight }}
        className="absolute left-[11px] top-1.5 w-0.5 rounded-full bg-gradient-to-b from-primary to-primary-300 shadow-[0_0_8px_rgba(13,120,60,0.5)]"
      />

      {stages.map((s, i) => {
        const { Icon, label } = stageMeta(s.stage);
        const isLast = i === stages.length - 1;
        return (
          <div key={`${s.stage}-${i}`} className={isLast ? 'relative' : 'relative pb-6'}>
            <span className="absolute -left-[34px] top-0 grid size-6 place-items-center rounded-full bg-primary text-primary-fg">
              <Icon size={13} strokeWidth={2.2} aria-hidden />
            </span>
            <h4 className="text-[15px] font-semibold text-fg">{label}</h4>
            {s.notes ? <p className="mt-0.5 text-[13px] text-fg-muted">{s.notes}</p> : null}
            <div className="mt-[3px] font-mono text-[11px] text-fg-subtle">{formatWhen(s.at)}</div>
          </div>
        );
      })}
    </div>
  );
}
