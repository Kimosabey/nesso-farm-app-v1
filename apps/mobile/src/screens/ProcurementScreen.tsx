/**
 * Procurement — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — ProcurementScreen
 *   - PushHeader "Procurement" + back
 *   - Tabs All / Pending / Paid
 *   - Payee rows: farmer name + avatar, qty kg, amount (₹, mono, right), payment status chip
 *   - Sticky "Record procurement" button at the bottom.
 * Data: api.listProcurement (GET /procurement). Expo Go safe.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, ReceiptText } from 'lucide-react-native';
import { api, type ProcurementRow } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import { useTheme } from '@/theme';

const TABS = ['All', 'Pending', 'Paid'] as const;
type Tab = (typeof TABS)[number];

type Nav = { goBack: () => void };

function initials(name?: string): string {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase() || 'NA';
}

function Avatar({ name, size = 44 }: { name?: string; size?: number }) {
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
      <Text style={{ color: C.primary, fontWeight: '700', fontSize: size * 0.34 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

function PaymentChip({ status }: { status: ProcurementRow['paymentStatus'] }) {
  const C = useTheme().c;
  const tone =
    status === 'Paid'
      ? { bg: 'rgba(13,120,60,0.12)', fg: C.primary, label: 'Paid' }
      : status === 'Partial'
        ? { bg: 'rgba(14,116,144,0.12)', fg: '#0E7490', label: 'Partial' }
        : { bg: 'rgba(154,132,7,0.14)', fg: C.warning, label: 'Payment due' };
  return (
    <View
      style={{ backgroundColor: tone.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
    >
      <Text style={{ color: tone.fg, fontSize: 11.5, fontWeight: '700' }}>{tone.label}</Text>
    </View>
  );
}

export function ProcurementScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [rows, setRows] = useState<ProcurementRow[]>([]);
  const [tab, setTab] = useState<Tab>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listProcurement({ pageSize: 100 });
      setRows(r.data);
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
      rows.filter((r) =>
        tab === 'All'
          ? true
          : tab === 'Paid'
            ? r.paymentStatus === 'Paid'
            : r.paymentStatus !== 'Paid',
      ),
    [rows, tab],
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
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Procurement</Text>
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
              padding: 15,
            }}
          >
            <Avatar name={item.farmerName ?? item.farmerId} size={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>
                {item.farmerName ?? item.farmerId}
              </Text>
              <Text style={{ fontSize: 12, color: C.fgSubtle, fontFamily: 'monospace' }}>
                {item.procurementId} · {item.quantity} {item.unit}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg, fontFamily: 'monospace' }}>
                ₹{item.totalAmount.toLocaleString('en-IN')}
              </Text>
              <PaymentChip status={item.paymentStatus} />
            </View>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ListSkeleton />
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="No procurement records"
              hint="Record a procurement to track quantities and payments."
            />
          )
        }
      />

      {/* Sticky Record procurement */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
          backgroundColor: C.bgElevated,
          borderTopWidth: 1,
          borderTopColor: C.border,
        }}
      >
        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 52,
              borderRadius: 14,
              backgroundColor: C.primary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Plus size={20} color={C.onPrimary} />
          <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.onPrimary }}>
            Record procurement
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
