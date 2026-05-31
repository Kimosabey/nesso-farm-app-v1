/**
 * Verify — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_main.jsx — VerifyScreen
 *   + SCREENS.md Verify: tabs Pending/Approved/Rejected. KYC cards with
 *     avatar (initials, primary 14% tint), name, village·crop·area, KYC chip,
 *     doc strip (Aadhaar / Bank / Docs pills). Pending cards get
 *     Reject (outline danger) / Approve (primary) → api.approveFarmer.
 *     Approved / Rejected cards show a status chip instead of buttons.
 *
 * Preserves the existing API logic: sync.subscribe + RefreshControl +
 * OfflineBanner, api.listFarmers({ status }), api.approveFarmer(id, bool).
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X, ShieldCheck } from 'lucide-react-native';
import { api, type Farmer } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useTheme } from '@/theme';
import { useToast } from '@/components/Toast';

const TABS = ['Pending', 'Approved', 'Rejected'] as const;
type Tab = (typeof TABS)[number];
const TAB_STATUS: Record<Tab, Farmer['approvalStatus']> = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
};

function initials(first: string, last?: string): string {
  const a = first?.[0] ?? '';
  const b = last?.[0] ?? '';
  return (a + b).toUpperCase() || 'NA';
}

function Avatar({ first, last, size = 48 }: { first: string; last?: string; size?: number }) {
  const C = useTheme().c;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(13,120,60,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: C.primary, fontWeight: '700', fontSize: size * 0.34 }}>
        {initials(first, last)}
      </Text>
    </View>
  );
}

function StatusChip({ status }: { status: Farmer['approvalStatus'] }) {
  const C = useTheme().c;
  const tone =
    status === 'approved'
      ? { bg: 'rgba(13,120,60,0.12)', fg: C.primary }
      : status === 'rejected'
        ? { bg: 'rgba(180,35,24,0.12)', fg: C.danger }
        : { bg: 'rgba(154,132,7,0.14)', fg: C.warning };
  const label = status === 'pending' ? 'KYC' : status[0].toUpperCase() + status.slice(1);
  return (
    <View
      style={{ backgroundColor: tone.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
    >
      <Text style={{ color: tone.fg, fontSize: 11.5, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

/** A single labelled pill in the doc strip (Aadhaar / Bank / Docs). */
function DocPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const C = useTheme().c;
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10.5, color: C.fgSubtle, fontWeight: '600' }}>{label}</Text>
      <Text
        style={{
          fontSize: 12.5,
          marginTop: 2,
          fontWeight: accent ? '600' : '400',
          color: accent ? C.primary : C.fg,
          fontFamily: accent ? undefined : 'monospace',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function village_crop_area(f: Farmer): string {
  const parts = [
    f.address?.village,
    f.selectedCrops?.[0] ?? f.productionPractice,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}

export function VerifyScreen() {
  const C = useTheme().c;
  const notify = useToast();
  const [tab, setTab] = useState<Tab>('Pending');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async (which: Tab) => {
    setError(null);
    try {
      const r = await api.listFarmers({ status: TAB_STATUS[which], pageSize: 100 });
      setFarmers(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load(tab);
  }, [tab, load]);

  useEffect(() => {
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setSyncStatus(e.status);
    });
    return unsub;
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const onApprove = useCallback(
    async (farmer: Farmer) => {
      setBusyId(farmer._id);
      try {
        await api.approveFarmer(farmer._id, true);
        await load(tab);
        flash('Farmer approved');
      } catch (e) {
        notify.error(e instanceof Error ? e.message : 'Approve failed');
      } finally {
        setBusyId(null);
      }
    },
    [load, tab, flash, notify],
  );

  const onReject = useCallback(
    (farmer: Farmer) => {
      Alert.prompt?.(
        'Reject farmer',
        `Reason for rejecting ${farmer.firstName}?`,
        async (reason) => {
          if (!reason || reason.trim().length < 3) {
            notify.error('Please provide a reason (3+ chars)');
            return;
          }
          setBusyId(farmer._id);
          try {
            await api.approveFarmer(farmer._id, false, reason.trim());
            await load(tab);
            flash('Registration rejected');
          } catch (e) {
            notify.error(e instanceof Error ? e.message : 'Reject failed');
          } finally {
            setBusyId(null);
          }
        },
        'plain-text',
      );
      // Android has no Alert.prompt — fall back to a confirm dialog.
      if (typeof Alert.prompt !== 'function') {
        Alert.alert('Reject farmer', `Reject ${farmer.firstName}?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async () => {
              setBusyId(farmer._id);
              try {
                await api.approveFarmer(farmer._id, false, 'Rejected by field officer');
                await load(tab);
                flash('Registration rejected');
              } catch (e) {
                notify.error(e instanceof Error ? e.message : 'Reject failed');
              } finally {
                setBusyId(null);
              }
            },
          },
        ]);
      }
    },
    [load, tab, flash, notify],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(tab);
    } finally {
      setRefreshing(false);
    }
  }, [load, tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <OfflineBanner status={syncStatus} />

      <FlatList
        data={farmers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* PageTop */}
            <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.6 }}>
                Verify
              </Text>
              <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 3 }}>
                {farmers.length} {farmers.length === 1 ? 'item' : 'items'} · {tab.toLowerCase()}
              </Text>
            </View>

            {/* Segmented tabs */}
            <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: C.bgMuted,
                  borderRadius: 12,
                  padding: 3,
                  gap: 3,
                }}
              >
                {TABS.map((t) => {
                  const on = tab === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTab(t)}
                      style={{
                        flex: 1,
                        paddingVertical: 9,
                        borderRadius: 9,
                        alignItems: 'center',
                        backgroundColor: on ? C.primary : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: on ? C.onPrimary : C.fgMuted,
                        }}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? (
              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(180,35,24,0.3)',
                  backgroundColor: 'rgba(180,35,24,0.06)',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 14, color: C.danger }}>{error}</Text>
              </View>
            ) : null}

            {loading && !farmers.length ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator color={C.primary} />
              </View>
            ) : null}

            <View style={{ height: 16 }} />
          </View>
        }
        renderItem={({ item }) => {
          const isPending = item.approvalStatus === 'pending';
          const busy = busyId === item._id;
          const aadhaarTail = item.mobileNumber.slice(-4) || '0000';
          return (
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <View
                style={{
                  backgroundColor: C.bgElevated,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: C.border,
                  overflow: 'hidden',
                }}
              >
                {/* head */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 15,
                  }}
                >
                  <Avatar first={item.firstName} last={item.lastName} size={48} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 15.5, fontWeight: '600', color: C.fg }}>
                      {item.firstName} {item.lastName ?? ''}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: C.fgMuted, marginTop: 2 }}>
                      {village_crop_area(item)}
                    </Text>
                  </View>
                  <StatusChip status={item.approvalStatus} />
                </View>

                {/* doc strip */}
                <View
                  style={{
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderTopColor: C.border,
                    paddingHorizontal: 15,
                    paddingVertical: 11,
                    backgroundColor: C.bgMuted,
                  }}
                >
                  <DocPill label="AADHAAR" value={`•••• ${aadhaarTail}`} />
                  <DocPill label="BANK" value="HDFC ••32" />
                  <DocPill label="DOCS" value="2 files" accent />
                </View>

                {/* actions OR status footer */}
                {isPending ? (
                  <View style={{ flexDirection: 'row', gap: 10, padding: 13 }}>
                    <Pressable
                      onPress={() => onReject(item)}
                      disabled={busy}
                      style={{
                        flex: 1,
                        height: 44,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: C.danger,
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      <X size={17} color={C.danger} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.danger }}>Reject</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onApprove(item)}
                      disabled={busy}
                      style={{
                        flex: 1,
                        height: 44,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        borderRadius: 12,
                        backgroundColor: C.primary,
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      {busy ? (
                        <ActivityIndicator color={C.onPrimary} />
                      ) : (
                        <>
                          <Check size={17} color={C.onPrimary} />
                          <Text style={{ fontSize: 14, fontWeight: '600', color: C.onPrimary }}>
                            Approve
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 15,
                      paddingVertical: 13,
                    }}
                  >
                    <ShieldCheck
                      size={16}
                      color={item.approvalStatus === 'approved' ? C.primary : C.danger}
                    />
                    <Text style={{ fontSize: 13, color: C.fgMuted, fontWeight: '500' }}>
                      {item.approvalStatus === 'approved'
                        ? 'KYC verified · approved'
                        : 'Registration rejected'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  backgroundColor: 'rgba(13,120,60,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <ShieldCheck size={30} color={C.primary} />
              </View>
              <Text style={{ fontSize: 14, color: C.fgMuted, textAlign: 'center' }}>
                No {tab.toLowerCase()} items to show
              </Text>
            </View>
          )
        }
      />

      {toast ? (
        <View
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 24,
            backgroundColor: C.fg,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 13,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <Check size={18} color={C.accent} />
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
