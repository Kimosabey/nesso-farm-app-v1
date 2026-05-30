import { View, Text } from 'react-native';
import type { SyncStatus } from '@/sync/SyncManager';

export function OfflineBanner({ status }: { status: SyncStatus | null }) {
  if (!status) return null;
  const queued = status.pending + status.failed;

  if (!status.online) {
    return (
      <View className="border-b border-warning/30 bg-warning/10 px-4 py-2">
        <Text className="text-xs text-warning">
          Offline · {queued > 0 ? `${queued} pending will sync when you're back` : 'changes will queue'}
        </Text>
      </View>
    );
  }

  if (status.draining) {
    return (
      <View className="border-b border-info/30 bg-info/10 px-4 py-2">
        <Text className="text-xs text-info">Syncing…</Text>
      </View>
    );
  }

  if (queued > 0) {
    return (
      <View className="border-b border-warning/30 bg-warning/10 px-4 py-2">
        <Text className="text-xs text-warning">{queued} pending sync</Text>
      </View>
    );
  }

  return null;
}
