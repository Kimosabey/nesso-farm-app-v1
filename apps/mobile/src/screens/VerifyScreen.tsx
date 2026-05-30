import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, type Farmer } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';

export function VerifyScreen() {
  const [pending, setPending] = useState<Farmer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listFarmers({ status: 'pending', pageSize: 100 });
      setPending(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }, []);

  useEffect(() => {
    void load();
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setSyncStatus(e.status);
    });
    return unsub;
  }, [load]);

  const onApprove = useCallback(
    async (farmer: Farmer) => {
      setBusyId(farmer._id);
      try {
        await api.approveFarmer(farmer._id, true);
        await load();
      } catch (e) {
        Alert.alert('Approve failed', e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const onReject = useCallback(
    (farmer: Farmer) => {
      Alert.prompt(
        'Reject farmer',
        `Reason for rejecting ${farmer.firstName}?`,
        async (reason) => {
          if (!reason || reason.trim().length < 3) {
            Alert.alert('Reason required', 'Please provide a reason (3+ chars).');
            return;
          }
          setBusyId(farmer._id);
          try {
            await api.approveFarmer(farmer._id, false, reason.trim());
            await load();
          } catch (e) {
            Alert.alert('Reject failed', e instanceof Error ? e.message : 'Unknown');
          } finally {
            setBusyId(null);
          }
        },
        'plain-text',
      );
    },
    [load],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <OfflineBanner status={syncStatus} />

      <View className="border-b border-border bg-bg-elevated px-6 py-4">
        <Text className="font-display text-2xl text-fg tracking-tight">Verify</Text>
        <Text className="mt-1 text-sm text-fg-muted">
          {pending.length} {pending.length === 1 ? 'farmer' : 'farmers'} pending
        </Text>
      </View>

      {error ? (
        <View className="mx-4 mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={pending}
        keyExtractor={(item) => item._id}
        contentContainerClassName="px-4 py-3 gap-3"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await load();
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor="#0D783C"
          />
        }
        renderItem={({ item }) => (
          <View className="rounded-2xl border border-border bg-bg-elevated p-4">
            <Text className="font-display text-lg text-fg">
              {item.firstName} {item.lastName ?? ''}
            </Text>
            <Text className="mt-0.5 font-mono text-[10px] text-fg-subtle">
              {item.farmerId} · {item.mobileNumber}
            </Text>
            {item.address?.district || item.address?.village ? (
              <Text className="mt-1 text-xs text-fg-muted">
                {[item.address.village, item.address.district, item.address.state]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            ) : null}
            {item.selectedCrops?.length ? (
              <Text className="mt-1 text-xs text-fg-muted">
                Crops: <Text className="text-fg">{item.selectedCrops.join(', ')}</Text>
              </Text>
            ) : null}

            <View className="mt-3 flex-row gap-2">
              <Pressable
                onPress={() => onApprove(item)}
                disabled={busyId === item._id}
                className="h-10 flex-1 items-center justify-center rounded-md bg-success/90 active:opacity-90 disabled:opacity-60"
              >
                {busyId === item._id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-sm font-medium text-white">Approve</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => onReject(item)}
                disabled={busyId === item._id}
                className="h-10 flex-1 items-center justify-center rounded-md border border-danger active:opacity-90 disabled:opacity-60"
              >
                <Text className="text-sm font-medium text-danger">Reject…</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <Text className="text-center text-fg-muted">No pending approvals 🎉</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
