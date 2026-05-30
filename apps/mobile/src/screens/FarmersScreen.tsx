import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, type Farmer } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';

const STATUSES = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export function FarmersScreen() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listFarmers({ status: status || undefined, pageSize: 100 });
      setFarmers(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }, [status]);

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

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <OfflineBanner status={syncStatus} />

      <View className="border-b border-border bg-bg-elevated px-6 py-4">
        <Text className="font-display text-2xl text-fg tracking-tight">Farmers</Text>
        <Text className="mt-1 text-sm text-fg-muted">
          {farmers.length} {farmers.length === 1 ? 'farmer' : 'farmers'}
        </Text>
      </View>

      <View className="flex-row gap-2 border-b border-border bg-bg-elevated px-4 py-2">
        {STATUSES.map((s) => {
          const active = status === s.key;
          return (
            <Pressable
              key={s.key || 'all'}
              onPress={() => setStatus(s.key)}
              className={`rounded-full px-3 py-1 ${
                active ? 'bg-primary' : 'border border-border-strong bg-bg-muted'
              }`}
            >
              <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-fg'}`}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View className="mx-4 mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={farmers}
        keyExtractor={(item) => item._id}
        contentContainerClassName="px-4 py-3 gap-2"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D783C" />
        }
        renderItem={({ item }) => <FarmerRow farmer={item} />}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="text-fg-muted">No farmers yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function FarmerRow({ farmer }: { farmer: Farmer }) {
  const status = farmer.approvalStatus;
  const tone =
    status === 'approved'
      ? { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' }
      : status === 'rejected'
        ? { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30' }
        : { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' };

  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-bg-elevated p-4">
      <View className="flex-1 min-w-0">
        <Text className="font-medium text-fg">
          {farmer.firstName} {farmer.lastName ?? ''}
        </Text>
        <Text className="mt-0.5 font-mono text-[10px] text-fg-subtle">
          {farmer.farmerId} · {farmer.mobileNumber}
        </Text>
        {farmer.address?.village ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={10} color="#7A8A82" />
            <Text className="text-[10px] text-fg-subtle">
              {[farmer.address.village, farmer.address.district].filter(Boolean).join(', ')}
            </Text>
          </View>
        ) : null}
      </View>
      <View className={`rounded-full border ${tone.border} ${tone.bg} px-2 py-0.5`}>
        <Text className={`text-[10px] font-medium ${tone.text}`}>{status}</Text>
      </View>
    </View>
  );
}
