/* ============================================================
   Nesso · Mobile UI primitives  (Cultivated Clarity)
   Exports → window: Icon, PhoneShell, StatusBar, GesturePill,
   TabBar, BottomSheet, StatusChip, Btn, Field, SegOtp, useCountUp,
   Avatar, Sparkline, Toast
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------------- ICONS (lucide-style, 1.6 stroke) ---------------- */
const PATHS = {
  home:      'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5',
  users:     'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4M15.5 5.2a3.25 3.25 0 0 1 0 6',
  leaf:      'M5 19c0-7 5-13 14-14 0 9-5 14-12 14a5 5 0 0 1-2-.5M5 19c1-4 3-6.5 6-8',
  sprout:    'M7 20h10M12 20v-8M12 12c0-3-2-5-5-5 0 3 2 5 5 5ZM12 12c0-3 2-5 5-5 0 3-2 5-5 5Z',
  check:     'M20 6 9 17l-5-5',
  checkc:    'M9 12.5l2 2 4.5-4.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  bell:      'M18 8a6 6 0 1 0-12 0c0 7-2.5 8-2.5 8h17S18 15 18 8M13.7 21a2 2 0 0 1-3.4 0',
  search:    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  plus:      'M12 5v14M5 12h14',
  pin:       'M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  cloud:     'M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 6.96',
  drop:      'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  sun:       'M12 4V2M12 22v-2M5 5 3.6 3.6M20.4 20.4 19 19M4 12H2M22 12h-2M5 19l-1.4 1.4M20.4 3.6 19 5M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z',
  moon:      'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  chevR:     'M9 6l6 6-6 6',
  chevL:     'M15 6l-6 6 6 6',
  filter:    'M3 5h18M6 12h12M10 19h4',
  scan:      'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16',
  cal:       'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  activity:  'M3 12h4l2 6 4-14 2 8h6',
  settings:  'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.3a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 5.4 11 2 2 0 1 1 5.4 7h.1A1.6 1.6 0 0 0 7 4.6a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 13.7 6 2 2 0 1 1 16.5 8.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H18a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4.4Z',
  phone:     'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  arrowL:    'M19 12H5M12 19l-7-7 7-7',
  arrowR:    'M5 12h14M12 5l7 7-7 7',
  sync:      'M21 12a9 9 0 0 1-9 9 9 9 0 0 1-7.6-4.2M3 12a9 9 0 0 1 9-9 9 9 0 0 1 7.6 4.2M21 4v4h-4M3 20v-4h4',
  alert:     'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  clock:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  map:       'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14',
  x:         'M18 6 6 18M6 6l12 12',
  camera:    'M4 8a2 2 0 0 1 2-2h1.5l1-2h7l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  edit:      'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z',
  shield:    'M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3ZM9.5 12l1.8 1.8L15 10',
  wheat:     'M12 22V8M12 8c0-2 1.5-3.5 3.5-3.5C15.5 6.5 14 8 12 8ZM12 8c0-2-1.5-3.5-3.5-3.5C8.5 6.5 10 8 12 8M12 13c0-2 1.5-3.5 3.5-3.5C15.5 11.5 14 13 12 13M12 13c0-2-1.5-3.5-3.5-3.5C8.5 11.5 10 13 12 13',
  dots:      'M12 6h.01M12 12h.01M12 18h.01',
  logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
};
function Icon({ name, size = 22, stroke = 1.7, color = 'currentColor', fill = 'none', style }) {
  const d = PATHS[name] || PATHS.dots;
  const dots = name === 'dots';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }} aria-hidden="true">
      {dots
        ? <><circle cx="12" cy="6" r="1.4" fill={color} stroke="none"/><circle cx="12" cy="12" r="1.4" fill={color} stroke="none"/><circle cx="12" cy="18" r="1.4" fill={color} stroke="none"/></>
        : <path d={d} />}
    </svg>
  );
}

/* ---------------- count-up hook ---------------- */
function useCountUp(target, dur = 700, deps = []) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, deps);
  return v;
}

