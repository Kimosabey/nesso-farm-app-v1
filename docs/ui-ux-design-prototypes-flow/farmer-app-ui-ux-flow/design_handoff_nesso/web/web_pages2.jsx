/* ============================================================
   Nesso · Web pages pt.2 — Farmer profile, Farm, Batch, Reports
   Exports → window: FarmerProfilePage, FarmPage, BatchPage, ReportsPage
   ============================================================ */
const { useState: useP2 } = React;

function Tabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
      {items.map(t => {
        const on = value === t;
        return <button key={t} onClick={() => onChange(t)} style={{ padding: '11px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, fontWeight: on ? 600 : 500, color: on ? 'var(--primary)' : 'var(--fg-muted)', borderBottom: on ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</button>;
      })}
    </div>
  );
}

function Timeline({ steps }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 28 }}>
      <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
      {steps.map((s, i) => (
        <div key={i} style={{ position: 'relative', paddingBottom: i === steps.length - 1 ? 0 : 22 }}>
          <span style={{ position: 'absolute', left: -28, top: 1, width: 20, height: 20, borderRadius: '50%', background: s.done ? 'var(--primary)' : 'var(--bg-elevated)', boxShadow: s.done ? 'none' : 'inset 0 0 0 2px var(--border-strong)', display: 'grid', placeItems: 'center' }}>{s.done && <WIcon name="check" size={12} color="var(--on-primary)" stroke={3} />}</span>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{s.t}</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{s.s}</div>
          {s.time && <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)', marginTop: 3 }}>{s.time}</div>}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, mono }) {
  return <div><div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div><div className={mono ? 'mono' : 'display'} style={{ fontSize: mono ? 15 : 18, fontWeight: 700, color: 'var(--fg)', marginTop: 3 }}>{value}</div></div>;
}

/* ---------------- Farmer profile ---------------- */
function FarmerProfilePage({ onNav }) {
  const [tab, setTab] = useP2('Farms');
  return (
    <div>
      <PageHeader title="Lakshmi Gowda" sub="FRM-2841 · Channarayapatna, Hassan"
        actions={<><WBtn kind="outline" icon="file">Documents</WBtn><WBtn kind="primary" icon="checkc">Approve KYC</WBtn></>} />
      <div className="profile-grid">
        {/* left profile panel */}
        <WCard style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
            <WAvatar name="Lakshmi Gowda" size={76} />
            <h3 className="display" style={{ fontSize: 19, fontWeight: 700, color: 'var(--fg)', marginTop: 12 }}>Lakshmi Gowda</h3>
            <div style={{ marginTop: 8 }}><StatusPill kind="pending">KYC in review</StatusPill></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
            <Row k="Mobile" v="+91 ••••• 4821" />
            <Row k="Association" v="Belur FPO" />
            <Row k="Joined" v="14 Mar 2026" />
            <Row k="Field officer" v="Ravi Teja" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 18 }}>
            <Stat label="Farms" value="3" /><Stat label="Total area" value="4.2 ha" /><Stat label="Active crops" value="2" /><Stat label="Activities" value="38" />
          </div>
        </WCard>
        {/* right tabs */}
        <WCard pad={0}>
          <div style={{ padding: '6px 18px 0' }}><Tabs items={['Farms', 'Crops', 'Activities', 'Samples', 'Documents']} value={tab} onChange={setTab} /></div>
          <div style={{ padding: 20 }}>
            {tab === 'Farms' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {[['North Plot', 'Tuberose', 1.2], ['Roadside field', 'Jasmine', 1.6], ['Lower terrace', 'Marigold', 1.4]].map(([n, c, a], i) => (
                  <div key={n} onClick={() => onNav('farm')} style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-elevated)' }} className="hovcard">
                    <div style={{ height: 96 }}><MiniMap height="96px" /></div>
                    <div style={{ padding: 12 }}><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{n}</div><div style={{ display: 'flex', gap: 6, marginTop: 7 }}><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '2px 8px', borderRadius: 999 }}>{c}</span><span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 999 }}>{a} ha</span></div></div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'Activities' && (
              <Timeline steps={[
                { t: 'Spraying — Mancozeb 75% WP', s: 'North Plot · ₹640 · 2 kg', time: 'Today, 9:20 AM', done: true },
                { t: 'Irrigation — drip, 2 hrs', s: 'Roadside field', time: 'Yesterday', done: true },
                { t: 'Fertilizer — Urea 46% N', s: 'North Plot · ₹240 · 20 kg', time: '24 May 2026', done: true },
                { t: 'Weeding — manual', s: 'Lower terrace · ₹360', time: '21 May 2026', done: true },
              ]} />
            )}
            {tab === 'Crops' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Tuberose', 'Single · North Plot', 'Flowering', 'active'], ['Jasmine', 'Mullai · Roadside field', 'Flowering', 'active'], ['Marigold', 'African · Lower terrace', 'Vegetative', 'active']].map(([c, m, st]) => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px solid var(--border)', borderRadius: 14 }}>
                    <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><WIcon name="leaf" size={22} /></span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{c}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{m}</div></div>
                    <StatusPill kind="active">{st}</StatusPill>
                  </div>
                ))}
              </div>
            )}
            {tab === 'Samples' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'var(--bg-muted)' }}>{['Sample', 'Crop', 'Grade', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>)}</tr></thead>
                <tbody>{[['SMP-1182', 'Tuberose', 'A', 'processing'], ['SMP-1166', 'Jasmine', 'A', 'approved'], ['SMP-1140', 'Marigold', 'B', 'approved']].map(r => (
                  <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</td>
                    <td style={{ padding: '12px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r[1]}</td>
                    <td style={{ padding: '12px' }}><span style={{ fontSize: 13, fontWeight: 700, color: r[2] === 'A' ? 'var(--primary)' : 'var(--warning)' }}>{r[2]}</span></td>
                    <td style={{ padding: '12px' }}><StatusPill kind={r[3]}>{r[3] === 'processing' ? 'At lab' : 'Approved'}</StatusPill></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {tab === 'Documents' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {[['Aadhaar (front)', 'shield', 'verified'], ['Aadhaar (back)', 'shield', 'verified'], ['Bank passbook', 'file', 'pending'], ['Land record', 'file', 'verified'], ['Consent form', 'checkc', 'verified']].map(([n, ic, st]) => (
                  <div key={n} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 14, background: 'var(--bg-elevated)' }}>
                    <div style={{ height: 64, borderRadius: 10, background: 'var(--bg-muted)', display: 'grid', placeItems: 'center', color: 'var(--fg-subtle)', marginBottom: 10 }}><WIcon name={ic} size={26} /></div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{n}</div>
                    <div style={{ marginTop: 6 }}><StatusPill kind={st === 'verified' ? 'approved' : 'pending'}>{st === 'verified' ? 'Verified' : 'In review'}</StatusPill></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </WCard>
      </div>
    </div>
  );
  function Row({ k, v }) { return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{k}</span><span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{v}</span></div>; }
}

/* ---------------- Farm detail ---------------- */
function FarmPage() {
  const [tab, setTab] = useP2('Crops');
  return (
    <div>
      <PageHeader title="North Plot" sub="FARM-118 · Channarayapatna · Lakshmi Gowda"
        actions={<><WBtn kind="outline" icon="download">Export</WBtn><WBtn kind="primary" icon="plus">Add crop</WBtn></>} />
      <WCard pad={0} style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: 280 }}><MiniMap height="280px" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, padding: 20, borderTop: '1px solid var(--border)' }}>
          <Stat label="Area" value="1.2 ha" /><Stat label="Vertices" value="6" mono /><Stat label="Centroid" value="13.16°N, 75.86°E" mono /><Stat label="Crop" value="Tuberose" /><Stat label="Soil" value="Red loam" />
        </div>
      </WCard>
      <WCard pad={0}>
        <div style={{ padding: '6px 18px 0' }}><Tabs items={['Crops', 'Activities', 'Weather', 'Certificates', 'Soil']} value={tab} onChange={setTab} /></div>
        <div style={{ padding: 20 }}>
          {tab === 'Crops' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Tuberose', 'Single', 'Sown 12 Mar', 'Flowering'], ['Marigold', 'African', 'Sown 02 Apr', 'Vegetative']].map(([c, v, d, st]) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px solid var(--border)', borderRadius: 14 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><WIcon name="leaf" size={22} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{c}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{v} · {d}</div></div>
                  <StatusPill kind="active">{st}</StatusPill>
                </div>
              ))}
            </div>
          )}
          {tab === 'Activities' && (
            <Timeline steps={[
              { t: 'Spraying — Mancozeb 75% WP', s: '₹640 · 2 kg · Ravi Teja', time: 'Today, 9:20 AM', done: true },
              { t: 'Irrigation — drip, 2 hrs', s: 'Auto-logged', time: 'Yesterday', done: true },
              { t: 'Fertilizer — Urea 46% N', s: '₹240 · 20 kg', time: '24 May 2026', done: true },
              { t: 'Weeding — manual', s: '₹360 · 3 labourers', time: '21 May 2026', done: true },
            ]} />
          )}
          {tab === 'Weather' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: '#fff', marginBottom: 16 }}>
                <WIcon name="cloud" size={40} color="#fff" stroke={1.6} />
                <div style={{ flex: 1 }}><div className="display" style={{ fontSize: 32, fontWeight: 700 }}>27°</div><div style={{ fontSize: 13, opacity: 0.9 }}>Partly cloudy · spraying window till 4 PM</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10 }}>
                {[['Mon', 28], ['Tue', 31], ['Wed', 28], ['Thu', 25], ['Fri', 24]].map(([d, t]) => (
                  <div key={d} style={{ textAlign: 'center', padding: '12px 4px', borderRadius: 12, border: '1px solid var(--border)' }}><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{d}</div><WIcon name="cloud" size={20} color="var(--secondary-d)" style={{ margin: '7px auto' }} /><div className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{t}°</div></div>
                ))}
              </div>
            </div>
          )}
          {tab === 'Certificates' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {[['India Organic', 'Valid till Mar 2027', 'approved'], ['GAP — Good Agri Practice', 'Valid till Jan 2027', 'approved'], ['Residue test', 'Renewal due', 'pending']].map(([n, d, st]) => (
                <div key={n} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 12 }}><WIcon name="shield" size={20} /></span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', margin: '3px 0 9px' }}>{d}</div>
                  <StatusPill kind={st}>{st === 'approved' ? 'Active' : 'Renew soon'}</StatusPill>
                </div>
              ))}
            </div>
          )}
          {tab === 'Soil' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14 }}>
              {[['Type', 'Red loam'], ['pH', '6.8'], ['Organic carbon', '0.62%'], ['Nitrogen', 'Medium'], ['Phosphorus', 'High'], ['Potassium', 'Medium'], ['Last tested', '14 Apr 2026'], ['EC', '0.4 dS/m']].map(([k, v]) => (
                <div key={k} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase' }}>{k}</div><div className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', marginTop: 4 }}>{v}</div></div>
              ))}
            </div>
          )}
        </div>
      </WCard>
    </div>
  );
}

