import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { sync, peekOutbox, type SyncStatus } from '@/sync/SyncManager';
import type { OutboxRow } from '@/db/outbox';
import { api } from '@/api/client';
import { OfflineBanner } from '@/components/OfflineBanner';

type Stack = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};
type Props = NativeStackScreenProps<Stack> & { onSignOut?: () => void };

export function SyncScreen({ navigation }: { navigation: Props['navigation'] }) {
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
      }
    });
    return unsub;
  }, [refresh]);

  const onKick = useCallback(async () => {
    setBusy(true);
    try {
      await sync.kick();
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const onSignOut = useCallback(async () => {
    Alert.alert('Sign out?', 'Your queued items will sync next time you sign in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await api.logout();
          navigation.getParent()?.navigate?.('Login' as never);
        },
      },
    ]);
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <OfflineBanner status={status} />

      <View className="border-b border-border bg-bg-elevated px-6 py-4">
        <Text className="font-display text-2xl text-fg tracking-tight">Sync & profile</Text>
        <Text className="mt-1 text-sm text-fg-muted">
          {status
            ? `${status.online ? 'Online' : 'Offline'} · ${status.pending + status.failed} queued`
            : 'Loading…'}
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-6 py-6 gap-4">
        <View className="rounded-2xl border border-border bg-bg-elevated p-5">
          <Text className="text-xs uppercase tracking-wider text-fg-subtle">Outbox</Text>
          <View className="mt-3 flex-row gap-4">
            <Stat label="Pending" value={status?.pending ?? 0} tone="warning" />
            <Stat label="Failed" value={status?.failed ?? 0} tone="danger" />
          </View>
          <Pressable
            onPress={onKick}
            disabled={busy || !status?.online}
            className="mt-4 h-11 items-center justify-center rounded-md bg-primary active:opacity-90 disabled:opacity-50"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-medium text-white">
                {status?.online ? 'Sync now' : 'Offline — waiting for network'}
              </Text>
            )}
          </Pressable>
          {status?.lastSyncAt ? (
            <Text className="mt-2 text-xs text-fg-subtle">
              Last sync: {new Date(status.lastSyncAt).toLocaleString()}
            </Text>
          ) : null}
        </View>

        {rows.length > 0 ? (
          <View className="rounded-2xl border border-border bg-bg-elevated p-5">
            <Text className="text-xs uppercase tracking-wider text-fg-subtle">Queued items</Text>
            <View className="mt-3 gap-2">
              {rows.map((r) => (
                <View
                  key={r.id}
                  className="rounded-md border border-border bg-bg-muted/40 px-3 py-2"
                >
                  <View className="flex-row items-baseline justify-between">
                    <Text className="font-mono text-xs text-fg">
                      {r.method} {r.endpoint}
                    </Text>
                    <Text
                      className={`text-[10px] font-medium ${
                        r.status === 'failed' ? 'text-danger' : 'text-warning'
                      }`}
                    >
                      {r.status} · {r.retries} retries
                    </Text>
                  </View>
                  {r.lastError ? (
                    <Text className="mt-1 text-xs text-danger">{r.lastError}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="rounded-2xl border border-border bg-bg-elevated p-5">
          <Text className="text-xs uppercase tracking-wider text-fg-subtle">Account</Text>
          <Pressable
            onPress={onSignOut}
            className="mt-3 h-11 items-center justify-center rounded-md border border-border-strong"
          >
            <Text className="text-sm font-medium text-fg">Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'warning' | 'danger' }) {
  return (
    <View>
      <Text className="text-[10px] uppercase tracking-wider text-fg-subtle">{label}</Text>
      <Text
        className={`mt-0.5 font-display text-3xl tabular-nums ${
          tone === 'warning' ? 'text-warning' : 'text-danger'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
