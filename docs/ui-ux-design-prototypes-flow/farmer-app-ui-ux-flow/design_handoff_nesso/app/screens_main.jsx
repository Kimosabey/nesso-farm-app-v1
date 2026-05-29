/* ============================================================
   Nesso · Main screens — Dashboard, Farmers, Verify, Farms, Register
   Exports → window: Dashboard, FarmersScreen, VerifyScreen, FarmsScreen, RegisterSheet
   ============================================================ */
const { useState: useStateM, useEffect: useEffectM } = React;

const FARMERS = [
  { name: 'Lakshmi Gowda', village: 'Channarayapatna', crop: 'Tuberose', status: 'approved', area: '1.2  ha', id: 'FRM-2841' },
  { name: 'Ramesh Patil', village: 'Sakleshpur', crop: 'Jasmine', status: 'pending', area: '0.8 ha', id: 'FRM-2840' },
  { name: 'Anjali Hegde', village: 'Belur', crop: 'Marigold', status: 'approved', area: '2.4 ha', id: 'FRM-2839' },
  { name: 'Suresh Kumar', village: 'Arsikere', crop: 'Rose', status: 'pending', area: '1.0 ha', id: 'FRM-2838' },
  { name: 'Manjula Devi', village: 'Holenarasipura', crop: 'Davana', status: 'approved', area: '0.6 ha', id: 'FRM-2837' },
  { name: 'Vijay Shetty', village: 'Alur', crop: 'Tuberose', status: 'rejected', area: '1.5 ha', id: 'FRM-2836' },
  { name: 'Geetha Rao', village: 'Hassan', crop: 'Jasmine', status: 'approved', area: '0.9 ha', id: 'FRM-2835' },
];

