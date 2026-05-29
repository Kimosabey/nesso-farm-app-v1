/* ============================================================
   Nesso · Web pages pt.1 — Login, Dashboard (bento), Farmers
   Exports → window: LoginPage, DashboardPage, FarmersPage, PageHeader, FARMERS_W
   ============================================================ */
const { useState: useP } = React;

const FARMERS_W = [
  { name: 'Lakshmi Gowda', village: 'Channarayapatna', district: 'Hassan', crop: 'Tuberose', area: 1.2, status: 'approved', kyc: 'Verified', id: 'FRM-2841' },
  { name: 'Ramesh Patil', village: 'Sakleshpur', district: 'Hassan', crop: 'Jasmine', area: 0.8, status: 'pending', kyc: 'In review', id: 'FRM-2840' },
  { name: 'Anjali Hegde', village: 'Belur', district: 'Hassan', crop: 'Marigold', area: 2.4, status: 'approved', kyc: 'Verified', id: 'FRM-2839' },
  { name: 'Suresh Kumar', village: 'Arsikere', district: 'Hassan', crop: 'Rose', area: 1.0, status: 'pending', kyc: 'In review', id: 'FRM-2838' },
  { name: 'Manjula Devi', village: 'Holenarasipura', district: 'Hassan', crop: 'Davana', area: 0.6, status: 'approved', kyc: 'Verified', id: 'FRM-2837' },
  { name: 'Vijay Shetty', village: 'Alur', district: 'Hassan', crop: 'Tuberose', area: 1.5, status: 'rejected', kyc: 'Failed', id: 'FRM-2836' },
  { name: 'Geetha Rao', village: 'Hassan', district: 'Hassan', crop: 'Jasmine', area: 0.9, status: 'approved', kyc: 'Verified', id: 'FRM-2835' },
  { name: 'Prakash Naik', village: 'Channarayapatna', district: 'Hassan', crop: 'Marigold', area: 1.1, status: 'approved', kyc: 'Verified', id: 'FRM-2834' },
];

function PageHeader({ title, sub, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
      <div>
        <h1 className="display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{title}</h1>
        {sub && <p style={{ fontSize: 14.5, color: 'var(--fg-muted)', marginTop: 5 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

/* ---------------- Login ---------------- */
function LoginPage({ theme, onToggleTheme, onLogin, onBack }) {
  const [email, setEmail] = useP('admin@nesso.in');
  const [pw, setPw] = useP('');
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr', placeItems: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* aurora */}
      <div className="aurora-bg" aria-hidden="true"><i></i></div>
      <button onClick={onToggleTheme} style={{ position: 'absolute', top: 22, right: 22, width: 40, height: 40, borderRadius: 11, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--fg)', display: 'grid', placeItems: 'center', backdropFilter: 'blur(10px)', zIndex: 3 }}><WIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /></button>
      {onBack && <button onClick={onBack} style={{ position: 'absolute', top: 22, left: 22, height: 40, padding: '0 14px', borderRadius: 11, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', gap: 7, backdropFilter: 'blur(10px)', zIndex: 3, fontFamily: 'Inter', fontSize: 13.5, fontWeight: 600 }}><WIcon name="chevL" size={16} /> Back</button>}
      <div style={{ position: 'relative', zIndex: 2, width: 'min(420px, 92vw)', background: 'var(--glass-bg)', backdropFilter: 'blur(22px) saturate(1.3)', WebkitBackdropFilter: 'blur(22px) saturate(1.3)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 'clamp(28px, 5vw, 42px)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-md)', marginBottom: 24 }}><img src="assets/nesso-logo.jpeg" alt="Nesso" style={{ width: 40, height: 40 }} /></div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>Welcome back</h1>
        <p style={{ fontSize: 14.5, color: 'var(--fg-muted)', marginTop: 8 }}>Sign in to the Nesso admin dashboard.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginBottom: 7 }}>Email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inp()} />
          </label>
          <label style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)' }}>Password</span><span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Forgot?</span></div>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••••" style={inp()} />
          </label>
          <WBtn kind="primary" size="lg" full iconR="arrowUR" onClick={onLogin} style={{ marginTop: 6 }}>Sign in</WBtn>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--fg-subtle)', textAlign: 'center', marginTop: 22, lineHeight: 1.5 }}>Protected by Nesso. Staff access only.<br />Field officers — use the mobile app with OTP.</p>
      </div>
    </div>
  );
  function inp() { return { width: '100%', height: 48, borderRadius: 12, border: 'none', boxShadow: 'inset 0 0 0 1.5px var(--border-strong)', background: 'var(--bg-elevated)', padding: '0 15px', fontSize: 15, color: 'var(--fg)', fontFamily: 'Inter', outline: 'none' }; }
}

/* ---------------- Dashboard (bento) ---------------- */
function FeedRow({ icon, color, t, s, time, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: `color-mix(in oklab, ${color} 14%, var(--bg-elevated))`, display: 'grid', placeItems: 'center', color, flexShrink: 0 }}><WIcon name={icon} size={16} stroke={2} /></span>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s}</div></div>
      <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)', flexShrink: 0 }}>{time}</span>
    </div>
  );
}

