/* ============================================================
   Nesso · Web viz — signature charts + map tile + KPI
   Exports → window: KpiW, Donut, Bars, AreaLine, MiniMap, Spark, useCount
   ============================================================ */
const { useState: useV, useEffect: useVE } = React;

function useCount(target, dur = 800) {
  const [v, setV] = useV(0);
  useVE(() => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let raf, s; const tick = t => { if (!s) s = t; const p = Math.min(1, (t - s) / dur); setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function Spark({ data, color = 'var(--primary)', w = 90, h = 34 }) {
  const mx = Math.max(...data), mn = Math.min(...data);
  const pts = data.map((d, i) => [i / (data.length - 1) * w, h - ((d - mn) / (mx - mn || 1)) * (h - 5) - 3]);
  const dStr = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const id = 'sp' + Math.random().toString(36).slice(2, 7);
  return <svg width={w} height={h} style={{ display: 'block' }}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.25" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs><path d={`${dStr} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} /><path d={dStr} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function KpiW({ label, value, suffix, delta, icon, color, spark }) {
  const v = useCount(value);
  const disp = value >= 100 ? Math.round(v).toLocaleString() : v.toFixed(0);
  return (
    <WCard pad={20}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, background: `color-mix(in oklab, ${color} 14%, var(--bg-elevated))`, display: 'grid', placeItems: 'center', color }}><WIcon name={icon} size={20} stroke={2} /></span>
        {spark && <Spark data={spark} color={color} />}
      </div>
      <div className="display" style={{ fontSize: 34, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em', marginTop: 14, fontFeatureSettings: '"tnum"' }}>{disp}{suffix}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
        <span style={{ fontSize: 13.5, color: 'var(--fg-muted)', fontWeight: 500 }}>{label}</span>
        {delta != null && <span style={{ fontSize: 12, fontWeight: 700, color: delta > 0 ? 'var(--primary)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>{delta > 0 ? '↑' : '↓'}{Math.abs(delta)}%</span>}
      </div>
    </WCard>
  );
}

/* Donut with rounded caps + soft gradient */
function Donut({ segments, total, center, sub, size = 168 }) {
  const r = size / 2 - 14, c = 2 * Math.PI * r, cx = size / 2;
  let off = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="14" />
        {segments.map((s, i) => {
          const frac = s.v / total, len = frac * c;
          const el = <circle key={i} cx={cx} cy={cx} r={r} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${Math.max(0, len - 4)} ${c}`} strokeDashoffset={-off} transform={`rotate(-90 ${cx} ${cx})`} style={{ transition: 'stroke-dasharray .6s' }} />;
          off += len; return el;
        })}
        <text x={cx} y={cx - 4} textAnchor="middle" className="display" fontSize="30" fontWeight="700" fill="var(--fg)">{center}</text>
        <text x={cx} y={cx + 16} textAnchor="middle" fontSize="12" fill="var(--fg-muted)" fontFamily="Inter">{sub}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 120 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--fg-muted)', flex: 1 }}>{s.label}</span>
            <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Bar chart — rounded caps, no axis lines, dotted baseline */
function Bars({ data, color = 'var(--primary)', h = 180 }) {
  const mx = Math.max(...data.map(d => d.v));
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(3%, 14px)', height: h, padding: '0 2px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: 30, height: `${(d.v / mx) * 100}%`, borderRadius: 999, background: d.hi ? 'var(--accent)' : `linear-gradient(180deg, color-mix(in oklab, ${color} 70%, white), ${color})`, transition: 'height .6s cubic-bezier(0.32,0.72,0,1)', minHeight: 6 }} title={d.v} />
            <span style={{ fontSize: 11, color: 'var(--fg-subtle)', fontWeight: 500 }}>{d.k}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1.5px dotted var(--border-strong)', marginTop: -22, position: 'relative', top: -22 }} />
    </div>
  );
}

/* Styled mini-map with clustered markers + a farm polygon */
function MiniMap({ height = '100%' }) {
  const clusters = [[28, 42, 12], [52, 30, 28], [68, 58, 7], [42, 68, 16], [80, 40, 5]];
  return (
    <div style={{ position: 'relative', width: '100%', height, minHeight: 220, borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(135deg, color-mix(in oklab, var(--secondary) 22%, var(--bg-muted)), var(--bg-muted))' }}>
      {/* terrain texture */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <defs><pattern id="contour" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 30 Q30 10 60 30 M0 50 Q30 30 60 50" fill="none" stroke="var(--border-strong)" strokeWidth="1" opacity="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#contour)" />
        <path d="M0 60% Q 30% 50%, 55% 62% T 100% 58%" fill="none" stroke="#0E7490" strokeWidth="3" opacity="0.4" />
      </svg>
      {/* farm polygon */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polygon points="44,22 60,18 66,34 56,44 40,38" fill="color-mix(in oklab, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
      </svg>
      {clusters.map(([x, y, n], i) => (
        <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>
          <div style={{ width: n > 10 ? 38 : 28, height: n > 10 ? 38 : 28, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center', fontSize: n > 10 ? 13 : 11, fontWeight: 700, fontFamily: 'Inter', border: '2.5px solid var(--bg-elevated)', boxShadow: 'var(--shadow-md)' }}>{n}</div>
        </div>
      ))}
      {/* zoom controls */}
      <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', flexDirection: 'column', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        <button style={{ width: 34, height: 34, border: 'none', background: 'var(--bg-elevated)', color: 'var(--fg)', cursor: 'pointer', fontSize: 18, borderBottom: '1px solid var(--border)' }}>+</button>
        <button style={{ width: 34, height: 34, border: 'none', background: 'var(--bg-elevated)', color: 'var(--fg)', cursor: 'pointer', fontSize: 18 }}>−</button>
      </div>
    </div>
  );
}

Object.assign(window, { KpiW, Donut, Bars, MiniMap, Spark, useCount });
