/* ============================================================
   Nesso · Web pages pt.3 — Approvals, Activities, Pre-harvest, Quality (Samples/Audits)
   Exports → window: ApprovalsPage, ActivitiesPage, ActivityDetailPage,
   PreHarvestWebPage, QualityPage
   ============================================================ */
const { useState: useP3 } = React;

/* shared little bits */
function WTabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', overflowX: 'auto', marginBottom: 20 }}>
      {items.map(t => {
        const on = value === t;
        return <button key={t} onClick={() => onChange(t)} style={{ padding: '11px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, fontWeight: on ? 600 : 500, color: on ? 'var(--primary)' : 'var(--fg-muted)', borderBottom: on ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</button>;
      })}
    </div>
  );
}
function MiniStat({ label, value, color = 'var(--primary)', icon }) {
  return (
    <WCard pad={18}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, background: `color-mix(in oklab, ${color} 14%, var(--bg-elevated))`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}><WIcon name={icon} size={20} stroke={2} /></span>
        <div><div className="display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{value}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{label}</div></div>
      </div>
    </WCard>
  );
}

/* ---------------- Approvals ---------------- */
function ApprovalsPage({ onOpen, onToast }) {
  const [tab, setTab] = useP3('Farmers');
  const [sel, setSel] = useP3(null);
  const queue = {
    Farmers: [
      { id: 'FRM-2840', who: 'Ramesh Patil', meta: 'Sakleshpur · Jasmine', age: '2h', risk: 'low' },
      { id: 'FRM-2838', who: 'Suresh Kumar', meta: 'Arsikere · Rose', age: '5h', risk: 'med' },
      { id: 'FRM-2833', who: 'Kavya Shenoy', meta: 'Belur · Tuberose', age: '1d', risk: 'low' },
    ],
    Activities: [{ id: 'ACT-1192', who: 'Spraying · North Plot', meta: '₹640 · Mancozeb', age: '3h', risk: 'low' }],
    Audits: [{ id: 'AUD-220', who: 'Organic compliance', meta: 'Anjali Hegde · 3 files', age: '1d', risk: 'med' }],
  };
  const list = queue[tab] || [];
  const cur = sel || list[0];
  return (
    <div>
      <PageHeader title="Approvals" sub="23 items awaiting your review"
        actions={<><WBtn kind="outline" icon="checkc" onClick={() => onToast('Bulk approved', 'success')}>Approve all low-risk</WBtn></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <MiniStat label="Pending" value="23" icon="clock" color="var(--warning)" />
        <MiniStat label="Approved today" value="48" icon="checkc" color="var(--primary)" />
        <MiniStat label="Rejected" value="3" icon="x" color="var(--danger)" />
        <MiniStat label="Avg. review" value="2.4m" icon="activity" color="#0E7490" />
      </div>
      <WTabs items={['Farmers', 'Activities', 'Audits']} value={tab} onChange={(t) => { setTab(t); setSel(null); }} />
      <div className="split-detail">
        {/* queue list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(it => {
            const on = cur && cur.id === it.id;
            return (
              <button key={it.id} onClick={() => setSel(it)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                background: on ? 'var(--primary-50)' : 'var(--bg-elevated)', border: on ? '1.5px solid var(--primary)' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <WAvatar name={it.who} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.who}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{it.meta}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}><span className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{it.age}</span><span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999, color: it.risk === 'med' ? 'var(--warning)' : 'var(--secondary-d)', background: it.risk === 'med' ? 'var(--warning-bg)' : 'var(--secondary-bg)' }}>{it.risk === 'med' ? 'Review' : 'Low risk'}</span></div>
              </button>
            );
          })}
          {!list.length && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-muted)', fontSize: 14 }}>Queue clear ✓</div>}
        </div>
        {/* detail pane */}
        {cur ? (
          <WCard style={{ alignSelf: 'start', position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <WAvatar name={cur.who} size={52} />
              <div style={{ flex: 1 }}><h3 className="display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)' }}>{cur.who}</h3><div className="mono" style={{ fontSize: 12.5, color: 'var(--fg-subtle)' }}>{cur.id} · {cur.meta}</div></div>
              <StatusPill kind="pending">Pending</StatusPill>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
              {[['Aadhaar', '•••• 4821'], ['Bank', 'HDFC ••32'], ['Documents', '2 files'], ['Submitted by', 'Ravi Teja']].map(([k, v]) => <div key={k}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase' }}>{k}</div><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)', marginTop: 3 }}>{v}</div></div>)}
            </div>
            <div style={{ display: 'flex', gap: 12, paddingTop: 18 }}>
              <WBtn kind="outline" full icon="x" onClick={() => onToast('Rejected', 'error')}>Reject</WBtn>
              <WBtn kind="primary" full icon="checkc" onClick={() => onToast('Approved ✓', 'success')}>Approve</WBtn>
            </div>
          </WCard>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Activities (calendar + list) ---------------- */
function ActivitiesPage({ onOpen }) {
  const [view, setView] = useP3('Calendar');
  const acts = [
    { d: 3, type: 'Spraying', color: 'var(--primary)' }, { d: 8, type: 'Fertilizer', color: '#B6850A' },
    { d: 12, type: 'Irrigation', color: '#0E7490' }, { d: 12, type: 'Weeding', color: 'var(--secondary-d)' },
    { d: 18, type: 'Harvest', color: 'var(--accent)' }, { d: 22, type: 'Spraying', color: 'var(--primary)' }, { d: 27, type: 'Scouting', color: '#9333EA' },
  ];
  const rows = [
    ['Spraying', 'North Plot', 'Mancozeb 75%', '₹640', 'Today', 'approved'],
    ['Irrigation', 'Rao Garden', 'Drip · 2h', '—', 'Today', 'pending'],
    ['Fertilizer', 'North Plot', 'Urea 46% N', '₹240', 'Yesterday', 'approved'],
    ['Weeding', 'Belur Estate', 'Manual', '₹360', '24 May', 'approved'],
    ['Harvest', 'East field', 'Marigold 420kg', '—', '22 May', 'approved'],
  ];
  return (
    <div>
      <PageHeader title="Activities" sub="Field operations across the cluster"
        actions={<><div style={{ display: 'inline-flex', background: 'var(--bg-muted)', borderRadius: 10, padding: 3 }}>{['Calendar', 'List'].map(v => <button key={v} onClick={() => setView(v)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter', background: view === v ? 'var(--bg-elevated)' : 'transparent', color: view === v ? 'var(--primary)' : 'var(--fg-muted)', boxShadow: view === v ? 'var(--shadow-sm)' : 'none' }}>{v}</button>)}</div><WBtn kind="primary" icon="plus">Log activity</WBtn></>} />
      {view === 'Calendar' ? (
        <WCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>May 2026</h3>
            <div style={{ display: 'flex', gap: 7 }}><WBtn kind="outline" size="sm" icon="chevL" /><WBtn kind="outline" size="sm" iconR="chevR" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textAlign: 'center', padding: '4px 0' }}>{d}</div>)}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 2;
              const valid = day >= 1 && day <= 31;
              const dayActs = acts.filter(a => a.d === day);
              const today = day === 29;
              return (
                <div key={i} style={{ minHeight: 74, borderRadius: 10, border: '1px solid var(--border)', background: today ? 'var(--primary-50)' : valid ? 'var(--bg-elevated)' : 'transparent', padding: 7, opacity: valid ? 1 : 0.3 }}>
                  {valid && <div style={{ fontSize: 12, fontWeight: today ? 700 : 500, color: today ? 'var(--primary)' : 'var(--fg-muted)' }}>{day}</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                    {dayActs.slice(0, 2).map((a, j) => <div key={j} style={{ fontSize: 9.5, fontWeight: 600, color: '#fff', background: a.color, borderRadius: 4, padding: '2px 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.type}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </WCard>
      ) : (
        <WCard pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead><tr style={{ background: 'var(--bg-muted)' }}>{['Activity', 'Farm', 'Detail', 'Cost', 'Date', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={i} className="trow" onClick={onOpen} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '13px 16px' }}><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</span></td>
                  <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[1]}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[2]}</td>
                  <td style={{ padding: '13px 16px', fontFamily: 'JetBrains Mono', fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{r[3]}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[4]}</td>
                  <td style={{ padding: '13px 16px' }}><StatusPill kind={r[5]}>{r[5][0].toUpperCase() + r[5].slice(1)}</StatusPill></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </WCard>
      )}
    </div>
  );
}

function ActivityDetailPage() {
  return (
    <div>
      <PageHeader title="Spraying · North Plot" sub="ACT-1192 · 29 May 2026"
        actions={<><WBtn kind="outline" icon="file">Audit log</WBtn><WBtn kind="primary" icon="checkc">Approve</WBtn></>} />
      <div className="profile-grid">
        <WCard style={{ alignSelf: 'start' }}>
          <h3 className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Inputs used</h3>
          {[['Mancozeb 75% WP', '2 kg', '₹640'], ['Labour', '3 hr', '₹270']].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</div><div className="mono" style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{r[1]}</div></div>
              <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{r[2]}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)' }}>Total cost</span>
            <span className="display mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>₹910</span>
          </div>
        </WCard>
        <div>
          <WCard pad={0} style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: 220 }}><MiniMap height="220px" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, padding: 18, borderTop: '1px solid var(--border)' }}>
              {[['Geotag', '13.16°N, 75.86°E'], ['Logged by', 'Ravi Teja'], ['Time', '9:20 AM']].map(([k, v]) => <div key={k}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase' }}>{k}</div><div className={k === 'Geotag' ? 'mono' : ''} style={{ fontSize: k === 'Geotag' ? 12.5 : 14, fontWeight: 600, color: 'var(--fg)', marginTop: 3 }}>{v}</div></div>)}
            </div>
          </WCard>
          <WCard>
            <h3 className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>Photos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary-300), var(--primary))', display: 'grid', placeItems: 'center', color: '#fff', opacity: 0.9 }}><WIcon name="leaf" size={26} /></div>)}
            </div>
          </WCard>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Pre-harvest ---------------- */
function PreHarvestWebPage() {
  return (
    <div>
      <PageHeader title="Pre-harvest" sub="Crop tracking & yield forecast"
        actions={<><WBtn kind="outline" icon="download">Export</WBtn><WBtn kind="primary" icon="plus">New record</WBtn></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <MiniStat label="Crops tracked" value="376" icon="leaf" color="var(--primary)" />
        <MiniStat label="Due ≤7 days" value="18" icon="clock" color="var(--warning)" />
        <MiniStat label="Forecast yield" value="12.4t" icon="wheat" color="#B6850A" />
        <MiniStat label="Avg. days" value="54" icon="activity" color="#0E7490" />
      </div>
      <WCard pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead><tr style={{ background: 'var(--bg-muted)' }}>{['Farmer', 'Farm', 'Crop', 'Stage', 'Harvest in', 'Forecast', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>{[
              ['Lakshmi Gowda', 'North Plot', 'Tuberose', 'Flowering', '8 days', '320 kg', 92],
              ['Geetha Rao', 'Rao Garden', 'Jasmine', 'Flowering', '5 days', '180 kg', 96],
              ['Anjali Hegde', 'Belur Estate', 'Marigold', 'Budding', '22 days', '540 kg', 40],
              ['Prakash Naik', 'East field', 'Marigold', 'Vegetative', '34 days', '420 kg', 22],
            ].map((r, i) => (
              <tr key={i} className="trow" style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '13px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><WAvatar name={r[0]} size={32} /><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</span></div></td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[1]}</td>
                <td style={{ padding: '13px 16px' }}><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '2px 9px', borderRadius: 999 }}>{r[2]}</span></td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[3]}</td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 600, color: i < 2 ? 'var(--warning)' : 'var(--fg-muted)' }}>{r[4]}</td>
                <td style={{ padding: '13px 16px', fontFamily: 'JetBrains Mono', fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{r[5]}</td>
                <td style={{ padding: '13px 16px', width: 120 }}><div style={{ height: 6, borderRadius: 3, background: 'var(--bg-muted)', overflow: 'hidden' }}><div style={{ width: r[6] + '%', height: '100%', background: 'var(--primary)', borderRadius: 3 }} /></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </WCard>
    </div>
  );
}

/* ---------------- Quality (Samples + Audits) ---------------- */
function QualityPage({ onToast }) {
  const [tab, setTab] = useP3('Samples');
  return (
    <div>
      <PageHeader title="Quality" sub="Lab samples & compliance audits"
        actions={<WBtn kind="primary" icon="plus">{tab === 'Samples' ? 'New sample' : 'New audit'}</WBtn>} />
      <WTabs items={['Samples', 'Audits']} value={tab} onChange={setTab} />
      {tab === 'Samples' ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            <MiniStat label="In queue" value="14" icon="clock" color="var(--warning)" />
            <MiniStat label="Sent to lab" value="62" icon="activity" color="#0E7490" />
            <MiniStat label="Grade A rate" value="78%" icon="checkc" color="var(--primary)" />
            <MiniStat label="Rejected" value="6" icon="x" color="var(--danger)" />
          </div>
          <WCard pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                <thead><tr style={{ background: 'var(--bg-muted)' }}>{['Sample', 'Crop', 'Moisture', 'Grade', 'Lab', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>{[
                  ['SMP-1182', 'Tuberose', '12%', 'A', 'Hassan Lab', 'processing'],
                  ['SMP-1181', 'Jasmine', '11%', 'A', 'Hassan Lab', 'approved'],
                  ['SMP-1180', 'Marigold', '14%', 'B', 'Mysuru Lab', 'approved'],
                  ['SMP-1179', 'Rose', '18%', '—', 'Hassan Lab', 'rejected'],
                ].map((r, i) => (
                  <tr key={i} className="trow" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '13px 16px' }}><span className="mono" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</span></td>
                    <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[1]}</td>
                    <td style={{ padding: '13px 16px', fontFamily: 'JetBrains Mono', fontSize: 13.5, color: 'var(--fg)' }}>{r[2]}</td>
                    <td style={{ padding: '13px 16px' }}><span style={{ fontSize: 13, fontWeight: 700, color: r[3] === 'A' ? 'var(--primary)' : r[3] === 'B' ? 'var(--warning)' : 'var(--danger)' }}>{r[3]}</span></td>
                    <td style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[4]}</td>
                    <td style={{ padding: '13px 16px' }}><StatusPill kind={r[5]}>{r[5] === 'processing' ? 'At lab' : r[5][0].toUpperCase() + r[5].slice(1)}</StatusPill></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </WCard>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['AUD-220', 'Organic compliance', 'Anjali Hegde', 3, 'pending'], ['AUD-219', 'GAP checklist', 'Geetha Rao', 2, 'pending'], ['AUD-217', 'Pesticide residue', 'Belur FPO', 4, 'approved']].map(a => (
            <WCard key={a[0]} pad={0} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><WIcon name="shield" size={22} /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{a[1]}</div><div className="mono" style={{ fontSize: 12.5, color: 'var(--fg-subtle)' }}>{a[0]} · {a[2]} · {a[3]} files</div></div>
                {a[4] === 'pending' ? <div style={{ display: 'flex', gap: 10 }}><WBtn kind="outline" size="sm" icon="x" onClick={() => onToast('Rejected', 'error')}>Reject</WBtn><WBtn kind="primary" size="sm" icon="check" onClick={() => onToast('Approved ✓', 'success')}>Approve</WBtn></div> : <StatusPill kind="approved">Approved</StatusPill>}
              </div>
            </WCard>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ApprovalsPage, ActivitiesPage, ActivityDetailPage, PreHarvestWebPage, QualityPage, WTabs, MiniStat });