/* ---------------- Batch detail ---------------- */
function BatchPage() {
  return (
    <div>
      <PageHeader title="BATCH-TBR-0291" sub="Tuberose · Grade A · 320 kg"
        actions={<><WBtn kind="outline" icon="download">Download QR</WBtn><WBtn kind="primary" iconR="arrowUR">View public trace</WBtn></>} />
      <div className="profile-grid">
        <WCard style={{ alignSelf: 'start' }}>
          {/* QR */}
          <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0 18px' }}>
            <div style={{ width: 168, height: 168, borderRadius: 16, background: '#fff', padding: 14, boxShadow: 'var(--shadow-sm)' }}>
              <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges">
                {(() => { const r = []; let s = 7; for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) { if ((x * 7 + y * 13 + x * y) % 3 === 0 || (x < 3 && y < 3) || (x > 10 && y < 3) || (x < 3 && y > 10)) r.push(<rect key={x + '-' + y} x={x * s + 1} y={y * s + 1} width={s - 1} height={s - 1} fill="#0F1A14" />); } return r; })()}
              </svg>
            </div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginTop: 14 }}>nesso.in/t/TBR0291</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, padding: '18px 0 0', borderTop: '1px solid var(--border)' }}>
            <Stat label="Crop" value="Tuberose · Grade A" /><Stat label="Quantity" value="320 kg" /><Stat label="Supplier" value="Belur FPO" /><Stat label="Warehouse" value="Hassan Cold Store" /><div><div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-subtle)', textTransform: 'uppercase' }}>Status</div><div style={{ marginTop: 5 }}><StatusPill kind="processing">In storage</StatusPill></div></div>
          </div>
        </WCard>
        <WCard>
          <h3 className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 20 }}>Stage history</h3>
          <Timeline steps={[
            { t: 'Harvested', s: 'North Plot · Lakshmi Gowda · 320 kg', time: '28 May 2026, 6:40 AM', done: true },
            { t: 'Quality sampled', s: 'Grade A · moisture 12% · passed', time: '28 May 2026, 11:10 AM', done: true },
            { t: 'GRN accepted', s: 'Hassan Cold Store · scanned by Ravi Teja', time: '28 May 2026, 2:15 PM', done: true },
            { t: 'In storage', s: 'Bay C-12 · 4°C', time: 'since 28 May 2026', done: true },
            { t: 'Dispatched', s: 'Awaiting buyer allocation', time: '—', done: false },
          ]} />
        </WCard>
      </div>
    </div>
  );
}