/* irregular farm polygon thumbnail */
function PolyThumb({ seed = 0, size = 56 }) {
  const sets = [
    'M10 18 L30 8 L50 16 L46 44 L18 48 Z',
    'M8 24 L24 10 L48 20 L42 46 L14 42 Z',
    'M12 14 L40 10 L50 32 L34 50 L10 38 Z',
  ];
  return (
    <div style={{ width: size, height: size, borderRadius: 13, background: 'var(--primary-50)', display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs><pattern id={'grid' + seed} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="var(--primary)" strokeWidth="0.4" opacity="0.25"/></pattern></defs>
        <rect width="60" height="60" fill={'url(#grid' + seed + ')'} />
        <path d={sets[seed % 3]} fill="color-mix(in oklab, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
        {[[10,18],[50,16],[46,44],[18,48]].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="2.2" fill="var(--primary)"/>)}
      </svg>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function DashHeader({ theme, onToggleTheme, onNav }) {
  return (
    <div style={{ paddingTop: 54, padding: '54px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => onNav('settings')} aria-label="Profile & settings" style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}><Avatar name="Ravi Teja" size={46} /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Good morning
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>Field Officer</span>
        </div>
        <div className="display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>Ravi Teja</div>
      </div>
      <button onClick={onToggleTheme} aria-label="Toggle theme" style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--fg)', flexShrink: 0 }}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
      <button onClick={() => onNav('notifications')} aria-label="Notifications" style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--fg)', position: 'relative', flexShrink: 0 }}>
        <Icon name="bell" size={19} />
        <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 0 2px var(--bg-elevated)' }} />
      </button>
    </div>
  );
}

function Weather({ onClick }) {
  const days = [['Mon', 'sun', 28], ['Tue', 'cloud', 26], ['Wed', 'drop', 24], ['Thu', 'cloud', 27]];
  return (
    <div style={{ margin: '0 20px', borderRadius: 22, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', boxShadow: '0 12px 30px -10px var(--glow)' }}>
      <div style={{ position: 'absolute', top: -30, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(241,212,18,0.25)', filter: 'blur(20px)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.9, fontWeight: 500 }}><Icon name="pin" size={14} /> Hassan, Karnataka</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
            <span className="display" style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em' }}>27°</span>
            <span style={{ fontSize: 14, opacity: 0.9 }}>Partly cloudy</span>
          </div>
        </div>
        <Icon name="cloud" size={40} color="#fff" stroke={1.6} style={{ opacity: 0.95 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.16)', borderRadius: 12, position: 'relative', fontSize: 13, fontWeight: 500 }}>
        <Icon name="check" size={15} stroke={2.4} /> Good window for spraying till 4 PM
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, position: 'relative' }}>
        {days.map(([d, ic, t]) => (
          <div key={d} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 11.5, opacity: 0.85 }}>{d}</span>
            <Icon name={ic} size={18} color="#fff" stroke={1.8} />
            <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{t}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, suffix, delta, icon, color, spark }) {
  const v = useCountUp(value, 800, [value]);
  const display = value >= 100 ? Math.round(v).toLocaleString() : v.toFixed(0);
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, padding: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `color-mix(in oklab, ${color} 14%, var(--bg-elevated))`, display: 'grid', placeItems: 'center', color }}><Icon name={icon} size={18} stroke={2} /></span>
        {spark && <Sparkline data={spark} color={color} w={52} h={22} />}
      </div>
      <div className="display" style={{ fontSize: 30, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em', marginTop: 12, fontFeatureSettings: '"tnum"' }}>
        {display}{suffix}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <span style={{ fontSize: 13, color: 'var(--fg-muted)', fontWeight: 500 }}>{label}</span>
        {delta != null && <span style={{ fontSize: 11.5, fontWeight: 700, color: delta > 0 ? 'var(--primary)' : 'var(--danger)' }}>{delta > 0 ? '↑' : '↓'}{Math.abs(delta)}</span>}
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 8px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-sm)', transition: 'transform .12s' }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'} onMouseUp={e => e.currentTarget.style.transform = ''} onMouseLeave={e => e.currentTarget.style.transform = ''}>
      <span style={{ width: 44, height: 44, borderRadius: 13, background: `color-mix(in oklab, ${color} 14%, var(--bg-elevated))`, display: 'grid', placeItems: 'center', color }}><Icon name={icon} size={22} stroke={1.9} /></span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </button>
  );
}

const FEED = [
  { icon: 'users', color: 'var(--primary)', t: 'Registered Lakshmi Gowda', s: 'Channarayapatna · KYC pending', time: '12m' },
  { icon: 'activity', color: 'var(--secondary-d)', t: 'Logged spraying activity', s: 'Farm FRM-2839 · ₹1,240', time: '1h' },
  { icon: 'map', color: '#0E7490', t: 'Mapped a 2.4 ha farm', s: 'Belur · 6 vertices', time: '3h' },
  { icon: 'checkc', color: 'var(--primary)', t: 'Harvest plan approved', s: 'Tuberose · 320 kg expected', time: '5h' },
];

function Dashboard({ theme, onToggleTheme, onAction }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: 'var(--bg)', paddingBottom: 110 }}>
      <DashHeader theme={theme} onToggleTheme={onToggleTheme} onNav={onAction} />
      {/* sync chip */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999, background: 'var(--secondary-bg)', color: 'var(--secondary-d)', fontSize: 12.5, fontWeight: 600 }}>
          <Icon name="sync" size={14} stroke={2.2} /> All synced · 2 min ago
        </div>
      </div>
      <div onClick={() => onAction('weather')} style={{ cursor: 'pointer' }}><Weather /></div>

      <div style={{ padding: '22px 20px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>This season</h2>
        <span style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>2025–26 ▾</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 20px 0' }}>
        <KpiCard label="Farmers" value={1284} delta={12} icon="users" color="var(--primary)" spark={[3,5,4,6,7,8,10]} />
        <KpiCard label="Farms mapped" value={942} delta={8} icon="map" color="var(--secondary-d)" spark={[2,3,3,5,6,6,8]} />
        <KpiCard label="Active crops" value={376} delta={5} icon="leaf" color="#0E7490" spark={[5,4,5,6,6,7,7]} />
        <KpiCard label="Pending" value={23} delta={-4} icon="clock" color="var(--warning)" spark={[8,7,6,7,5,4,3]} />
      </div>

      <h2 className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', padding: '24px 20px 0' }}>Quick actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '12px 20px 0' }}>
        <QuickAction icon="users" label="Register" color="var(--primary)" onClick={() => onAction('register')} />
        <QuickAction icon="map" label="Add farm" color="var(--secondary-d)" onClick={() => onAction('addFarm')} />
        <QuickAction icon="activity" label="Activity" color="#0E7490" onClick={() => onAction('addActivity')} />
        <QuickAction icon="scan" label="Scan GRN" color="#B6850A" onClick={() => onAction('grn')} />
      </div>

      <h2 className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', padding: '26px 20px 0' }}>Jump to</h2>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 20px 0' }}>
        {[['harvest', 'wheat', 'Harvest'], ['activities', 'activity', 'Activities'], ['preharvest', 'leaf', 'Pre-harvest'], ['postharvest', 'box', 'Post-harvest'], ['samples', 'drop', 'Samples'], ['procurement', 'file', 'Procurement']].map(([id, ic, lbl]) => (
          <button key={id} onClick={() => onAction(id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', padding: '9px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter', border: '1.5px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}>
            <Icon name={ic} size={16} color="var(--primary)" /> {lbl}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '26px 20px 0' }}>
        <h2 className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>Recent activity</h2>
        <span style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>See all</span>
      </div>
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {FEED.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: `color-mix(in oklab, ${f.color} 14%, var(--bg-elevated))`, display: 'grid', placeItems: 'center', color: f.color, flexShrink: 0 }}><Icon name={f.icon} size={18} stroke={2} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{f.s}</div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{f.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Farmers ---------------- */
function PageTop({ title, sub }) {
  return (
    <div style={{ paddingTop: 56, padding: '56px 20px 8px' }}>
      <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{title}</h1>
      {sub && <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', borderRadius: 14, background: 'var(--bg-elevated)', border: '1.5px solid var(--border)' }}>
      <Icon name="search" size={19} color="var(--fg-subtle)" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--fg)', fontFamily: 'Inter' }} />
      <Icon name="filter" size={19} color="var(--primary)" />
    </div>
  );
}

function Chips({ items, active, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px', WebkitOverflowScrolling: 'touch' }}>
      {items.map(it => {
        const on = active === it;
        return <button key={it} onClick={() => onPick(it)} style={{ whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter',
          border: on ? 'none' : '1.5px solid var(--border)', background: on ? 'var(--primary)' : 'var(--bg-elevated)', color: on ? 'var(--on-primary)' : 'var(--fg-muted)' }}>{it}</button>;
      })}
    </div>
  );
}

function FarmersScreen({ theme, onOpen }) {
  const [q, setQ] = useStateM('');
  const [filter, setFilter] = useStateM('All');
  const list = FARMERS.filter(f =>
    (filter === 'All' || f.status === filter.toLowerCase()) &&
    (f.name.toLowerCase().includes(q.toLowerCase()) || f.village.toLowerCase().includes(q.toLowerCase())));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: 'var(--bg)', paddingBottom: 110 }}>
      <PageTop title="Farmers" sub={`${FARMERS.length} in your cluster`} />
      <div style={{ padding: '8px 20px 12px' }}><SearchBar value={q} onChange={setQ} placeholder="Search name or village" /></div>
      <Chips items={['All', 'Approved', 'Pending', 'Rejected']} active={filter} onPick={setFilter} />
      <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((f, i) => (
          <div key={f.id} onClick={onOpen} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, padding: 13, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <Avatar name={f.name} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{f.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
                <Icon name="pin" size={13} color="var(--fg-subtle)" /> {f.village} · <Icon name="leaf" size={13} color="var(--secondary-d)" /> {f.crop}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 3 }}>{f.id} · {f.area}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <StatusChip kind={f.status}>{f.status[0].toUpperCase() + f.status.slice(1)}</StatusChip>
              <Icon name="chevR" size={18} color="var(--fg-subtle)" />
            </div>
          </div>
        ))}
        {!list.length && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-subtle)', fontSize: 14 }}>No farmers match.</div>}
      </div>
    </div>
  );
}

