/* ============================================================
   Nesso · Web UI — icons, primitives, Sidebar, Topbar, ⌘K palette
   Exports → window: WIcon, WBtn, WCard, WInput, StatusPill, WAvatar,
   Sidebar, Topbar, CommandPalette, Donut, Bars, MiniMap, KpiW, TrendDot
   ============================================================ */
const { useState: useW, useEffect: useWE, useRef: useWR } = React;

const WP = {
  grid:'M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z',
  users:'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4M15.5 5.2a3.25 3.25 0 0 1 0 6',
  map:'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14',
  leaf:'M5 19c0-7 5-13 14-14 0 9-5 14-12 14a5 5 0 0 1-2-.5M5 19c1-4 3-6.5 6-8',
  activity:'M3 12h4l2 6 4-14 2 8h6',
  clipboard:'M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1ZM8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2',
  box:'M12 3 4 7v10l8 4 8-4V7l-8-4ZM4 7l8 4 8-4M12 11v10',
  file:'M14 3v5h5M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8l-5-5ZM9 13h6M9 17h6',
  gear:'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.3a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 5.4 11 2 2 0 1 1 5.4 7h.1A1.6 1.6 0 0 0 7 4.6a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 13.7 6 2 2 0 1 1 16.5 8.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H18a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4.4Z',
  search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  bell:'M18 8a6 6 0 1 0-12 0c0 7-2.5 8-2.5 8h17S18 15 18 8M13.7 21a2 2 0 0 1-3.4 0',
  sun:'M12 4V2M12 22v-2M5 5 3.6 3.6M20.4 20.4 19 19M4 12H2M22 12h-2M5 19l-1.4 1.4M20.4 3.6 19 5M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z',
  moon:'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  chevR:'M9 6l6 6-6 6', chevL:'M15 6l-6 6 6 6', chevD:'M6 9l6 6 6-6',
  plus:'M12 5v14M5 12h14', x:'M18 6 6 18M6 6l12 12', check:'M20 6 9 17l-5-5',
  checkc:'M9 12.5l2 2 4.5-4.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  pin:'M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  download:'M12 3v12M7 11l5 5 5-5M5 21h14', filter:'M3 5h18M6 12h12M10 19h4',
  command:'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
  panel:'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM9 5v14',
  arrowUR:'M7 17 17 7M8 7h9v9', sync:'M21 12a9 9 0 0 1-9 9 9 9 0 0 1-7.6-4.2M3 12a9 9 0 0 1 9-9 9 9 0 0 1 7.6 4.2M21 4v4h-4M3 20v-4h4',
  dots:'', logout:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  drop:'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z', shield:'M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3ZM9.5 12l1.8 1.8L15 10',
  cloud:'M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 6.96', qr:'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16',
};
function WIcon({ name, size = 20, stroke = 1.7, color = 'currentColor', fill = 'none', style }) {
  if (name === 'dots') return <svg width={size} height={size} viewBox="0 0 24 24" style={style}><g fill={color}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></g></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block', ...style }} aria-hidden="true"><path d={WP[name] || ''} /></svg>;
}

function WBtn({ children, kind = 'primary', size = 'md', icon, iconR, onClick, style, full }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: 11, transition: 'all .16s', whiteSpace: 'nowrap', width: full ? '100%' : 'auto',
    height: size === 'lg' ? 48 : size === 'sm' ? 34 : 40, fontSize: size === 'lg' ? 15.5 : size === 'sm' ? 13 : 14, padding: size === 'sm' ? '0 12px' : '0 18px' };
  const kinds = {
    primary: { background: 'var(--primary)', color: 'var(--on-primary)' },
    accent: { background: 'var(--accent)', color: '#0F1A14' },
    outline: { background: 'var(--bg-elevated)', color: 'var(--fg)', boxShadow: 'inset 0 0 0 1.5px var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--fg-muted)' },
  };
  return <button onClick={onClick} className="wbtn" style={{ ...base, ...kinds[kind], ...style }}>{icon && <WIcon name={icon} size={size === 'sm' ? 16 : 18} />}{children}{iconR && <WIcon name={iconR} size={16} />}</button>;
}