/* ---------------- Status bar ---------------- */
function StatusBar({ tone = 'dark' }) {
  const c = tone === 'light' ? '#ffffff' : 'var(--fg)';
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 46, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 26px', pointerEvents: 'none' }}>
      <span className="display" style={{ fontSize: 15, fontWeight: 600, color: c, letterSpacing: '0.02em' }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="13" viewBox="0 0 18 13" fill={c}><rect x="0" y="8" width="3" height="5" rx="1"/><rect x="5" y="5" width="3" height="8" rx="1"/><rect x="10" y="2.5" width="3" height="10.5" rx="1"/><rect x="15" y="0" width="3" height="13" rx="1"/></svg>
        <svg width="17" height="13" viewBox="0 0 17 13" fill={c}><path d="M8.5 2.4c2.5 0 4.8.95 6.5 2.5l-1.4 1.5A7.6 7.6 0 0 0 8.5 4.4 7.6 7.6 0 0 0 2.9 6.4L1.5 4.9A9.6 9.6 0 0 1 8.5 2.4Z" opacity="0.9"/><path d="M8.5 6.6c1.4 0 2.7.5 3.6 1.4l-3.6 3.8-3.6-3.8A5.2 5.2 0 0 1 8.5 6.6Z"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3" stroke={c} strokeWidth="1.3" opacity="0.55"/><rect x="3" y="3" width="15" height="7" rx="1.5" fill={c}/><rect x="23.5" y="4.5" width="1.8" height="4" rx="0.9" fill={c} opacity="0.55"/></svg>
      </div>
    </div>
  );
}

function GesturePill({ tone = 'dark', platform = 'ios' }) {
  return (
    <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, height: 22, zIndex: 40,
      display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
      <div style={{ width: platform === 'ios' ? 132 : 108, height: platform === 'ios' ? 5 : 4, borderRadius: 3,
        background: tone === 'light' ? 'rgba(255,255,255,0.85)' : 'var(--fg)', opacity: tone === 'light' ? 0.85 : 0.32 }} />
    </div>
  );
}

/* ---------------- Phone shell ---------------- */
function PhoneShell({ children, theme = 'light', statusTone = 'dark', platform = 'ios' }) {
  const ios = platform === 'ios';
  return (
    <div className="nesso-app" data-theme={theme} style={{
      width: 392, height: 850, borderRadius: ios ? 52 : 42, position: 'relative',
      background: '#08100b', padding: ios ? 11 : 9, boxShadow: '0 40px 90px -20px rgba(8,24,14,0.55), 0 0 0 2px rgba(255,255,255,0.06) inset',
      flexShrink: 0,
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: ios ? 42 : 34, overflow: 'hidden', background: 'var(--bg)' }}>
        <StatusBar tone={statusTone} />
        {/* iOS Dynamic Island */}
        {ios && <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 116, height: 33, borderRadius: 18, background: '#000', zIndex: 35 }} />}
        {/* Android punch-hole camera */}
        {!ios && <div style={{ position: 'absolute', top: 15, left: '50%', transform: 'translateX(-50%)', width: 11, height: 11, borderRadius: '50%', background: '#000', boxShadow: '0 0 0 2px rgba(0,0,0,0.4)', zIndex: 35 }} />}
        {children}
        <GesturePill tone={statusTone} platform={platform} />
      </div>
    </div>
  );
}

