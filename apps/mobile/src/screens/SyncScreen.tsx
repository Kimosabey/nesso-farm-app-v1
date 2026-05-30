/**
 * Sync Health — 100% spec parity with design handoff (SyncHealthScreen).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_settings.jsx — SyncHealthScreen
 *   - PushHeader "Sync health"
 *   - Outbox hero: gradient card, big count, "changes waiting to sync", last-synced line
 *   - "Sync now" full primary button
 *   - Queue: rows (icon, title, sub) with Retry on failed rows
 *   - Empty: "All caught up — nothing to sync."
 *
 * Wired to real SyncManager / outbox data.
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, RefreshCw, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { sync, peekOutbox, type SyncStatus } from '@/sync/SyncManager';
import type { OutboxRow } from '@/db/outbox';
import { OfflineBanner } from '@/components/OfflineBanner';

const C = {
  primary: '#0D783C',
  primary50: '#EAF6EE',
  secondaryD: '#3C6B51',
  bg: '#FAFDFA',
  bgElevated: '#FFFFFF',
  fg: '#0F1A14',
  fgMuted: '#4A5A52',
  fgSubtle: '#7A8A82',
  border: '#DDE6E0',
  warning: '#9A8407',
  warningBg: 'rgba(154,132,7,0.14)',
  danger: '#B42318',
  dangerBg: 'rgba(180,35,24,0.12)',
  onPrimary: '#FFFFFF',
};

/** Human-readable label for an outbox mutation row. */
function rowLabel(r: OutboxRow): { title: string; sub: string } {
  const verb =
    r.method === 'POST'
      ? 'Create'
      : r.method === 'DELETE'
        ? 'Delete'
        : 'Update';
  const resource = r.endpoint.replace(/^\/+/, '').split('?')[0];
  const failed = r.status === 'failed';
  return {
    title: `${verb} · ${resource}`,
    sub: failed
      ? `failed · ${r.lastError ?? 'retry'}`
      : `queued · ${r.retries > 0 ? `${r.retries} retries` : 'waiting for network'}`,
  };
}

function lastSyncedLabel(status: SyncStatus | null): string {
  if (!status) return 'Loading…';
  const net = status.online ? 'online' : 'offline';
  if (!status.lastSyncAt) return `Not synced yet · ${net}`;
  const mins = Math.round((Date.now() - status.lastSyncAt) / 60000);
  const when = mins <= 0 ? 'just now' : mins === 1 ? '1 min ago' : `${mins} min ago`;
  return `Last synced ${when} · ${net}`;
}

export function SyncScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [rows, setRows] = useState<OutboxRow[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const r = await peekOutbox();
    setRows(r);
  }, []);

  useEffect(() => {
    void refresh();
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') {
        setStatus(e.status);
        void refresh();
      } else if (e.type === 'drained') {
        void refresh();
      }
    });
    return unsub;
  }, [refresh]);

  const onSyncNow = useCallback(async () => {
    setBusy(true);
    try {
      await sync.kick();
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const count = status ? status.pending + status.failed : rows.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <OfflineBanner status={status} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: C.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: C.bgElevated,
            borderWidth: 1.5,
            borderColor: C.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={22} color={C.fg} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg, letterSpacing: -0.2 }}>
          Sync health
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* Outbox hero */}
        <View
          style={{
            backgroundColor: C.secondaryD,
            borderRadius: 20,
            padding: 20,
            marginBottom: 18,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 13, color: '#fff', opacity: 0.9 }}>Outbox</Text>
              <Text style={{ fontSize: 38, fontWeight: '700', color: '#fff' }}>{count}</Text>
              <Text style={{ fontSize: 13, color: '#fff', opacity: 0.9 }}>
                {count === 1 ? 'change waiting to sync' : 'changes waiting to sync'}
              </Text>
            </View>
            <RefreshCw size={38} color="#fff" />
          </View>
          <Text style={{ fontSize: 12.5, color: '#fff', opacity: 0.85, marginTop: 10 }}>
            {lastSyncedLabel(status)}
          </Text>
        </View>

        {/* Sync now */}
        <Pressable
          onPress={onSyncNow}
          disabled={busy || !status?.online}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 52,
            borderRadius: 14,
            backgroundColor: C.primary,
            opacity: busy || !status?.online ? 0.5 : 1,
          }}
        >
          {busy ? (
            <ActivityIndicator color={C.onPrimary} />
          ) : (
            <>
              <RefreshCw size={19} color={C.onPrimary} />
              <Text style={{ color: C.onPrimary, fontWeight: '700', fontSize: 16 }}>
                {status?.online ? 'Sync now' : 'Offline — waiting for network'}
              </Text>
            </>
          )}
        </Pressable>

        {/* Queue */}
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: '700',
            letterSpacing: 1,
            color: C.fgSubtle,
            textTransform: 'uppercase',
            paddingHorizontal: 4,
            paddingTop: 22,
            paddingBottom: 8,
          }}
        >
          Queue
        </Text>

        {rows.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 30, gap: 8 }}>
            <CheckCircle2 size={28} color={C.primary} />
            <Text style={{ fontSize: 14, color: C.fgMuted }}>
              All caught up — nothing to sync.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {rows.map((r) => {
              const failed = r.status === 'failed';
              const { title, sub } = rowLabel(r);
              return (
                <View
                  key={r.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: C.bgElevated,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: C.border,
                    padding: 13,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: failed ? C.dangerBg : C.warningBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {failed ? (
                      <AlertTriangle size={18} color={C.danger} />
                    ) : (
                      <Clock size={18} color={C.warning} />
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fg }} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={{ fontSize: 12, color: C.fgMuted }} numberOfLines={1}>
                      {sub}
                    </Text>
                  </View>
                  {failed ? (
                    <Pressable
                      onPress={onSyncNow}
                      disabled={busy || !status?.online}
                      style={{
                        backgroundColor: C.primary50,
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        opacity: busy || !status?.online ? 0.5 : 1,
                      }}
                    >
                      <Text style={{ color: C.primary, fontWeight: '600', fontSize: 12.5 }}>
                        Retry
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
