/**
 * Audit — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — AuditScreen
 *   - PushHeader "Audit" + back
 *   - Tabs Pending / Approved / Rejected
 *   - Audit cards: 44px avatar, audit type/description, farmer · date,
 *     attachment count chip; Pending cards add Reject / Approve buttons.
 *   - Empty states per tab.
 * Data: api.listAudits (GET /audits); actions → api.reviewAudit (POST /audits/:id/review).
 * Expo Go safe.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { listPerf } from '../components/listPerf';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, X, Check, ClipboardCheck } from 'lucide-react-native';
import { api, type AuditRow } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import { useTheme } from '@/theme';

const TABS = ['Pending', 'Approved', 'Rejected'] as const;
type Tab = (typeof TABS)[number];

type Nav = { goBack: () => void };

function initials(name?: string): string {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase() || 'NA';
}

function Avatar({ name }: { name?: string }) {
  const C = useTheme().c;
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(13,120,60,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: C.primary, fontWeight: '700', fontSize: 15 }}>{initials(name)}</Text>
    </View>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function AuditScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [tab, setTab] = useState<Tab>('Pending');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listAudits({ pageSize: 100 });
      setAudits(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const review = useCallback(
    async (id: string, approved: boolean) => {
      setBusyId(id);
      setError(null);
      try {
        await api.reviewAudit(id, approved, approved ? undefined : 'Rejected from review');
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Review failed');
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const list = useMemo(() => audits.filter((a) => a.status === tab), [audits, tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: C.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 6 }}>
          <ChevronLeft size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Audit</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
        {TABS.map((t) => {
          const on = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: on ? C.primary : C.bgElevated,
                borderWidth: on ? 0 : 1.5,
                borderColor: C.border,
              }}
            >
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}>
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        {...listPerf}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
        ListHeaderComponent={
          error ? (
            <View
              style={{
                marginBottom: 10,
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
          ) : null
        }
        renderItem={({ item }) => {
          const who = item.farmerName ?? item.farmerId;
          const busy = busyId === item._id;
          return (
            <View
              style={{
                backgroundColor: C.bgElevated,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: C.border,
                overflow: 'hidden',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 }}>
                <Avatar name={who} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>
                    {item.auditType} · {item.description}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: C.fgMuted }}>
                    {who} · {formatDate(item.auditDate)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: 'rgba(13,120,60,0.10)',
                    borderRadius: 999,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '600', color: C.primary }}>
                    {item.attachments.length} files
                  </Text>
                </View>
              </View>

              {item.status === 'Pending' && (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    padding: 13,
                    borderTopWidth: 1,
                    borderTopColor: C.border,
                  }}
                >
                  <Pressable
                    disabled={busy}
                    onPress={() => review(item._id, false)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        height: 42,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: C.border,
                        backgroundColor: C.bgElevated,
                        opacity: busy ? 0.6 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    <X size={17} color={C.danger} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.danger }}>Reject</Text>
                  </Pressable>
                  <Pressable
                    disabled={busy}
                    onPress={() => review(item._id, true)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: C.primary,
                        opacity: busy ? 0.6 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    <Check size={17} color={C.onPrimary} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.onPrimary }}>Approve</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ListSkeleton />
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No audits"
              hint={`No ${tab.toLowerCase()} audits to show.`}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
