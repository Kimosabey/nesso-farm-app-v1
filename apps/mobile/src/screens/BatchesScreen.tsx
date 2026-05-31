/**
 * Batches — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — BatchesScreen
 *   - PushHeader "Batches" + back, Order/Batch segmented toggle (top)
 *   - Batch rows: 44px Box icon, batch code (mono), crop·grade · qty kg, status chip
 *   - Scan FAB (bottom-right, primary circle, ScanLine) → AcceptGRN
 *   - Empty state.
 * Data: api.listInventory (GET /inventory). Expo Go safe.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Box, ScanLine } from 'lucide-react-native';
import { api, type InventoryBatch } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import { useTheme, type ThemeTokens } from '@/theme';

const VIEWS = ['Order', 'Batch'] as const;
type ViewKind = (typeof VIEWS)[number];

type Nav = { goBack: () => void; navigate: (route: 'AcceptGRN') => void };

function statusTone(
  status: InventoryBatch['status'],
  c: ThemeTokens,
): { bg: string; fg: string; label: string } {
  switch (status) {
    case 'PROCESSING':
      return { bg: 'rgba(154,132,7,0.14)', fg: c.warning, label: 'Processing' };
    case 'SOLD':
      return { bg: 'rgba(13,120,60,0.12)', fg: c.primary, label: 'Sold' };
    case 'TRANSFERRED':
      return { bg: 'rgba(13,120,60,0.12)', fg: c.primary, label: 'Transferred' };
    default:
      return { bg: 'rgba(13,120,60,0.12)', fg: c.primary, label: 'In storage' };
  }
}

function StatusChip({ status }: { status: InventoryBatch['status'] }) {
  const C = useTheme().c;
  const tone = statusTone(status, C);
  return (
    <View
      style={{ backgroundColor: tone.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
    >
      <Text style={{ color: tone.fg, fontSize: 11.5, fontWeight: '700' }}>{tone.label}</Text>
    </View>
  );
}

function subtitleFor(b: InventoryBatch): string {
  const grade = b.grade ? ` · ${b.grade}` : '';
  return `${b.productName}${grade} · ${b.quantity} ${b.unit}`;
}

export function BatchesScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [view, setView] = useState<ViewKind>('Batch');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listInventory({ pageSize: 100 });
      setBatches(r.data);
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

  const seg = useMemo(
    () => (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: C.bg,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: C.border,
          padding: 3,
        }}
      >
        {VIEWS.map((v) => {
          const on = view === v;
          return (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: on ? C.primary : 'transparent',
              }}
            >
              <Text
                style={{ fontSize: 12.5, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}
              >
                {v}
              </Text>
            </Pressable>
          );
        })}
      </View>
    ),
    [view],
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
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Batches</Text>
        <View style={{ flex: 1 }} />
        {seg}
      </View>

      <FlatList
        data={batches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 10 }}
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
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: 'rgba(13,120,60,0.10)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box size={22} color={C.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fg, fontFamily: 'monospace' }}>
                {item.batchId}
              </Text>
              <Text style={{ fontSize: 12.5, color: C.fgMuted }}>{subtitleFor(item)}</Text>
              {item.supplier ? (
                <Text style={{ fontSize: 11, color: C.fgSubtle, marginTop: 2 }}>{item.supplier}</Text>
              ) : null}
            </View>
            <StatusChip status={item.status} />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ListSkeleton />
          ) : (
            <EmptyState
              icon={Box}
              title="No batches yet"
              hint="Scan a GRN to bring batches into storage."
            />
          )
        }
      />

      {/* Scan FAB → AcceptGRN */}
      <Pressable
        accessibilityLabel="Scan GRN"
        onPress={() => navigation.navigate('AcceptGRN')}
        style={({ pressed }) => [
          {
            position: 'absolute',
            right: 18,
            bottom: 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.primary,
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <ScanLine size={26} color={C.onPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}