function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" sub="Hassan cluster · 2025–26 season"
        actions={<>
          <WBtn kind="outline" icon="filter">2025–26</WBtn>
          <WBtn kind="outline" icon="download">Export</WBtn>
          <WBtn kind="primary" icon="plus">Register farmer</WBtn>
        </>} />
      <div className="bento">
        <KpiW label="Farmers" value={1284} delta={12} icon="users" color="var(--primary)" spark={[3,5,4,6,7,8,10,11]} />
        <KpiW label="Farms mapped" value={942} delta={8} icon="map" color="var(--secondary-d)" spark={[2,3,3,5,6,6,8,9]} />
        <KpiW label="Active crops" value={376} delta={5} icon="leaf" color="#0E7490" spark={[5,4,5,6,6,7,7,8]} />
        <KpiW label="Pending approvals" value={23} suffix="" delta={-4} icon="clock" color="var(--warning)" spark={[8,7,6,7,5,5,4,3]} />

        {/* map */}
        <WCard className="c2 r2" span={null} style={{ display: 'flex', flexDirection: 'column' }} pad={0}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px' }}>
            <div><h3 className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>Farm distribution</h3><p style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>942 farms · 5 talukas</p></div>
            <WBtn kind="ghost" size="sm" iconR="arrowUR">Open map</WBtn>
          </div>
          <div style={{ flex: 1, padding: '0 16px 16px', minHeight: 260 }}><MiniMap /></div>
        </WCard>

        {/* activity progress donut */}
        <WCard className="c2">
          <h3 className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Activity progress</h3>
          <Donut center="68%" sub="complete" total={100}
            segments={[{ label: 'Completed', v: 68, color: 'var(--primary)' }, { label: 'In progress', v: 21, color: 'var(--accent)' }, { label: 'Overdue', v: 11, color: 'var(--danger)' }]} />
        </WCard>

        {/* practices bar */}
        <WCard className="c2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}><h3 className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>Activities logged</h3><span style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>last 6 months</span></div>
          <Bars data={[{ k: 'Dec', v: 120 }, { k: 'Jan', v: 180 }, { k: 'Feb', v: 150 }, { k: 'Mar', v: 240 }, { k: 'Apr', v: 300, hi: true }, { k: 'May', v: 210 }]} />
        </WCard>

        {/* farmer groups donut */}
        <WCard className="c2">
          <h3 className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Farmer associations</h3>
          <Donut center="1,284" sub="farmers" size={168} total={1284}
            segments={[{ label: 'FPO', v: 642, color: 'var(--primary)' }, { label: 'Flower agent', v: 388, color: 'var(--secondary-d)' }, { label: 'Independent', v: 254, color: '#0E7490' }]} />
        </WCard>

        {/* recent activity */}
        <WCard className="c2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><h3 className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>Recent activity</h3><WBtn kind="ghost" size="sm">See all</WBtn></div>
          <FeedRow icon="users" color="var(--primary)" t="Lakshmi Gowda registered" s="Channarayapatna · KYC pending" time="12m" />
          <FeedRow icon="activity" color="#0E7490" t="Spraying logged · ₹1,240" s="Farm FRM-2839 · Mancozeb" time="1h" />
          <FeedRow icon="map" color="var(--secondary-d)" t="2.4 ha farm mapped" s="Belur · 6 vertices" time="3h" />
          <FeedRow icon="box" color="#B6850A" t="GRN accepted · 320 kg" s="BATCH-TBR-0291 · Belur FPO" time="5h" last />
        </WCard>

        {/* weather */}
        <WCard className="c2" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: '#fff', border: 'none', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(241,212,18,0.25)', filter: 'blur(22px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.9 }}><WIcon name="pin" size={14} /> Hassan, Karnataka</div>
                <div className="display" style={{ fontSize: 40, fontWeight: 700, marginTop: 6, letterSpacing: '-0.02em' }}>27°</div>
                <div style={{ fontSize: 13.5, opacity: 0.9 }}>Partly cloudy · spraying window till 4 PM</div></div>
              <WIcon name="cloud" size={40} color="#fff" stroke={1.6} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {[['Mon', 28], ['Tue', 26], ['Wed', 24], ['Thu', 27], ['Fri', 29]].map(([d, t]) => (
                <div key={d} style={{ flex: 1, background: 'rgba(255,255,255,0.16)', borderRadius: 10, padding: '9px 4px', textAlign: 'center' }}><div style={{ fontSize: 11, opacity: 0.85 }}>{d}</div><div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{t}°</div></div>
              ))}
            </div>
          </div>
        </WCard>
      </div>
    </div>
  );
}

