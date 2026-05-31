/**
 * Samples — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — SampleBoardScreen
 *   - PushHeader "Samples" + back
 *   - Tabs Queue / Sent
 *   - Sample rows: 42px Droplet icon, sample code (mono), crop · variety,
 *     stage chip, date
 *   - Empty state.
 * Data: api.listSamples (GET /samples). Expo Go safe.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Droplet } from 'lucide-react-native';
import { api, type SampleRow } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { listPerf } from '@/components/listPerf';
import { ListSkeleton } from '@/components/Skeleton';
import { useTheme } from '@/theme';

const TABS = ['Queue', 'Sent'] as const;
type Tab = (typeof TABS)[number];

// Sent tab shows everything past Queue.
const SENT_STATUSES: SampleRow['status'][] = ['Sent', 'Received', 'Tested', 'Approved', 'Rejected'];

type Nav = { goBack: () => void };

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function StageChip({ status }: { status: SampleRow['status'] }) {
  const C = useTheme().c;
  const tone =
    status === 'Queue'
      ? { bg: 'rgba(154,132,7,0.14)', fg: C.warning }
      : status === 'Rejected'
        ? { bg: 'rgba(180,35,24,0.12)', fg: '#B42318' }
        : { bg: 'rgba(13,120,60,0.12)', fg: C.primary };
  const label = status === 'Queue' ? 'In queue' : status;
  return (
    <View
      style={{ backgroundColor: tone.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
    >
      <Text style={{ color: tone.fg, fontSize: 11.5, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function SamplesScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [samples, setSamples] = useState<SampleRow[]>([]);
  const [tab, setTab] = useState<Tab>('Queue');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listSamples({ pageSize: 100 });
      setSamples(r.data);
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

  const list = useMemo(
    () =>
      samples.filter((s) =>
        tab === 'Queue' ? s.status === 'Queue' : SENT_STATUSES.includes(s.status),
      ),
    [samples, tab],
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
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Samples</Text>
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
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
              <Text style={{ fontSize: 14, color: '#B42318' }}>{error}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
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
                backgroundColor: C.bgMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Droplet size={20} color={C.fgMuted} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.fg, fontFamily: 'monospace' }}>
                {item.sampleCode}
              </Text>
              <Text style={{ fontSize: 12.5, color: C.fgMuted }}>
                {item.crop} · {item.variety}
                {item.farmerName ? ` · ${item.farmerName}` : ''}
              </Text>
              <Text style={{ fontSize: 11, color: C.fgSubtle, marginTop: 2 }}>
                {formatDate(item.sentDate ?? item.createdAt)}
              </Text>
            </View>
            <StageChip status={item.status} />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ListSkeleton />
          ) : (
            <EmptyState
              icon={Droplet}
              title="No samples"
              hint={tab === 'Queue' ? 'Samples queued for dispatch will appear here.' : 'Sent samples will appear here.'}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