/* ---------------- Buttons ---------------- */
function Btn({ children, kind = 'primary', size = 'md', full, onClick, icon, style, disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    fontFamily: 'Montserrat, sans-serif', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: 14, transition: 'transform .12s, box-shadow .2s, background .2s',
    width: full ? '100%' : 'auto', letterSpacing: '0.005em', whiteSpace: 'nowrap',
    height: size === 'lg' ? 56 : size === 'sm' ? 40 : 50,
    fontSize: size === 'lg' ? 17 : size === 'sm' ? 14 : 15.5,
    padding: size === 'sm' ? '0 16px' : '0 22px', opacity: disabled ? 0.5 : 1,
  };
  const kinds = {
    primary: { background: 'linear-gradient(180deg, var(--primary), var(--primary-2))', color: 'var(--on-primary)', boxShadow: '0 8px 22px -6px var(--glow)' },
    accent:  { background: 'var(--accent)', color: '#0F1A14', boxShadow: '0 8px 22px -6px rgba(241,212,18,0.5)' },
    ghost:   { background: 'transparent', color: 'var(--primary)' },
    outline: { background: 'var(--bg-elevated)', color: 'var(--fg)', boxShadow: 'inset 0 0 0 1.5px var(--border-strong)' },
    soft:    { background: 'var(--primary-50)', color: 'var(--primary)' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...kinds[kind], ...style }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = '')}
      onMouseLeave={e => (e.currentTarget.style.transform = '')}>
      {icon && <Icon name={icon} size={size === 'lg' ? 21 : 18} />}
      {children}
    </button>
  );
}

/* ---------------- Field ---------------- */
function Field({ label, value, onChange, placeholder, prefix, type = 'text', mono, hint, required, focusKey }) {
  const [f, setF] = useState(false);
  return (
    <label style={{ display: 'block' }}>
      {label && <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 8 }}>{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</span>}
      <div style={{ display: 'flex', alignItems: 'center', height: 54, borderRadius: 14, background: 'var(--bg-elevated)',
        boxShadow: f ? '0 0 0 2px var(--ring), inset 0 0 0 1.5px var(--ring)' : 'inset 0 0 0 1.5px var(--border-strong)',
        transition: 'box-shadow .18s', overflow: 'hidden' }}>
        {prefix && <span className="mono" style={{ padding: '0 4px 0 16px', color: 'var(--fg-muted)', fontWeight: 500, fontSize: 15 }}>{prefix}</span>}
        <input value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} type={type}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          className={mono ? 'mono' : ''}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', height: '100%',
            padding: prefix ? '0 16px 0 6px' : '0 16px', fontSize: 16, color: 'var(--fg)', fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
            letterSpacing: mono ? '0.08em' : 'normal' }} />
      </div>
      {hint && <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg-subtle)', marginTop: 7 }}>{hint}</span>}
    </label>
  );
}

/* ---------------- Status chip ---------------- */
function StatusChip({ kind = 'pending', children }) {
  const map = {
    pending:   { c: 'var(--warning)', bg: 'var(--warning-bg)', ic: 'clock' },
    approved:  { c: 'var(--primary)', bg: 'var(--primary-50)', ic: 'checkc' },
    completed: { c: 'var(--primary)', bg: 'var(--primary-50)', ic: 'check' },
    rejected:  { c: 'var(--danger)', bg: 'var(--danger-bg)', ic: 'x' },
    overdue:   { c: 'var(--danger)', bg: 'var(--danger-bg)', ic: 'alert' },
    synced:    { c: 'var(--secondary-d)', bg: 'var(--secondary-bg)', ic: 'sync' },
  };
  const s = map[kind] || map.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 8px', borderRadius: 999,
      background: s.bg, color: s.c, fontSize: 12, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
      <Icon name={s.ic} size={13} stroke={2.1} /> {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
function Avatar({ name, size = 44, tone }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const tones = ['var(--primary)', 'var(--secondary)', '#0E7490', '#9333EA', '#B6850A'];
  const t = tone || tones[(name || '').length % tones.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `color-mix(in oklab, ${t} 16%, var(--bg-elevated))`, color: t,
      display: 'grid', placeItems: 'center', fontFamily: 'Montserrat', fontWeight: 700, fontSize: size * 0.36,
      boxShadow: 'inset 0 0 0 1.5px color-mix(in oklab, ' + t + ' 28%, transparent)' }}>{initials}</div>
  );
}