/* ---------------- Reports ---------------- */
function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" sub="Build, preview and export field reports"
        actions={<WBtn kind="primary" icon="download">Run export</WBtn>} />
      <div className="profile-grid">
        <div>
          <WCard style={{ marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>Filters</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {['Report: Pre-harvest', 'Season: 2025–26', 'District: Hassan', 'Crop: Tuberose'].map(c => <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 8px 0 12px', borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary)', fontSize: 12.5, fontWeight: 600 }}>{c}<WIcon name="x" size={14} /></span>)}
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 13px', borderRadius: 999, border: '1.5px dashed var(--border-strong)', background: 'transparent', color: 'var(--fg-muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}><WIcon name="plus" size={14} /> Add filter</button>
            </div>
          </WCard>
          <WCard pad={0}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead><tr style={{ background: 'var(--bg-muted)' }}>{['Farmer', 'Farm', 'Crop', 'Stage', 'Expected yield'].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontSize: 11.5, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[['Lakshmi Gowda', 'North Plot', 'Tuberose', 'Flowering', '320 kg'], ['Anjali Hegde', 'Belur Estate', 'Marigold', 'Budding', '540 kg'], ['Geetha Rao', 'Rao Garden', 'Jasmine', 'Flowering', '180 kg'], ['Prakash Naik', 'East field', 'Marigold', 'Vegetative', '420 kg']].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdc()}><span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{r[0]}</span></td>
                      <td style={tdc()}>{r[1]}</td><td style={tdc()}><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary-d)', background: 'var(--secondary-bg)', padding: '2px 8px', borderRadius: 999 }}>{r[2]}</span></td>
                      <td style={tdc()}>{r[3]}</td><td style={{ ...tdc(), fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--fg)' }}>{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WCard>
        </div>
        {/* export queue */}
        <WCard style={{ alignSelf: 'start' }}>
          <h3 className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Export queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['Pre-harvest · Hassan', 'Ready', 'approved'], ['Activity costs · April', 'Processing', 'processing'], ['Farmer master · all', 'Queued', 'pending']].map(([n, st, k], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, border: '1px solid var(--border)', borderRadius: 13 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--bg-muted)', display: 'grid', placeItems: 'center', color: 'var(--fg-muted)' }}><WIcon name="file" size={18} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{n}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>CSV · just now</div></div>
                {k === 'approved' ? <WBtn kind="outline" size="sm" icon="download">Get</WBtn> : <StatusPill kind={k}>{st}</StatusPill>}
              </div>
            ))}
          </div>
        </WCard>
      </div>
    </div>
  );
  function tdc() { return { padding: '11px 14px', fontSize: 13.5, color: 'var(--fg-muted)' }; }
}

Object.assign(window, { FarmerProfilePage, FarmPage, BatchPage, ReportsPage, Tabs, Timeline });
