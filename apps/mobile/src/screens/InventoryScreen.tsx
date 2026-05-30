/**
 * Inventory — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — InventoryScreen
 *   - PushHeader "Inventory" + back
 *   - Batch rows (mono code, crop · qty, location/status) → tap opens a
 *     "Move inventory" bottom sheet (Sell / Transfer / Process segmented,
 *     qty input, destination for Transfer, notes, confirm).
 *   - Bottom sheet is a native Modal (no extra deps).
 * Data: api.listInventory; actions → api.sellInventory / transferInventory / processInventory.
 * Expo Go safe.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Box, ChevronRight, X, Check } from 'lucide-react-native';
import { api, ApiError, type InventoryBatch } from '@/api/client';

const C = {
  primary: '#0D783C',
  secondaryD: '#3C6B51',
  bg: '#FAFDFA',
  bgElevated: '#FFFFFF',
  fg: '#0F1A14',
  fgMuted: '#4A5A52',
  fgSubtle: '#7A8A82',
  border: '#DDE6E0',
  danger: '#B42318',
  onPrimary: '#FFFFFF',
};

const STAGES = ['Sell', 'Transfer', 'Process'] as const;
type Stage = (typeof STAGES)[number];

type Nav = { goBack: () => void };

function subtitleFor(b: InventoryBatch): string {
  const loc = b.warehouseName ? ` · ${b.warehouseName}` : '';
  return `${b.productName} · ${b.quantity} ${b.unit}${loc}`;
}

export function InventoryScreen() {
  const navigation = useNavigation<Nav>();
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Move sheet state
  const [active, setActive] = useState<InventoryBatch | null>(null);
  const [stage, setStage] = useState<Stage>('Sell');
  const [qty, setQty] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listInventory({ pageSize: 100 });
      setBatches(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
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

  const openSheet = useCallback((b: InventoryBatch) => {
    setActive(b);
    setStage('Sell');
    setQty(String(b.quantity));
    setDestination('');
    setNotes('');
    setSheetError(null);
  }, []);

  const closeSheet = useCallback(() => {
    setActive(null);
    setSubmitting(false);
  }, []);

  const confirm = useCallback(async () => {
    if (!active) return;
    const quantity = Number(qty);
    setSheetError(null);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setSheetError('Enter a valid quantity.');
      return;
    }
    if (stage === 'Transfer' && !destination.trim()) {
      setSheetError('Destination warehouse is required.');
      return;
    }
    setSubmitting(true);
    try {
      if (stage === 'Sell') {
        await api.sellInventory(active._id, {
          quantity,
          buyer: destination.trim() || 'Buyer',
          notes: notes.trim() || undefined,
        });
      } else if (stage === 'Transfer') {
        await api.transferInventory(active._id, {
          toWarehouseId: destination.trim(),
          quantity,
          notes: notes.trim() || undefined,
        });
      } else {
        await api.processInventory(active._id, {
          toStage: notes.trim() || 'Processing',
          notes: notes.trim() || undefined,
        });
      }
      closeSheet();
      await load();
    } catch (e) {
      setSubmitting(false);
      setSheetError(e instanceof ApiError ? e.message : 'Action failed. Try again.');
    }
  }, [active, qty, stage, destination, notes, closeSheet, load]);

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
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Inventory</Text>
      </View>

      <FlatList
        data={batches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 10 }}
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
              <Text style={{ fontSize: 14, color: C.danger }}>{error}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openSheet(item)}
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
                backgroundColor: 'rgba(60,107,81,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box size={22} color={C.secondaryD} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fg, fontFamily: 'monospace' }}>
                {item.batchId}
              </Text>
              <Text style={{ fontSize: 12.5, color: C.fgMuted }}>{subtitleFor(item)}</Text>
            </View>
            <ChevronRight size={18} color={C.fgSubtle} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 50 }}>
            <Box size={28} color={C.fgSubtle} />
            <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 8 }}>No inventory yet.</Text>
          </View>
        }
      />

      {/* Move inventory bottom sheet */}
      <Modal visible={!!active} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable
          onPress={closeSheet}
          style={{ flex: 1, backgroundColor: 'rgba(15,26,20,0.45)', justifyContent: 'flex-end' }}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: C.bgElevated,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: 34,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
              >
                <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Move inventory</Text>
                <Pressable onPress={closeSheet} style={{ padding: 4 }}>
                  <X size={22} color={C.fgSubtle} />
                </Pressable>
              </View>

              {/* Segmented stage */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: C.bg,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: C.border,
                  padding: 3,
                  marginBottom: 16,
                }}
              >
                {STAGES.map((s) => {
                  const on = stage === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setStage(s)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: on ? C.primary : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{ fontSize: 13, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ gap: 14 }}>
                <Field
                  label="Quantity (kg)"
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="numeric"
                  mono
                />
                {stage === 'Transfer' && (
                  <Field
                    label="Destination warehouse"
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="e.g. Hassan Cold Store"
                  />
                )}
                {stage === 'Sell' && (
                  <Field
                    label="Buyer"
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Buyer name"
                  />
                )}
                <Field
                  label="Notes"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Optional"
                />
              </View>

              {sheetError ? (
                <Text style={{ fontSize: 13, color: C.danger, marginTop: 12 }}>{sheetError}</Text>
              ) : null}

              <Pressable
                onPress={confirm}
                disabled={submitting}
                style={{
                  marginTop: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: C.primary,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <Check size={20} color={C.onPrimary} />
                <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.onPrimary }}>
                  {submitting ? 'Working…' : `Confirm ${stage.toLowerCase()}`}
                </Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  mono,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  mono?: boolean;
}) {
  return (
    <View>
      <Text style={{ fontSize: 12.5, fontWeight: '600', color: C.fgMuted, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.fgSubtle}
        keyboardType={keyboardType ?? 'default'}
        style={{
          height: 48,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: C.border,
          backgroundColor: C.bg,
          paddingHorizontal: 14,
          fontSize: 15,
          color: C.fg,
          fontFamily: mono ? 'monospace' : undefined,
        }}
      />
    </View>
  );
}