/* ---------------- mini sparkline ---------------- */
function Sparkline({ data = [], color = 'var(--primary)', w = 64, h = 26 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((d, i) => [i / (data.length - 1) * w, h - ((d - min) / (max - min || 1)) * (h - 4) - 2]);
  const dStr = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = dStr + ` L${w} ${h} L0 ${h} Z`;
  const gid = 'sg' + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.28"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={dStr} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Tab bar ---------------- */
function TabBar({ active, onChange, onFab, fabPulse }) {
  const tabs = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'farmers', icon: 'users', label: 'Farmers' },
    { id: 'verify', icon: 'shield', label: 'Verify' },
    { id: 'farms', icon: 'map', label: 'Farms' },
  ];
  const item = (t) => {
    const on = active === t.id;
    return (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, padding: '8px 0',
        color: on ? 'var(--primary)' : 'var(--fg-subtle)', transition: 'color .2s' }}>
        <Icon name={t.icon} size={23} stroke={on ? 2.2 : 1.7} fill={on ? 'var(--primary-50)' : 'none'} />
        <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500, fontFamily: 'Inter' }}>{t.label}</span>
      </button>
    );
  };
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 25,
      background: 'var(--glass-bg)', backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
      borderTop: '1px solid var(--glass-border)', paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', position: 'relative' }}>
        {item(tabs[0])}{item(tabs[1])}
        <div style={{ width: 64, flexShrink: 0 }} />
        {item(tabs[2])}{item(tabs[3])}
        <button onClick={onFab} aria-label="Register farmer" style={{ position: 'absolute', left: '50%', top: -26, transform: 'translateX(-50%)',
          width: 62, height: 62, borderRadius: '50%', border: '4px solid var(--bg)', cursor: 'pointer',
          background: 'linear-gradient(180deg, var(--primary), var(--primary-2))', color: 'var(--on-primary)',
          display: 'grid', placeItems: 'center', boxShadow: '0 10px 26px -6px var(--glow)' }}
          className={fabPulse ? 'fab-pulse' : ''}>
          <Icon name="plus" size={28} stroke={2.4} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Bottom sheet ---------------- */
function BottomSheet({ open, onClose, title, children, maxH = 0.86 }) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => { if (open) setMounted(true); }, [open]);
  if (!mounted) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} onTransitionEnd={() => { if (!open) setMounted(false); }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(6,18,10,0.5)', backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0, transition: 'opacity .3s' }} />
      <div style={{ position: 'relative', background: 'var(--bg-elevated)', borderRadius: '28px 28px 0 0',
        maxHeight: `${maxH * 100}%`, display: 'flex', flexDirection: 'column', boxShadow: '0 -16px 40px rgba(8,24,14,0.25)',
        transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .34s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 42, height: 5, borderRadius: 3, background: 'var(--border-strong)' }} />
        </div>
        {title && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 22px 14px' }}>
          <h3 className="display" style={{ fontSize: 21, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'var(--bg-muted)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--fg-muted)' }}><Icon name="x" size={19} /></button>
        </div>}
        <div style={{ overflow: 'auto', padding: '0 22px 28px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Toast ---------------- */
function Toast({ msg, kind = 'success', onDone }) {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [msg]);
  if (!msg) return null;
  const c = kind === 'success' ? 'var(--primary)' : kind === 'error' ? 'var(--danger)' : 'var(--secondary-d)';
  return (
    <div style={{ position: 'absolute', bottom: 110, left: 18, right: 18, zIndex: 70,
      background: 'var(--fg)', color: 'var(--bg)', borderRadius: 14, padding: '13px 16px',
      display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 12px 30px rgba(8,24,14,0.3)',
      animation: 'toastIn .34s cubic-bezier(0.32,0.72,0,1)' }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: c, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={kind === 'success' ? 'check' : kind === 'error' ? 'x' : 'sync'} size={15} color="#fff" stroke={2.6} /></span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

Object.assign(window, { Icon, useCountUp, StatusBar, GesturePill, PhoneShell, Btn, Field, StatusChip, Avatar, Sparkline, TabBar, BottomSheet, Toast });
