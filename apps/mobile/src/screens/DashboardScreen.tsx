import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Sun,
  Users,
  UserCheck,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FarmerStats, MeResponse, Farmer } from '@/api/client';
import { api } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { MainTabParamList } from '@/navigation/MainTabs';
import type { RootStackParamList } from '../../App';

// ---------------------------------------------------------------------------
// Animated count-up hook
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    setValue(0);
    const ticks = Math.round(duration / 16);
    let current = 0;
    rafRef.current = setInterval(() => {
      current += 1;
      const progress = current / ticks;
      setValue(Math.round(target * Math.min(progress, 1)));
      if (current >= ticks) {
        if (rafRef.current) clearInterval(rafRef.current);
        setValue(target);
      }
    }, 16);
    return () => {
      if (rafRef.current) clearInterval(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

// ---------------------------------------------------------------------------
// Sync status chip
// ---------------------------------------------------------------------------
function SyncChip({ status }: { status: SyncStatus | null }) {
  if (!status) return null;
  const queued = status.pending + status.failed;

  if (status.draining) {
    return (
      <View className="flex-row items-center gap-1 rounded-full border border-info/30 bg-info/10 px-3 py-1">
        <ActivityIndicator size="small" color="#3B82F6" style={{ width: 12, height: 12 }} />
        <Text className="text-xs text-info">Syncing...</Text>
      </View>
    );
  }
  if (!status.online) {
    return (
      <View className="rounded-full border border-border bg-bg-muted px-3 py-1">
        <Text className="text-xs text-fg-subtle">Offline mode</Text>
      </View>
    );
  }
  if (queued > 0) {
    return (
      <View className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1">
        <Text className="text-xs text-warning">{queued} queued</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1">
      <View className="size-1.5 rounded-full bg-success" />
      <Text className="text-xs text-success">All synced</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------
function KpiCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: string;
}) {
  const displayed = useCountUp(value);

  return (
    <View className="flex-1 rounded-xl border border-border bg-bg-elevated p-4">
      <View className="mb-3 size-8 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </View>
      <Text className="font-display text-2xl tabular-nums text-fg">{displayed}</Text>
      <Text className="mt-0.5 text-xs text-fg-subtle">{label}</Text>
      {trend ? <Text className="mt-1 text-xs text-success">{trend}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Farmer row (recent activity)
// ---------------------------------------------------------------------------
function RecentFarmerRow({ farmer }: { farmer: Farmer }) {
  const initials =
    (farmer.firstName[0] ?? '').toUpperCase() + (farmer.lastName?.[0] ?? '').toUpperCase();
  const status = farmer.approvalStatus;
  const tone =
    status === 'approved'
      ? { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' }
      : status === 'rejected'
        ? { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30' }
        : { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' };

  return (
    <View className="flex-row items-center gap-3 py-3">
      {/* Avatar */}
      <View className="size-10 items-center justify-center rounded-full bg-primary/10">
        <Text className="text-xs font-semibold text-primary">{initials || '?'}</Text>
      </View>
      {/* Name + ID */}
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-fg" numberOfLines={1}>
          {farmer.firstName} {farmer.lastName ?? ''}
        </Text>
        <Text className="text-[10px] font-mono text-fg-subtle">{farmer.farmerId}</Text>
      </View>
      {/* Status badge */}
      <View className={`rounded-full border px-2 py-0.5 ${tone.border} ${tone.bg}`}>
        <Text className={`text-[10px] font-medium ${tone.text}`}>{status}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function DashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<FarmerStats | null>(null);
  const [recentFarmers, setRecentFarmers] = useState<Farmer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, s, r] = await Promise.all([
        api.me(),
        api.farmerStats(),
        api.listFarmers({ pageSize: 5 }),
      ]);
      setMe(m);
      setStats(s);
      setRecentFarmers(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void load();
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
      await sync.kick();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = me?.firstName ?? null;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <OfflineBanner status={syncStatus} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D783C" />
        }
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}
        <View className="mt-4 flex-row items-center justify-between px-4">
          <View className="flex-1 min-w-0">
            {/* Greeting row */}
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text className="font-display text-2xl text-fg" numberOfLines={1}>
                {greeting}{name ? `, ${name}` : ''}
              </Text>
              {me?.role ? (
                <View className="rounded-full bg-primary/10 px-2.5 py-0.5">
                  <Text className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {me.role}
                  </Text>
                </View>
              ) : null}
            </View>
            {/* Sync status */}
            <View className="mt-2">
              <SyncChip status={syncStatus} />
            </View>
          </View>
        </View>

        {error ? (
          <View className="mx-4 mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Weather hero card                                                 */}
        {/* ---------------------------------------------------------------- */}
        <View
          className="mx-4 mt-4 overflow-hidden rounded-2xl bg-primary p-5"
        >
          {/* Dark overlay tint */}
          <View
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.08)' }}
          />
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="self-start rounded-full bg-white/20 px-2.5 py-0.5">
                <Text className="text-[10px] font-semibold text-white/90 uppercase tracking-wider">
                  Today
                </Text>
              </View>
              <Text className="mt-2 font-display text-3xl text-white">
                -- °C · Partly Cloudy
              </Text>
              <Text className="mt-1 text-sm text-white/70">
                {me?.firstName ? 'Your location' : 'Loading location…'}
              </Text>
            </View>
            <View className="ml-4 items-center justify-center opacity-80">
              <Sun size={40} color="#FDE68A" />
            </View>
          </View>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* KPI grid (2×2)                                                    */}
        {/* ---------------------------------------------------------------- */}
        <View className="mx-4 mt-4 flex-row flex-wrap gap-3">
          <View className="flex-row gap-3 w-full">
            <KpiCard
              icon={<Users size={16} color="#0D783C" />}
              label="Total Farmers"
              value={stats?.total ?? 0}
            />
            <KpiCard
              icon={<UserCheck size={16} color="#0D783C" />}
              label="Approved"
              value={stats?.approved ?? 0}
              trend={stats && stats.approved > 0 ? `+${stats.approved}` : undefined}
            />
          </View>
          <View className="flex-row gap-3 w-full">
            <KpiCard
              icon={<Clock size={16} color="#0D783C" />}
              label="Pending"
              value={stats?.pending ?? 0}
            />
            <KpiCard
              icon={<MapPin size={16} color="#0D783C" />}
              label="Farms"
              value={stats?.total ?? 0}
            />
          </View>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Quick actions                                                      */}
        {/* ---------------------------------------------------------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          className="mt-4"
        >
          {/* Register Farmer */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            className="flex-row items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2"
            activeOpacity={0.7}
          >
            <Plus size={16} color="#0D783C" />
            <Text className="text-sm font-semibold text-fg">Register Farmer</Text>
          </TouchableOpacity>

          {/* Add Farm */}
          <TouchableOpacity
            onPress={() => {
              const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
              rootNav?.navigate('AddFarm', {});
            }}
            className="flex-row items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2"
            activeOpacity={0.7}
          >
            <MapPin size={16} color="#0D783C" />
            <Text className="text-sm font-semibold text-fg">Add Farm</Text>
          </TouchableOpacity>

          {/* Accept GRN */}
          <TouchableOpacity
            onPress={() => {
              const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
              rootNav?.navigate('AcceptGRN');
            }}
            className="flex-row items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2"
            activeOpacity={0.7}
          >
            <CheckCircle size={16} color="#0D783C" />
            <Text className="text-sm font-semibold text-fg">Accept GRN</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ---------------------------------------------------------------- */}
        {/* Recent activity                                                    */}
        {/* ---------------------------------------------------------------- */}
        <View className="mt-6 px-4">
          {/* Section header */}
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-fg">Recent</Text>
            <Pressable onPress={() => navigation.navigate('Farmers')}>
              <Text className="text-sm font-medium text-primary">See all</Text>
            </Pressable>
          </View>

          {/* List */}
          <View className="mt-2 rounded-xl border border-border bg-bg-elevated px-4">
            {recentFarmers.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-fg-subtle">No activity yet</Text>
              </View>
            ) : (
              recentFarmers.map((farmer, index) => (
                <View key={farmer._id}>
                  <RecentFarmerRow farmer={farmer} />
                  {index < recentFarmers.length - 1 ? (
                    <View className="h-px bg-border" />
                  ) : null}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
