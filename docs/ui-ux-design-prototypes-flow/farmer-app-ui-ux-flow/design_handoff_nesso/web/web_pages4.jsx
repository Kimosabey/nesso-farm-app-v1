/* ============================================================
   Nesso · Web pages pt.4 — Procurement, Warehouses, Inventory ledger,
   GRN, QR generator, Settings, Notifications, system (403/404/500)
   Exports → window: ProcurementPage, WarehousesPage, InventoryLedgerPage,
   GrnPage, QrGenPage, SettingsPage, NotificationsPage, SystemPage
   ============================================================ */
const { useState: useP4 } = React;

/* ---------------- Procurement ---------------- */
function ProcurementPage({ onToast }) {
  const [tab, setTab] = useP4('All');
  const rows = [
    ['PRC-882', 'Belur FPO', '320 kg', '₹24,800', 'pending'],
    ['PRC-881', 'Lakshmi Gowda', '180 kg', '₹6,400', 'approved'],
    ['PRC-880', 'Hassan FPO', '540 kg', '₹18,200', 'approved'],
    ['PRC-879', 'Geetha Rao', '90 kg', '₹3,150', 'pending'],
  ];
  const list = rows.filter(r => tab === 'All' || (tab === 'Pending' ? r[4] === 'pending' : r[4] === 'approved'));
  return (
    <div>
      <PageHeader title="Procurement" sub="Payments to farmers & FPOs"
        actions={<><WBtn kind="outline" icon="download">Statement</WBtn><WBtn kind="primary" icon="plus">Record payment</WBtn></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <MiniStat label="Paid this month" value="₹4.2L" icon="checkc" color="var(--primary)" />
        <MiniStat label="Pending" value="₹52k" icon="clock" color="var(--warning)" />
        <MiniStat label="Volume" value="14.2t" icon="box" color="#0E7490" />
        <MiniStat label="Avg. rate" value="₹38/kg" icon="activity" color="#B6850A" />
      </div>
      <WTabs items={['All', 'Pending', 'Paid']} value={tab} onChange={setTab} />
      <WCard pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead><tr style={{ background: 'var(--bg-muted)' }}>{['Ref', 'Payee', 'Quantity', 'Amount', 'Status', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>{list.map((r, i) => (
              <tr key={i} className="trow" style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '13px 16px' }}><span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</span></td>
                <td style={{ padding: '13px 16px' }}><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{r[1]}</span></td>
                <td style={{ padding: '13px 16px', fontFamily: 'JetBrains Mono', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[2]}</td>
                <td style={{ padding: '13px 16px', fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{r[3]}</td>
                <td style={{ padding: '13px 16px' }}><StatusPill kind={r[4]}>{r[4] === 'pending' ? 'Payment due' : 'Paid'}</StatusPill></td>
                <td style={{ padding: '13px 16px' }}>{r[4] === 'pending' ? <WBtn kind="primary" size="sm" onClick={() => onToast('Payment recorded', 'success')}>Pay</WBtn> : <WIcon name="checkc" size={18} color="var(--primary)" />}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </WCard>
    </div>
  );
}

/* ---------------- Warehouses ---------------- */
function WarehousesPage({ onToast }) {
  const houses = [
    { n: 'Hassan Cold Store', cap: 82, used: 'Tuberose, Jasmine', temp: '4°C', bays: 24 },
    { n: 'Belur Collection', cap: 45, used: 'Marigold', temp: 'ambient', bays: 12 },
    { n: 'Mysuru Hub', cap: 67, used: 'Mixed', temp: '6°C', bays: 36 },
  ];
  return (
    <div>
      <PageHeader title="Warehouses" sub="Storage capacity & cold chain"
        actions={<WBtn kind="primary" icon="plus">Add warehouse</WBtn>} />
      <div className="bento">
        {houses.map((h, i) => (
          <WCard key={i} className="c2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--secondary-bg)', color: 'var(--secondary-d)', display: 'grid', placeItems: 'center' }}><WIcon name="box" size={24} /></span>
              <div style={{ flex: 1 }}><h3 className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>{h.n}</h3><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{h.bays} bays · {h.temp}</div></div>
              <span className="pill" style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: 'var(--secondary-bg)', color: 'var(--secondary-d)' }}>{h.used}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}><span style={{ color: 'var(--fg-muted)' }}>Capacity used</span><span style={{ fontWeight: 700, color: h.cap > 75 ? 'var(--warning)' : 'var(--fg)' }}>{h.cap}%</span></div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-muted)', overflow: 'hidden' }}><div style={{ width: h.cap + '%', height: '100%', borderRadius: 4, background: h.cap > 75 ? 'var(--warning)' : 'var(--primary)' }} /></div>
          </WCard>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Inventory ledger ---------------- */
function InventoryLedgerPage({ onOpen }) {
  return (
    <div>
      <PageHeader title="Inventory" sub="Batches, stock & stage movements"
        actions={<><WBtn kind="outline" icon="qr" onClick={onOpen}>QR generator</WBtn><WBtn kind="primary" icon="plus">New GRN</WBtn></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <MiniStat label="Active batches" value="34" icon="box" color="var(--primary)" />
        <MiniStat label="In storage" value="9.4t" icon="box" color="#0E7490" />
        <MiniStat label="Dispatched" value="4.8t" icon="activity" color="var(--secondary-d)" />
        <MiniStat label="Cold chain OK" value="100%" icon="checkc" color="var(--primary)" />
      </div>
      <WCard pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 740 }}>
            <thead><tr style={{ background: 'var(--bg-muted)' }}>{['Batch', 'Crop', 'Qty', 'Stage', 'Warehouse', 'Updated', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>{[
              ['BATCH-TBR-0291', 'Tuberose · A', '320 kg', 'In storage', 'Hassan Cold', '2h', 'processing'],
              ['BATCH-JAS-0288', 'Jasmine · A', '180 kg', 'Stored', 'Hassan Cold', '5h', 'approved'],
              ['BATCH-MAR-0285', 'Marigold · B', '540 kg', 'Dispatched', 'Belur', '1d', 'approved'],
              ['BATCH-ROS-0280', 'Rose · A', '95 kg', 'Processing', 'Mysuru Hub', '2d', 'processing'],
            ].map((r, i) => (
              <tr key={i} className="trow" onClick={onOpen} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '13px 16px' }}><span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</span></td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[1]}</td>
                <td style={{ padding: '13px 16px', fontFamily: 'JetBrains Mono', fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{r[2]}</td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[3]}</td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[4]}</td>
                <td style={{ padding: '13px 16px', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: 'var(--fg-subtle)' }}>{r[5]}</td>
                <td style={{ padding: '13px 16px' }}><WIcon name="chevR" size={17} color="var(--fg-subtle)" /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </WCard>
    </div>
  );
}

/* ---------------- QR generator ---------------- */
function QrGenPage({ onToast }) {
  const [batch, setBatch] = useP4('BATCH-TBR-0291');
  return (
    <div>
      <PageHeader title="QR generator" sub="Create trace labels for batches" />
      <div className="profile-grid">
        <WCard>
          <h3 className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Label settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginBottom: 7 }}>Batch</span>
              <select value={batch} onChange={e => setBatch(e.target.value)} style={{ width: '100%', height: 46, borderRadius: 12, border: 'none', boxShadow: 'inset 0 0 0 1.5px var(--border-strong)', background: 'var(--bg-elevated)', padding: '0 14px', fontSize: 14.5, color: 'var(--fg)', fontFamily: 'Inter' }}>
                <option>BATCH-TBR-0291</option><option>BATCH-JAS-0288</option><option>BATCH-MAR-0285</option>
              </select>
            </label>
            <div><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginBottom: 8 }}>Label size</span>
              <div style={{ display: 'flex', gap: 8 }}>{['40mm', '60mm', '80mm'].map((s, i) => <div key={s} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: i === 1 ? '2px solid var(--primary)' : '1.5px solid var(--border)', color: i === 1 ? 'var(--primary)' : 'var(--fg-muted)', background: i === 1 ? 'var(--primary-50)' : 'var(--bg-elevated)' }}>{s}</div>)}</div>
            </div>
            <WBtn kind="primary" size="lg" full icon="download" onClick={() => onToast('Label PDF generated', 'success')}>Generate & download</WBtn>
          </div>
        </WCard>
        <WCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Preview</div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
            <div style={{ width: 180, height: 180 }}>
              <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges">
                {(() => { const r = []; const s = 100 / 16; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if ((x * 5 + y * 11 + x * y * 3) % 3 === 0 || (x < 3 && y < 3) || (x > 12 && y < 3) || (x < 3 && y > 12)) r.push(<rect key={x + '-' + y} x={x * s} y={y * s} width={s} height={s} fill="#0F1A14" />); } return r; })()}
              </svg>
            </div>
            <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: '#0F1A14', marginTop: 12 }}>{batch}</div>
            <div style={{ fontSize: 10, color: '#4A5A52', marginTop: 2 }}>nesso.in/t/{batch.replace('BATCH-', '').replace('-', '')}</div>
          </div>
        </WCard>
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsPage({ theme, onToast }) {
  const [tab, setTab] = useP4('Users & roles');
  const users = [
    ['Ravi Teja', 'ravi@nesso.in', 'Field Officer', 'active'],
    ['Priya Nair', 'priya@nesso.in', 'Admin', 'active'],
    ['Karan Shah', 'karan@nesso.in', 'Verifier', 'active'],
    ['Meera Iyer', 'meera@nesso.in', 'Field Officer', 'invited'],
  ];
  return (
    <div>
      <PageHeader title="Settings" sub="Workspace configuration" />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 22, alignItems: 'start' }} className="settings-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Users & roles', 'Catalogs', 'Preferences', 'Audit log', 'Organization'].map(t => {
            const on = tab === t;
            return <button key={t} onClick={() => setTab(t)} style={{ textAlign: 'left', padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, fontWeight: on ? 600 : 500, background: on ? 'var(--primary-50)' : 'transparent', color: on ? 'var(--primary)' : 'var(--fg-muted)' }}>{t}</button>;
          })}
        </div>
        <div>
          {tab === 'Users & roles' && (
            <WCard pad={0} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                <h3 className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>Team members</h3>
                <WBtn kind="primary" size="sm" icon="plus" onClick={() => onToast('Invite sent', 'success')}>Invite</WBtn>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <tbody>{users.map((u, i) => (
                    <tr key={i} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '13px 18px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><WAvatar name={u[0]} size={36} /><div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{u[0]}</div><div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{u[1]}</div></div></div></td>
                      <td style={{ padding: '13px 18px' }}><span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '3px 10px', borderRadius: 999 }}>{u[2]}</span></td>
                      <td style={{ padding: '13px 18px' }}><StatusPill kind={u[3] === 'active' ? 'approved' : 'pending'}>{u[3] === 'active' ? 'Active' : 'Invited'}</StatusPill></td>
                      <td style={{ padding: '13px 18px', textAlign: 'right' }}><WIcon name="dots" size={18} color="var(--fg-subtle)" /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </WCard>
          )}
          {tab === 'Catalogs' && (
            <div className="bento">
              {[['Crops', '12', 'leaf'], ['Inputs', '184', 'drop'], ['Activity types', '9', 'activity'], ['Grades', '4', 'checkc']].map(([n, c, ic]) => (
                <WCard key={n} className="c2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><WIcon name={ic} size={20} /></span>
                    <div style={{ flex: 1 }}><div className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)' }}>{c}</div><div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{n}</div></div>
                    <WBtn kind="outline" size="sm" iconR="chevR">Manage</WBtn>
                  </div>
                </WCard>
              ))}
            </div>
          )}
          {tab === 'Preferences' && (
            <WCard pad={0} style={{ overflow: 'hidden' }}>
              {[['Theme', theme === 'dark' ? 'Dark' : 'Light'], ['Language', 'English'], ['Default season', '2025–26'], ['Date format', 'DD MMM YYYY'], ['Currency', '₹ INR']].map(([k, v], i) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{k}</span><span style={{ fontSize: 14, color: 'var(--fg-muted)' }}>{v} ›</span></div>
              ))}
            </WCard>
          )}
          {tab === 'Audit log' && (
            <WCard pad={0} style={{ overflow: 'hidden' }}>
              {[['Priya Nair', 'approved FRM-2839', '12m'], ['Ravi Teja', 'logged ACT-1192', '1h'], ['Karan Shah', 'rejected FRM-2836', '3h'], ['System', 'synced 12 records', '5h'], ['Priya Nair', 'invited meera@nesso.in', '1d']].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                  <WAvatar name={r[0]} size={32} />
                  <div style={{ flex: 1 }}><span style={{ fontSize: 13.5, color: 'var(--fg)' }}><b style={{ fontWeight: 600 }}>{r[0]}</b> {r[1]}</span></div>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{r[2]}</span>
                </div>
              ))}
            </WCard>
          )}
          {tab === 'Organization' && (
            <WCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)' }}><img src="assets/nesso-logo.jpeg" alt="" style={{ width: 42, height: 42 }} /></div>
                <div><h3 className="display" style={{ fontSize: 19, fontWeight: 700, color: 'var(--fg)' }}>NR Group</h3><div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Hassan, Karnataka · Horticulture</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, paddingTop: 18 }}>
                {[['Plan', 'Enterprise'], ['Members', '14'], ['Clusters', '3'], ['Since', 'Jan 2026']].map(([k, v]) => <div key={k}><div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase' }}>{k}</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginTop: 3 }} className="display">{v}</div></div>)}
              </div>
            </WCard>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Notifications ---------------- */
function NotificationsPage() {
  const groups = [
    { g: 'Today', items: [['checkc', 'var(--primary)', 'KYC approved', 'Anjali Hegde is now verified', '12m', true], ['cloud', '#0E7490', 'Weather alert', 'Rain expected tomorrow', '1h', true], ['box', '#B6850A', 'GRN accepted', 'BATCH-TBR-0291 · 320 kg', '3h', false]] },
    { g: 'Earlier', items: [['sync', 'var(--secondary-d)', 'Sync complete', '48 records synced', '1d', false], ['x', 'var(--danger)', 'Approval rejected', 'Vijay Shetty — Aadhaar mismatch', '2d', false]] },
  ];
  return (
    <div>
      <PageHeader title="Notifications" actions={<WBtn kind="outline" icon="check">Mark all read</WBtn>} />
      <div style={{ maxWidth: 640 }}>
        {groups.map(grp => (
          <div key={grp.g} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', marginBottom: 10 }}>{grp.g}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grp.items.map((n, i) => (
                <WCard key={i} pad={15}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 11, background: `color-mix(in oklab, ${n[1]} 14%, var(--bg-elevated))`, color: n[1], display: 'grid', placeItems: 'center', flexShrink: 0 }}><WIcon name={n[0]} size={19} stroke={2} /></span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{n[2]}</div><div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 1 }}>{n[3]}</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}><span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{n[4]}</span>{n[5] && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}</div>
                  </div>
                </WCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- System pages (403/404/500) ---------------- */
function SystemPage({ code = '404', onHome }) {
  const map = {
    '403': ['shield', 'Access denied', "You don't have permission to view this page. Ask an admin for access."],
    '404': ['search', 'Page not found', "The page you're looking for doesn't exist or was moved."],
    '500': ['alert', 'Something broke', 'An unexpected error occurred. Our team has been notified.'],
  };
  const [ic, title, desc] = map[code] || map['404'];
  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
          <span className="display" style={{ fontSize: 120, fontWeight: 700, color: 'var(--bg-muted)', letterSpacing: '-0.04em', lineHeight: 1 }}>{code}</span>
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 64, height: 64, borderRadius: 18, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><WIcon name={ic} size={32} /></span>
        </div>
        <h2 className="display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--fg)' }}>{title}</h2>
        <p style={{ fontSize: 15, color: 'var(--fg-muted)', marginTop: 10, lineHeight: 1.5 }}>{desc}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 26 }}>
          <WBtn kind="outline" icon="chevL" onClick={onHome}>Go back</WBtn>
          <WBtn kind="primary" icon="grid" onClick={onHome}>Dashboard</WBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProcurementPage, WarehousesPage, InventoryLedgerPage, QrGenPage, SettingsPage, NotificationsPage, SystemPage });