/* ---------------- Verify ---------------- */
function VerifyScreen({ onToast, onOpen }) {
  const [tab, setTab] = useStateM('Pending');
  const pend = FARMERS.filter(f => f.status === 'pending');
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: 'var(--bg)', paddingBottom: 110 }}>
      <PageTop title="Verify" sub="Approve new farmer registrations" />
      <div style={{ padding: '6px 20px 0' }}>
        <Chips items={['Pending', 'Approved', 'Rejected']} active={tab} onPick={setTab} />
      </div>
      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(tab === 'Pending' ? pend : []).map(f => (
          <div key={f.id} style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 15, cursor: 'pointer' }}>
              <Avatar name={f.name} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--fg)' }}>{f.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{f.village} · {f.crop} · {f.area}</div>
              </div>
              <StatusChip kind="pending">KYC</StatusChip>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '1px solid var(--border)', padding: '11px 15px', background: 'var(--bg-muted)' }}>
              <div><div style={{ fontSize: 10.5, color: 'var(--fg-subtle)', fontWeight: 600 }}>AADHAAR</div><div className="mono" style={{ fontSize: 12.5, color: 'var(--fg)' }}>•••• 4821</div></div>
              <div><div style={{ fontSize: 10.5, color: 'var(--fg-subtle)', fontWeight: 600 }}>BANK</div><div className="mono" style={{ fontSize: 12.5, color: 'var(--fg)' }}>HDFC ••32</div></div>
              <div><div style={{ fontSize: 10.5, color: 'var(--fg-subtle)', fontWeight: 600 }}>DOCS</div><div style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>2 files</div></div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: 13 }}>
              <Btn kind="outline" size="sm" full icon="x" onClick={() => onToast('Registration rejected', 'error')}>Reject</Btn>
              <Btn kind="primary" size="sm" full icon="check" onClick={() => onToast('Farmer approved ✓', 'success')}>Approve</Btn>
            </div>
          </div>
        ))}
        {tab !== 'Pending' && <EmptyMini label={`No ${tab.toLowerCase()} items to show`} />}
      </div>
    </div>
  );
}

