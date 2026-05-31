/**
 * Farmers list — 100% spec parity with design handoff (M5).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_main.jsx — FarmersScreen
 *   - PageTop: "Farmers" 28px/700 + "N in your cluster"
 *   - SearchBar: 48px, search icon + input + filter icon (primary)
 *   - Chips: All / Approved / Pending / Rejected (active = primary bg)
 *   - Cards: 46px initials avatar, name 15px/600, "📍village · 🌿crop" row,
 *     farmerId · area in mono, StatusChip + chevron, tap → FarmerProfile
 *   - Empty: "No farmers match."
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, SlidersHorizontal, MapPin, Sprout, ChevronRight, Users } from 'lucide-react-native';
import { api, type Farmer } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';
import { listPerf } from '@/components/listPerf';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { RootStackParamList } from '../../App';

const CHIPS = ['All', 'Approved', 'Pending', 'Rejected'] as const;
type Chip = (typeof CHIPS)[number];

const CHIP_KEYS: Record<Chip, string> = {
  All: 'filters.all',
  Approved: 'filters.approved',
  Pending: 'filters.pending',
  Rejected: 'filters.rejected',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

function initials(first: string, last?: string): string {
  const a = first?.[0] ?? '';
  const b = last?.[0] ?? '';
  return (a + b).toUpperCase() || 'NA';
}

function Avatar({ first, last, size = 46 }: { first: string; last?: string; size?: number }) {
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
      <Text style={{ color: C.primary, fontWeight: '700', fontSize: size * 0.36 }}>
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
        ? { bg: 'rgba(180,35,24,0.12)', fg: '#B42318' }
        : { bg: 'rgba(154,132,7,0.14)', fg: '#9A8407' };
  const label = status[0].toUpperCase() + status.slice(1);
  return (
    <View style={{ backgroundColor: tone.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: tone.fg, fontSize: 11.5, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function FarmersScreen() {
  const C = useTheme().c;
  const { t } = useT();
  const navigation = useNavigation<Nav>();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Chip>('All');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listFarmers({ pageSize: 100 });
      setFarmers(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setSyncStatus(e.status);
      else if (e.type === 'drained' && e.ok > 0) void load();
    });
    return unsub;
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const list = useMemo(() => {
    const query = q.toLowerCase();
    return farmers.filter((f) => {
      const matchesFilter = filter === 'All' || f.approvalStatus === filter.toLowerCase();
      const name = `${f.firstName} ${f.lastName ?? ''}`.toLowerCase();
      const village = (f.address?.village ?? '').toLowerCase();
      const matchesQuery = !query || name.includes(query) || village.includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [farmers, q, filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <OfflineBanner status={syncStatus} />

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        {...listPerf}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* PageTop */}
            <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.6 }}>
                {t('farmers.title')}
              </Text>
              <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 3 }}>
                {t('farmers.inCluster', { count: farmers.length })}
              </Text>
            </View>

            {/* SearchBar */}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  height: 48,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: C.bgElevated,
                  borderWidth: 1.5,
                  borderColor: C.border,
                }}
              >
                <Search size={19} color={C.fgSubtle} />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder={t('farmers.searchPlaceholder')}
                  placeholderTextColor={C.fgSubtle}
                  style={{ flex: 1, fontSize: 15, color: C.fg }}
                />
                <SlidersHorizontal size={19} color={C.primary} />
              </View>
            </View>

            {/* Chips */}
            <FlatList
              horizontal
              data={CHIPS as readonly Chip[]}
              keyExtractor={(c) => c}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
              renderItem={({ item }) => {
                const on = filter === item;
                return (
                  <Pressable
                    onPress={() => setFilter(item)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: on ? C.primary : C.bgElevated,
                      borderWidth: on ? 0 : 1.5,
                      borderColor: C.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}>
                      {t(CHIP_KEYS[item])}
                    </Text>
                  </Pressable>
                );
              }}
            />

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
                <Text style={{ fontSize: 14, color: '#B42318' }}>{error}</Text>
              </View>
            ) : null}

            <View style={{ height: 14 }} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
            <Pressable
              onPress={() => navigation.navigate('FarmerProfile', { farmerId: item._id })}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 13,
                  backgroundColor: C.bgElevated,
                  borderRadius: 16,
                  padding: 13,
                  borderWidth: 1,
                  borderColor: C.border,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Avatar first={item.firstName} last={item.lastName} size={46} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>
                  {item.firstName} {item.lastName ?? ''}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <MapPin size={13} color={C.fgSubtle} />
                  <Text style={{ fontSize: 12.5, color: C.fgMuted }}>
                    {item.address?.village ?? '—'}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: C.fgMuted }}>·</Text>
                  <Sprout size={13} color={C.secondaryD} />
                  <Text style={{ fontSize: 12.5, color: C.fgMuted }}>
                    {item.selectedCrops?.[0] ?? item.productionPractice ?? '—'}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: C.fgSubtle,
                    marginTop: 3,
                    fontFamily: 'monospace',
                  }}
                >
                  {item.farmerId} · {item.groupAssociation}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <StatusChip status={item.approvalStatus} />
                <ChevronRight size={18} color={C.fgSubtle} />
              </View>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ListSkeleton />
          ) : farmers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No farmers yet"
              hint="Register your first farmer to start building your cluster."
              actionLabel="Register"
              onAction={() => navigation.getParent()?.navigate('Register')}
            />
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 14, color: C.fgSubtle }}>{t('farmers.noMatch')}</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