/* ---------------- Farmers (DataTable) ---------------- */
function FarmersPage({ onOpen }) {
  const [sel, setSel] = useP([]);
  const [q, setQ] = useP('');
  const [chips, setChips] = useP(['District: Hassan']);
  const rows = FARMERS_W.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || f.village.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const allSel = rows.length && sel.length === rows.length;
  return (
    <div>
      <PageHeader title="Farmers" sub="1,284 farmers in the Hassan cluster"
        actions={<><WBtn kind="outline" icon="download">Export CSV</WBtn><WBtn kind="primary" icon="plus" onClick={() => onOpen('new')}>Register farmer</WBtn></>} />

      {/* filter builder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 40, padding: '0 13px', borderRadius: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', minWidth: 240, flex: '1 1 240px', maxWidth: 360 }}>
          <WIcon name="search" size={17} color="var(--fg-subtle)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search farmers…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--fg)', fontFamily: 'Inter' }} />
        </div>
        {chips.map(c => <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 8px 0 12px', borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>{c}<button onClick={() => setChips(cs => cs.filter(x => x !== c))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', display: 'grid', placeItems: 'center', padding: 0 }}><WIcon name="x" size={15} /></button></span>)}
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 13px', borderRadius: 999, border: '1.5px dashed var(--border-strong)', background: 'transparent', color: 'var(--fg-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}><WIcon name="plus" size={15} /> Add filter</button>
      </div>

      {/* bulk bar */}
      {sel.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 12, background: 'var(--primary-50)', border: '1px solid color-mix(in oklab, var(--primary) 25%, transparent)', marginBottom: 14 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary)' }}>{sel.length} selected</span>
          <div style={{ flex: 1 }} />
          <WBtn kind="outline" size="sm" icon="checkc">Approve</WBtn>
          <WBtn kind="outline" size="sm" icon="download">Export</WBtn>
          <button onClick={() => setSel([])} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 13, fontWeight: 600, fontFamily: 'Inter' }}>Clear</button>
        </div>
      )}

      <WCard pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: 'var(--bg-muted)' }}>
                <th style={th(50)}><input type="checkbox" checked={!!allSel} onChange={() => setSel(allSel ? [] : rows.map(r => r.id))} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} /></th>
                <th style={th()}>Farmer</th><th style={th()}>Village</th><th style={th()}>Crop</th><th style={th(90)}>Area</th><th style={th()}>Status</th><th style={th()}>KYC</th><th style={th(50)}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(f => {
                const on = sel.includes(f.id);
                return (
                  <tr key={f.id} className="trow" onClick={() => onOpen(f.id)} style={{ cursor: 'pointer', background: on ? 'var(--primary-50)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                    <td style={td()} onClick={e => { e.stopPropagation(); toggle(f.id); }}><input type="checkbox" checked={on} onChange={() => {}} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} /></td>
                    <td style={td()}><div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><WAvatar name={f.name} size={34} /><div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{f.name}</div><div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{f.id}</div></div></div></td>
                    <td style={td()}><div style={{ fontSize: 13.5, color: 'var(--fg)' }}>{f.village}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{f.district}</div></td>
                    <td style={td()}><span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '3px 9px', borderRadius: 999 }}>{f.crop}</span></td>
                    <td style={{ ...td(), fontFamily: 'JetBrains Mono', fontSize: 13.5, color: 'var(--fg)' }}>{f.area} ha</td>
                    <td style={td()}><StatusPill kind={f.status}>{f.status[0].toUpperCase() + f.status.slice(1)}</StatusPill></td>
                    <td style={{ ...td(), fontSize: 13, color: f.kyc === 'Failed' ? 'var(--danger)' : 'var(--fg-muted)' }}>{f.kyc}</td>
                    <td style={td()}><WIcon name="chevR" size={17} color="var(--fg-subtle)" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Showing <b style={{ color: 'var(--fg)' }}>{rows.length}</b> of 1,284</span>
          <div style={{ display: 'flex', gap: 7 }}><WBtn kind="outline" size="sm" icon="chevL">Prev</WBtn><WBtn kind="outline" size="sm" iconR="chevR">Next</WBtn></div>
        </div>
      </WCard>
    </div>
  );
  function th(w) { return { textAlign: 'left', padding: '12px 14px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--fg-subtle)', textTransform: 'uppercase', width: w, whiteSpace: 'nowrap' }; }
  function td() { return { padding: '12px 14px', verticalAlign: 'middle' }; }
}

Object.assign(window, { LoginPage, DashboardPage, FarmersPage, PageHeader, FARMERS_W });
