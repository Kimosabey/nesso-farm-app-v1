/* ============================================================
   Nesso · Mobile B4 — Post-harvest hub, Samples, Audit, Procurement,
   Batches, Inventory, Location, Offline Map
   Exports → window: PostHarvestScreen, SampleBoardScreen, AuditScreen,
   ProcurementScreen, BatchesScreen, InventoryScreen, LocationScreen, OfflineMapScreen
   ============================================================ */
const { useState: useQ1 } = React;

function PostHarvestScreen({ onBack, onNav }) {
  const tiles = [
    { id: 'batches', ic: 'box', c: 'var(--primary)', t: 'Batches', s: '34 active · 3 grades' },
    { id: 'inventory', ic: 'box', c: 'var(--secondary-d)', t: 'Inventory', s: 'Sell · transfer · process' },
    { id: 'grn', ic: 'scan', c: '#B6850A', t: 'Accept GRN', s: 'Scan incoming goods' },
    { id: 'procurement', ic: 'file', c: '#0E7490', t: 'Procurement', s: '12 pending payments' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Post-harvest" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {tiles.map(t => (
            <button key={t.id} onClick={() => onNav(t.id)} style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 18, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 130 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: `color-mix(in oklab, ${t.c} 14%, var(--bg-elevated))`, color: t.c, display: 'grid', placeItems: 'center' }}><Icon name={t.ic} size={24} stroke={1.9} /></span>
              <div><div className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>{t.t}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{t.s}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SampleBoardScreen({ onBack, onToast }) {
  const [tab, setTab] = useQ1('Queue');
  const samples = [
    { code: 'SMP-1182', crop: 'Tuberose · A', st: 'pending', tab: 'Queue' },
    { code: 'SMP-1181', crop: 'Jasmine · A', st: 'pending', tab: 'Queue' },
    { code: 'SMP-1180', crop: 'Marigold · B', st: 'approved', tab: 'Sent' },
  ];
  const list = samples.filter(s => s.tab === tab);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Samples" onBack={onBack} right={<button onClick={() => onToast('New sample', 'sync')} style={{ border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 999, width: 34, height: 34, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="plus" size={18} stroke={2.4} /></button>} />
      <div style={{ padding: '12px 0 14px' }}><MTabs items={['Queue', 'Sent']} value={tab} onChange={setTab} /></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(s => (
          <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--bg-muted)', color: 'var(--fg-muted)', display: 'grid', placeItems: 'center' }}><Icon name="drop" size={20} /></span>
            <div style={{ flex: 1 }}><div className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{s.code}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{s.crop}</div></div>
            <button onClick={() => onToast(`${s.code} copied`, 'sync')} style={{ border: 'none', background: 'transparent', color: 'var(--fg-subtle)', cursor: 'pointer', padding: 6 }}><Icon name="edit" size={16} /></button>
            <StatusChip kind={s.st}>{s.st === 'pending' ? 'In queue' : 'Sent'}</StatusChip>
          </div>
        ))}
        {!list.length && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-muted)', fontSize: 14 }}>No samples here.</div>}
      </div>
    </div>
  );
}

function AuditScreen({ onBack, onToast }) {
  const [tab, setTab] = useQ1('Pending');
  const audits = [
    { id: 'AUD-220', who: 'Anjali Hegde', what: 'Organic compliance', files: 3, st: 'pending' },
    { id: 'AUD-219', who: 'Geetha Rao', what: 'GAP checklist', files: 2, st: 'pending' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Audits" onBack={onBack} />
      <div style={{ padding: '12px 0 14px' }}><MTabs items={['Pending', 'Approved', 'Rejected']} value={tab} onChange={setTab} /></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(tab === 'Pending' ? audits : []).map(a => (
          <div key={a.id} style={{ background: 'var(--bg-elevated)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 15 }}>
              <Avatar name={a.who} size={44} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{a.what}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{a.who} · {a.id}</div></div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-50)', padding: '3px 9px', borderRadius: 999 }}>{a.files} files</span>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: 13, borderTop: '1px solid var(--border)' }}>
              <Btn kind="outline" size="sm" full icon="x" onClick={() => onToast('Audit rejected', 'error')}>Reject</Btn>
              <Btn kind="primary" size="sm" full icon="check" onClick={() => onToast('Audit approved ✓', 'success')}>Approve</Btn>
            </div>
          </div>
        ))}
        {tab !== 'Pending' && <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--fg-muted)', fontSize: 14 }}>No {tab.toLowerCase()} audits.</div>}
      </div>
    </div>
  );
}

function ProcurementScreen({ onBack, onToast }) {
  const [f, setF] = useQ1('All');
  const rows = [
    { id: 'PRC-882', who: 'Belur FPO', amt: 24800, st: 'pending' },
    { id: 'PRC-881', who: 'Lakshmi Gowda', amt: 6400, st: 'approved' },
    { id: 'PRC-880', who: 'Hassan FPO', amt: 18200, st: 'approved' },
  ];
  const list = rows.filter(r => f === 'All' || (f === 'Pending' ? r.st === 'pending' : r.st === 'approved'));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Procurement" onBack={onBack} />
      <div style={{ padding: '12px 0 14px' }}><MTabs items={['All', 'Pending', 'Paid']} value={f} onChange={setF} /></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 15 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{r.who}</div><div className="mono" style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{r.id}</div></div>
            <div style={{ textAlign: 'right' }}><div className="display mono" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>₹{r.amt.toLocaleString()}</div><div style={{ marginTop: 4 }}><StatusChip kind={r.st}>{r.st === 'pending' ? 'Payment due' : 'Paid'}</StatusChip></div></div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px 36px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--glass-border)' }}>
        <Btn kind="primary" size="lg" full icon="plus" onClick={() => onToast('Record procurement', 'sync')}>Record procurement</Btn>
      </div>
    </div>
  );
}