function WCard({ children, style, pad = 22, span }) {
  return <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: pad, gridColumn: span ? `span ${span}` : undefined, ...style }}>{children}</div>;
}

function StatusPill({ kind = 'pending', children }) {
  const map = { pending: ['var(--warning)', 'var(--warning-bg)', 'clock'], approved: ['var(--primary)', 'var(--primary-50)', 'checkc'], rejected: ['var(--danger)', 'var(--danger-bg)', 'x'], active: ['var(--secondary-d)', 'var(--secondary-bg)', 'leaf'], processing: ['#0E7490', 'var(--info-bg)', 'sync'] };
  const [c, bg, ic] = map[kind] || map.pending;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px 3px 7px', borderRadius: 999, background: bg, color: c, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}><WIcon name={ic} size={13} stroke={2.2} />{children}</span>;
}

function WAvatar({ name, size = 36, tone }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const tones = ['var(--primary)', 'var(--secondary-d)', '#0E7490', '#9333EA', '#B6850A'];
  const t = tone || tones[(name || '').length % tones.length];
  return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: `color-mix(in oklab, ${t} 16%, var(--bg-elevated))`, color: t, display: 'grid', placeItems: 'center', fontFamily: 'Montserrat', fontWeight: 700, fontSize: size * 0.36, boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${t} 26%, transparent)` }}>{initials}</div>;
}

/* ---------------- Sidebar ---------------- */
const NAV = [
  { id: 'dashboard', icon: 'grid', label: 'Dashboard' },
  { id: 'approvals', icon: 'checkc', label: 'Approvals', badge: 23 },
  { id: 'farmers', icon: 'users', label: 'Farmers' },
  { id: 'farms', icon: 'map', label: 'Farms' },
  { id: 'activities', icon: 'activity', label: 'Activities' },
  { id: 'preharvest', icon: 'leaf', label: 'Pre-harvest' },
  { id: 'quality', icon: 'shield', label: 'Quality' },
  { id: 'procurement', icon: 'clipboard', label: 'Procurement' },
  { id: 'inventory', icon: 'box', label: 'Inventory' },
  { id: 'reports', icon: 'file', label: 'Reports' },
];
function Sidebar({ route, onNav, collapsed, onToggle }) {
  const w = collapsed ? 74 : 248;
  const itm = (n) => {
    const on = route === n.id || (route === 'farmer' && n.id === 'farmers') || (route === 'farm' && n.id === 'farms') || (route === 'batch' && n.id === 'inventory') || (route === 'activity' && n.id === 'activities') || ((route === 'samples' || route === 'audits') && n.id === 'quality') || (route === 'warehouses' && n.id === 'inventory');
    return (
      <button key={n.id} onClick={() => onNav(n.id)} title={n.label} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: collapsed ? '11px 0' : '11px 12px', justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative', fontFamily: 'Inter', fontSize: 14, fontWeight: on ? 600 : 500,
        background: on ? 'var(--primary-50)' : 'transparent', color: on ? 'var(--primary)' : 'var(--fg-muted)', transition: 'all .15s' }}>
        {on && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 3, borderRadius: 3, background: 'var(--primary)' }} />}
        <WIcon name={n.icon} size={20} stroke={on ? 2 : 1.7} />
        {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{n.label}</span>}
        {!collapsed && n.badge && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', background: 'var(--warning-bg)', padding: '1px 7px', borderRadius: 999 }}>{n.badge}</span>}
      </button>
    );
  };
  return (
    <aside style={{ width: w, flexShrink: 0, background: 'var(--bg-elevated)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width .26s cubic-bezier(0.32,0.72,0,1)', height: '100%' }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 11, padding: collapsed ? '0' : '0 18px', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}><img src="assets/nesso-logo.jpeg" alt="Nesso" style={{ width: 24, height: 24 }} /></div>
        {!collapsed && <span className="display" style={{ fontWeight: 700, fontSize: 18, letterSpacing: '0.04em', color: 'var(--fg)' }}>NESSO</span>}
      </div>
      <nav style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        {!collapsed && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--fg-subtle)', padding: '8px 12px 4px' }}>WORKSPACE</div>}
        {NAV.map(itm)}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <button onClick={() => onNav('settings')} title="Settings" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: collapsed ? '11px 0' : '11px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--fg-muted)', fontFamily: 'Inter', fontSize: 14, fontWeight: 500 }}>
          <WIcon name="gear" size={20} />{!collapsed && 'Settings'}
        </button>
        <button onClick={onToggle} title="Collapse" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: collapsed ? '11px 0' : '11px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--fg-subtle)', fontFamily: 'Inter', fontSize: 13, fontWeight: 500 }}>
          <WIcon name="panel" size={20} />{!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}

/* ---------------- Topbar ---------------- */
function Topbar({ theme, onToggleTheme, onOpenCmd, crumbs, onBell, onNav, onLogout }) {
  const [menu, setMenu] = useW(false);
  useWE(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menu]);
  return (
    <header style={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px) saturate(1.4)', WebkitBackdropFilter: 'blur(16px) saturate(1.4)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg-muted)', minWidth: 0 }}>
        {crumbs.map((c, i) => <React.Fragment key={i}>{i > 0 && <WIcon name="chevR" size={15} color="var(--fg-subtle)" />}<span style={{ fontWeight: i === crumbs.length - 1 ? 600 : 500, color: i === crumbs.length - 1 ? 'var(--fg)' : 'var(--fg-muted)', whiteSpace: 'nowrap' }}>{c}</span></React.Fragment>)}
      </div>
      <button onClick={onOpenCmd} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, height: 38, padding: '0 12px', borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--fg-subtle)', fontFamily: 'Inter', fontSize: 13, minWidth: 200 }} className="cmd-trigger">
        <WIcon name="search" size={16} /> <span style={{ flex: 1, textAlign: 'left' }}>Search or jump to…</span>
        <kbd className="mono" style={{ fontSize: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 6px', color: 'var(--fg-muted)' }}>⌘K</kbd>
      </button>
      <button onClick={onToggleTheme} aria-label="Theme" style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--fg)', display: 'grid', placeItems: 'center' }}><WIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /></button>
      <button aria-label="Notifications" onClick={onBell} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--fg)', display: 'grid', placeItems: 'center', position: 'relative' }}><WIcon name="bell" size={18} /><span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 0 2px var(--bg-muted)' }} /></button>
      <div style={{ position: 'relative', paddingLeft: 6 }}>
        <button onClick={(e) => { e.stopPropagation(); setMenu(m => !m); }} aria-label="Account menu" aria-expanded={menu} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px 3px 3px', borderRadius: 10 }}>
          <WAvatar name="Ravi Teja" size={34} />
          <div style={{ lineHeight: 1.2, textAlign: 'left' }} className="hide-sm">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Ravi Teja</div>
            <div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>Admin · NESSO</div>
          </div>
          <WIcon name="chevD" size={15} color="var(--fg-subtle)" style={{ marginLeft: 2 }} />
        </button>
        {menu && (
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 230, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 7, zIndex: 50, animation: 'cmdIn .18s cubic-bezier(0.32,0.72,0,1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
              <WAvatar name="Ravi Teja" size={38} />
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>Ravi Teja</div><div style={{ fontSize: 11.5, color: 'var(--fg-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ravi@nesso.in</div></div>
            </div>
            {[['users', 'Profile', () => onNav && onNav('settings')], ['gear', 'Settings', () => onNav && onNav('settings')], ['bell', 'Notifications', () => onNav && onNav('notifications')]].map(([ic, lbl, fn]) => (
              <button key={lbl} onClick={() => { setMenu(false); fn(); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--fg)', fontFamily: 'Inter', fontSize: 13.5, fontWeight: 500 }} className="cmd-item"><WIcon name={ic} size={17} color="var(--fg-muted)" />{lbl}</button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
            <button onClick={() => { setMenu(false); onLogout && onLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)', fontFamily: 'Inter', fontSize: 13.5, fontWeight: 600 }} className="cmd-item"><WIcon name="logout" size={17} />Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------------- Command palette ---------------- */
function CommandPalette({ open, onClose, onNav }) {
  const [q, setQ] = useW('');
  const inputRef = useWR(null);
  useWE(() => { if (open && inputRef.current) inputRef.current.focus(); if (!open) setQ(''); }, [open]);
  if (!open) return null;
  const cmds = [
    { id: 'dashboard', icon: 'grid', label: 'Go to Dashboard', kbd: 'G D' },
    { id: 'approvals', icon: 'checkc', label: 'Go to Approvals', kbd: 'G A' },
    { id: 'farmers', icon: 'users', label: 'Go to Farmers', kbd: 'G F' },
    { id: 'farms', icon: 'map', label: 'Go to Farms' },
    { id: 'activities', icon: 'activity', label: 'Go to Activities' },
    { id: 'preharvest', icon: 'leaf', label: 'Go to Pre-harvest' },
    { id: 'quality', icon: 'shield', label: 'Go to Quality (samples & audits)' },
    { id: 'procurement', icon: 'clipboard', label: 'Go to Procurement' },
    { id: 'inventory', icon: 'box', label: 'Go to Inventory' },
    { id: 'reports', icon: 'file', label: 'Go to Reports', kbd: 'G R' },
    { id: 'settings', icon: 'gear', label: 'Settings' },
    { id: 'qrgen', icon: 'qr', label: 'Open QR generator' },
    { id: 'farmer', icon: 'plus', label: 'Register a farmer', kbd: 'N' },
    { id: 'batch', icon: 'box', label: 'Open batch BATCH-TBR-0291' },
  ].filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(6,18,10,0.45)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '12vh' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px, 92vw)', background: 'var(--bg-elevated)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', overflow: 'hidden', animation: 'cmdIn .2s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <WIcon name="search" size={20} color="var(--fg-subtle)" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search pages, farmers, batches…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--fg)', fontFamily: 'Inter' }} />
          <kbd className="mono" style={{ fontSize: 11, background: 'var(--bg-muted)', borderRadius: 5, padding: '3px 7px', color: 'var(--fg-subtle)' }}>ESC</kbd>
        </div>
        <div style={{ padding: 8, maxHeight: 340, overflowY: 'auto' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', padding: '8px 12px 4px' }}>JUMP TO</div>
          {cmds.map(c => (
            <button key={c.id + c.label} onClick={() => { onNav(c.id); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--fg)', fontFamily: 'Inter', fontSize: 14 }} className="cmd-item">
              <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><WIcon name={c.icon} size={16} /></span>
              <span style={{ flex: 1, textAlign: 'left' }}>{c.label}</span>
              {c.kbd && <kbd className="mono" style={{ fontSize: 11, background: 'var(--bg-muted)', borderRadius: 5, padding: '2px 7px', color: 'var(--fg-subtle)' }}>{c.kbd}</kbd>}
            </button>
          ))}
          {!cmds.length && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 14 }}>No results for “{q}”.</div>}
        </div>
      </div>
    </div>
  );
}

function WToast({ msg, kind = 'success', onDone }) {
  React.useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [msg]);
  if (!msg) return null;
  const c = kind === 'success' ? 'var(--primary)' : kind === 'error' ? 'var(--danger)' : 'var(--secondary-d)';
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 120, background: 'var(--fg)', color: 'var(--bg)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 11, boxShadow: 'var(--shadow-lg)', animation: 'cmdIn .28s cubic-bezier(0.32,0.72,0,1)' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: c, display: 'grid', placeItems: 'center', flexShrink: 0 }}><WIcon name={kind === 'success' ? 'check' : kind === 'error' ? 'x' : 'sync'} size={14} color="#fff" stroke={2.6} /></span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

Object.assign(window, { WIcon, WBtn, WCard, StatusPill, WAvatar, Sidebar, Topbar, CommandPalette, WToast, NAV });
