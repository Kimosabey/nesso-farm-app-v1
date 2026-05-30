import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FarmerStats, MeResponse } from '@/api/client';
import { api } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';

export function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [me, setMe] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<FarmerStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, s] = await Promise.all([api.me(), api.farmerStats()]);
      setMe(m);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void load();
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setStatus(e.status);
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

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <OfflineBanner status={status} />
      <ScrollView
        contentContainerClassName="px-6 py-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D783C" />
        }
      >
        <View className="mb-6 flex-row items-center gap-2">
          <View className="size-2 rounded-full bg-primary" />
          <Text className="text-xs uppercase tracking-wider text-fg-subtle">
            {me?.role ?? 'Loading'}
          </Text>
        </View>

        <Text className="font-display text-4xl text-fg tracking-tight">
          {me ? `Welcome, ${me.firstName ?? me.phone}` : 'Welcome to Nesso'}
        </Text>
        <Text className="mt-2 text-base text-fg-muted">
          {me ? `Signed in as ${me.phone}` : 'Loading your profile…'}
        </Text>

        {error ? (
          <View className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        <View className={isTablet ? 'mt-8 flex-row flex-wrap gap-3' : 'mt-8 gap-3'}>
          {[
            { label: 'Farmers', value: stats?.total ?? 0, tone: 'fg' },
            { label: 'Pending', value: stats?.pending ?? 0, tone: 'warning' },
            { label: 'Approved', value: stats?.approved ?? 0, tone: 'success' },
            { label: 'Rejected', value: stats?.rejected ?? 0, tone: 'danger' },
          ].map((s) => (
            <View
              key={s.label}
              className={`rounded-2xl border border-border bg-bg-elevated p-4 ${isTablet ? 'w-44' : ''}`}
            >
              <Text className="text-xs uppercase tracking-wider text-fg-subtle">{s.label}</Text>
              <Text
                className={`mt-1 font-display text-3xl tabular-nums ${
                  s.tone === 'warning'
                    ? 'text-warning'
                    : s.tone === 'success'
                      ? 'text-success'
                      : s.tone === 'danger'
                        ? 'text-danger'
                        : 'text-fg'
                }`}
              >
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-8 rounded-2xl border border-border bg-bg-muted/30 p-5">
          <Text className="font-display text-lg text-fg">Quick tips</Text>
          <Text className="mt-2 text-sm text-fg-muted">
            Tap <Text className="font-medium text-fg">Farmers</Text> below to see the list, or hit
            the <Text className="font-medium text-primary">+</Text> tab to register a new one.
            Pull down to refresh and run a sync.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