function BatchesScreen({ onBack, onNav, onToast }) {
  const [view, setView] = useQ1('Batch');
  const batches = [
    { id: 'BATCH-TBR-0291', crop: 'Tuberose · A', kg: 320, st: 'processing' },
    { id: 'BATCH-JAS-0288', crop: 'Jasmine · A', kg: 180, st: 'approved' },
    { id: 'BATCH-MAR-0285', crop: 'Marigold · B', kg: 540, st: 'approved' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Batches" onBack={onBack} right={<div style={{ paddingRight: 4 }}><Seg options={['Order', 'Batch']} value={view} onChange={setView} /></div>} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {batches.map(b => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name="box" size={22} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div className="mono" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{b.id}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{b.crop} · {b.kg} kg</div></div>
            <StatusChip kind={b.st === 'processing' ? 'pending' : 'approved'}>{b.st === 'processing' ? 'In storage' : 'Stored'}</StatusChip>
          </div>
        ))}
      </div>
      <button onClick={() => onNav('grn')} aria-label="Scan GRN" style={{ position: 'absolute', right: 18, bottom: 30, width: 60, height: 60, borderRadius: '50%', border: 'none', background: 'linear-gradient(180deg, var(--primary), var(--primary-2))', color: 'var(--on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 10px 26px -6px var(--glow)' }}><Icon name="scan" size={26} stroke={2} /></button>
    </div>
  );
}

function InventoryScreen({ onBack, onToast }) {
  const [sheet, setSheet] = useQ1(false);
  const [stage, setStage] = useQ1('Sell');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Inventory" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[['BATCH-TBR-0291', 'Tuberose · A', '320 kg', 'In storage'], ['BATCH-JAS-0288', 'Jasmine · A', '180 kg', 'Stored'], ['BATCH-MAR-0285', 'Marigold · B', '540 kg', 'Stored']].map((b, i) => (
          <button key={i} onClick={() => setSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 14, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--secondary-bg)', color: 'var(--secondary-d)', display: 'grid', placeItems: 'center' }}><Icon name="box" size={22} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div className="mono" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>{b[0]}</div><div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{b[1]} · {b[2]}</div></div>
            <Icon name="chevR" size={18} color="var(--fg-subtle)" />
          </button>
        ))}
      </div>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Move inventory">
        <div style={{ marginBottom: 16 }}><Seg options={['Sell', 'Transfer', 'Process']} value={stage} onChange={setStage} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Quantity (kg)" value="320" onChange={() => {}} mono />
          {stage === 'Transfer' && <Field label="Destination warehouse" value="" onChange={() => {}} placeholder="e.g. Hassan Cold Store" />}
          <Field label="Notes" value="" onChange={() => {}} placeholder="Optional" />
        </div>
        <div style={{ marginTop: 20 }}><Btn kind="primary" size="lg" full icon="check" onClick={() => { setSheet(false); onToast(`Batch marked ${stage.toLowerCase()}`, 'success'); }}>Confirm {stage.toLowerCase()}</Btn></div>
      </BottomSheet>
    </div>
  );
}

function LocationScreen({ onBack, onToast }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Pick location" onBack={onBack} />
      <MiniMapM h={300} />
      <div style={{ position: 'relative', marginTop: -28, background: 'var(--bg-elevated)', borderRadius: '24px 24px 0 0', flex: 1, padding: '20px 16px 30px', boxShadow: '0 -10px 30px rgba(0,0,0,0.12)' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 12, border: '1.5px solid var(--border-strong)', background: 'var(--bg-elevated)', color: 'var(--primary)', fontWeight: 600, fontSize: 14, fontFamily: 'Inter', cursor: 'pointer', marginBottom: 16 }}><Icon name="pin" size={18} /> Use my current location</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Latitude" value="13.1623" onChange={() => {}} mono />
          <Field label="Longitude" value="75.8648" onChange={() => {}} mono />
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="pin" size={14} color="var(--secondary-d)" /> Channarayapatna, Hassan, Karnataka</div>
        <div style={{ marginTop: 20 }}><Btn kind="primary" size="lg" full icon="check" onClick={() => { onBack(); onToast('Location set', 'success'); }}>Confirm location</Btn></div>
      </div>
    </div>
  );
}

function OfflineMapScreen({ onBack, onToast }) {
  const [dl, setDl] = useQ1(false);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PushHeader title="Offline maps" sub="Download tiles for field use" onBack={onBack} />
      <div style={{ position: 'relative' }}>
        <MiniMapM h={200} />
        <div style={{ position: 'absolute', inset: '20px', border: '2.5px dashed #F1D412', borderRadius: 14, display: 'grid', placeItems: 'center' }}><span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '5px 11px', borderRadius: 8, backdropFilter: 'blur(4px)' }}>Drag to select region</span></div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div><div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Selected area</div><div className="display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>~24 km² · 38 MB</div></div>
          <Btn kind="primary" icon="map" onClick={() => { setDl(true); onToast('Downloading tiles…', 'sync'); }}>Download</Btn>
        </div>
        {dl && <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-muted)', overflow: 'hidden', marginBottom: 18 }}><div style={{ width: '64%', height: '100%', background: 'var(--primary)', borderRadius: 4 }} /></div>}
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase', padding: '0 4px 8px' }}>Downloaded regions</div>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <ListRow icon="map" color="var(--secondary-d)" label="Hassan district" value="62 MB" right={<button onClick={() => onToast('Region purged', 'error')} style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}><Icon name="x" size={17} /></button>} last />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PostHarvestScreen, SampleBoardScreen, AuditScreen, ProcurementScreen, BatchesScreen, InventoryScreen, LocationScreen, OfflineMapScreen });