function EmptyMini({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg viewBox="0 0 160 120" width="150" aria-hidden="true">
        <defs><linearGradient id="emg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--primary-300)"/><stop offset="1" stopColor="var(--primary)"/></linearGradient></defs>
        <circle cx="118" cy="34" r="18" fill="var(--accent)" opacity="0.85"/>
        <rect x="24" y="62" width="112" height="13" rx="6.5" fill="url(#emg)" opacity="0.85"/>
        <rect x="24" y="82" width="78" height="13" rx="6.5" fill="var(--secondary)" opacity="0.6"/>
        <path d="M46 62 C46 44 62 40 62 40 C62 40 62 58 46 62 Z" fill="var(--primary)"/>
      </svg>
      <span style={{ fontSize: 14, color: 'var(--fg-muted)' }}>{label}</span>
    </div>
  );
}

/* ---------------- Farms ---------------- */
function FarmsScreen({ onOpen }) {
  const [q, setQ] = useStateM('');
  const farms = [
    { name: 'Gowda North Plot', village: 'Channarayapatna', crop: 'Tuberose', area: '1.2 ha', id: 'FARM-118' },
    { name: 'Belur Estate', village: 'Belur', crop: 'Marigold', area: '2.4 ha', id: 'FARM-117' },
    { name: 'Patil Field A', village: 'Sakleshpur', crop: 'Jasmine', area: '0.8 ha', id: 'FARM-116' },
    { name: 'Rao Garden', village: 'Hassan', crop: 'Jasmine', area: '0.9 ha', id: 'FARM-115' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: 'var(--bg)', paddingBottom: 110 }}>
      <PageTop title="Farms" sub="942 mapped · 1,184 ha total" />
      <div style={{ padding: '8px 20px 14px' }}><SearchBar value={q} onChange={setQ} placeholder="Search farm or village" /></div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {farms.filter(f => f.name.toLowerCase().includes(q.toLowerCase())).map((f, i) => (
          <div key={f.id} onClick={onOpen} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, padding: 13, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <PolyThumb seed={i} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{f.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}><Icon name="pin" size={13} color="var(--fg-subtle)" /> {f.village}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '2px 8px', borderRadius: 999 }}>{f.crop}</span>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 999 }}>{f.area}</span>
              </div>
            </div>
            <Icon name="chevR" size={18} color="var(--fg-subtle)" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Register Farmer sheet ---------------- */
function RegisterSheet({ open, onClose, onToast, onContinue }) {
  const [name, setName] = useStateM('');
  const [phone, setPhone] = useStateM('');
  const [village, setVillage] = useStateM('');
  const steps = ['Personal', 'ID proof', 'Bank', 'Consent'];
  return (
    <BottomSheet open={open} onClose={onClose} title="Register farmer">
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 2, background: i === 0 ? 'var(--primary)' : 'var(--border-strong)' }} />
            <div style={{ fontSize: 10.5, fontWeight: 600, color: i === 0 ? 'var(--primary)' : 'var(--fg-subtle)', marginTop: 6 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Lakshmi Gowda" required />
        <Field label="Mobile number" prefix="+91" value={phone} onChange={v => setPhone(v.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" mono required />
        <Field label="Village" value={village} onChange={setVillage} placeholder="e.g. Channarayapatna" required />
        <div>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 8 }}>Association</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['FPO', 'Flower Agent', 'Independent'].map((a, i) => (
              <div key={a} style={{ flex: 1, textAlign: 'center', padding: '11px 4px', borderRadius: 12, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: i === 0 ? '2px solid var(--primary)' : '1.5px solid var(--border)', color: i === 0 ? 'var(--primary)' : 'var(--fg-muted)', background: i === 0 ? 'var(--primary-50)' : 'var(--bg-elevated)' }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Btn kind="primary" size="lg" full icon="arrowR" onClick={() => { onClose(); onContinue && onContinue(); }}>Continue to ID proof</Btn>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-subtle)', marginTop: 12 }}>Saved offline — syncs when you're back online.</p>
      </div>
    </BottomSheet>
  );
}

Object.assign(window, { Dashboard, FarmersScreen, VerifyScreen, FarmsScreen, RegisterSheet, PolyThumb });
