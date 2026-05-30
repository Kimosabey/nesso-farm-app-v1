/**
 * Activities — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_feature.jsx — ActivitiesListScreen
 *   - PageTop "Activities" + back header
 *   - Tabs Pending / Approved (maps to backend status Pending / Completed)
 *   - Type-icon rows: activity-type icon, title, "farm · date", StatusChip
 *   - Empty states per tab
 * Data: api.listActivities (GET /activities). Expo Go safe.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Droplets,
  Sprout,
  CloudRain,
  Wheat,
  Leaf,
  Search,
  Activity as ActivityIcon,
  type LucideIcon,
} from 'lucide-react-native';
import { api, type ActivityRow } from '@/api/client';
import { useTheme } from '@/theme';

const TABS = ['Pending', 'Approved'] as const;
type Tab = (typeof TABS)[number];

type Nav = { goBack: () => void };

// Map free-text activity name → a type icon.
function iconFor(activity: string): LucideIcon {
  const a = activity.toLowerCase();
  if (a.includes('spray')) return Droplets;
  if (a.includes('fertil')) return Wheat;
  if (a.includes('irrig')) return CloudRain;
  if (a.includes('harvest')) return Wheat;
  if (a.includes('weed')) return Leaf;
  if (a.includes('scout')) return Search;
  return Sprout;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function StatusChip({ status }: { status: ActivityRow['status'] }) {
  const C = useTheme().c;
  const tone =
    status === 'Completed'
      ? { bg: 'rgba(13,120,60,0.12)', fg: C.primary }
      : status === 'Cancelled' || status === 'Overdue'
        ? { bg: 'rgba(180,35,24,0.12)', fg: '#B42318' }
        : { bg: 'rgba(154,132,7,0.14)', fg: C.warning };
  return (
    <View
      style={{ backgroundColor: tone.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
    >
      <Text style={{ color: tone.fg, fontSize: 11.5, fontWeight: '700' }}>{status}</Text>
    </View>
  );
}

export function ActivitiesScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [tab, setTab] = useState<Tab>('Pending');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listActivities({ pageSize: 100 });
      setActivities(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
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

  const list = useMemo(
    () =>
      activities.filter((a) =>
        tab === 'Pending' ? a.status === 'Pending' : a.status === 'Completed',
      ),
    [activities, tab],
  );

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
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Activities</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* PageTop */}
            <View style={{ paddingHorizontal: 4, paddingTop: 12, paddingBottom: 12 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.6 }}>
                Activities
              </Text>
              <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 3 }}>
                Field operations log
              </Text>
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 12 }}>
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
                    <Text
                      style={{ fontSize: 13.5, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error ? (
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
                <Text style={{ fontSize: 14, color: '#B42318' }}>{error}</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const Icon = iconFor(item.activity);
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                backgroundColor: C.bgElevated,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: C.border,
                padding: 14,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: 'rgba(13,120,60,0.10)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} color={C.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>{item.activity}</Text>
                <Text style={{ fontSize: 12.5, color: C.fgMuted }}>
                  {item.farmId} · {formatDate(item.scheduledOn ?? item.enteredDate)}
                  {item.totalCost ? ` · ₹${item.totalCost}` : ''}
                </Text>
              </View>
              <StatusChip status={item.status} />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIcon size={28} color={C.fgSubtle} />
            <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 8 }}>
              No {tab.toLowerCase()} activities.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
