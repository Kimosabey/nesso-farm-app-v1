/**
 * AddActivityScreen — log a farm activity with a typed input picker.
 *
 * Spec source: design_handoff_nesso/app/screens_create2.jsx — AddActivityScreen
 *   - Activity type as a wrapped grid of 6 tiles (icon + label).
 *   - Date + farm selector row.
 *   - Inputs card: "Add" opens a bottom-sheet picker (search + category tabs +
 *     rate/unit); selected inputs get qty steppers + a running ₹ total.
 *   - Photo + Geotag tiles (visual). Sticky "Log activity".
 *
 * The existing api.createActivity contract is preserved: the 6 visual types map
 * onto its `category`, selected inputs serialise into `inputUsed`, and offline
 * params (farmId / farmerId) are untouched.
 */
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wheat,
  CloudRain,
  Leaf,
  Sprout,
  Search,
  Calendar,
  MapPin,
  Plus,
  Minus,
  X,
  Camera,
  Check,
  type LucideIcon,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError } from '@/api/client';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ACT_TYPES: Array<{ k: string; icon: LucideIcon }> = [
  { k: 'Spraying', icon: Droplets },
  { k: 'Fertilizer', icon: Wheat },
  { k: 'Irrigation', icon: CloudRain },
  { k: 'Weeding', icon: Leaf },
  { k: 'Harvest', icon: Sprout },
  { k: 'Scouting', icon: Search },
];

interface CatalogItem {
  n: string;
  u: string;
  rate: number;
  hint: string;
}
const CATEGORY_TABS = ['Chemical', 'Organic', 'Inventory', 'Other'] as const;
type CatTab = (typeof CATEGORY_TABS)[number];

const CATALOG: Record<CatTab, CatalogItem[]> = {
  Chemical: [
    { n: 'Mancozeb 75% WP', u: 'kg', rate: 320, hint: 'Fungicide' },
    { n: 'Imidacloprid 17.8%', u: 'ml', rate: 4, hint: 'Insecticide' },
    { n: 'Chlorpyriphos 20%', u: 'ml', rate: 2, hint: 'Insecticide' },
    { n: 'Carbendazim 50% WP', u: 'g', rate: 1, hint: 'Fungicide' },
    { n: 'Urea 46% N', u: 'kg', rate: 12, hint: 'Nitrogen' },
  ],
  Organic: [
    { n: 'Neem oil', u: 'L', rate: 480, hint: 'Bio-pesticide' },
    { n: 'Vermicompost', u: 'kg', rate: 14, hint: 'Soil amendment' },
    { n: 'Jeevamrutha', u: 'L', rate: 8, hint: 'Bio-stimulant' },
    { n: 'Panchagavya', u: 'L', rate: 60, hint: 'Foliar' },
  ],
  Inventory: [
    { n: 'Drip lateral 16mm', u: 'm', rate: 18, hint: 'Stock' },
    { n: 'Mulch film', u: 'm', rate: 9, hint: 'Stock' },
    { n: 'Gunny bags', u: 'pc', rate: 22, hint: 'Stock' },
  ],
  Other: [
    { n: 'Labour — spraying', u: 'hr', rate: 90, hint: 'Wage' },
    { n: 'Tractor hire', u: 'hr', rate: 650, hint: 'Machinery' },
    { n: 'Transport', u: 'trip', rate: 400, hint: 'Logistics' },
  ],
};

interface SelectedInput extends CatalogItem {
  qty: number;
}

type Props = NativeStackScreenProps<RootStackParamList, 'AddActivity'>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Count-up money readout
// ---------------------------------------------------------------------------
function useCountUp(target: number): string {
  const anim = useRef(new Animated.Value(target)).current;
  const [display, setDisplay] = useState(Math.round(target));
  useEffect(() => {
    const id = anim.addListener(({ value }) => setDisplay(Math.round(value)));
    Animated.timing(anim, { toValue: target, duration: 350, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [target, anim]);
  return display.toLocaleString();
}

// ---------------------------------------------------------------------------
// Press-scale pressable
// ---------------------------------------------------------------------------
function Scale({
  onPress,
  disabled,
  style,
  children,
  hitSlop,
}: {
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
  children: React.ReactNode;
  hitSlop?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => [style, { transform: [{ scale: pressed ? 0.94 : 1 }], opacity: disabled ? 0.5 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Input picker bottom sheet
// ---------------------------------------------------------------------------
function InputPicker({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (it: CatalogItem) => void;
}) {
  const C = useTheme().c;
  const [tab, setTab] = useState<CatTab>('Chemical');
  const [q, setQ] = useState('');
  const items = CATALOG[tab].filter((i) => i.n.toLowerCase().includes(q.toLowerCase()));

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: C.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 }}>
          <View style={{ alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: C.borderStrong, marginBottom: 14 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg }}>Add input</Text>
            <Scale onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
              <X size={22} color={C.fgMuted} />
            </Scale>
          </View>

          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              height: 46,
              paddingHorizontal: 14,
              borderRadius: 13,
              backgroundColor: C.bgMuted,
              marginBottom: 12,
            }}
          >
            <Search size={18} color={C.fgSubtle} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search 180+ inputs…"
              placeholderTextColor={C.fgSubtle}
              style={{ flex: 1, fontSize: 15, color: C.fg }}
            />
          </View>

          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 6 }}>
            {CATEGORY_TABS.map((t) => {
              const on = tab === t;
              return (
                <Scale
                  key={t}
                  onPress={() => setTab(t)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: on ? C.primary : C.bgElevated,
                    borderWidth: on ? 0 : 1.5,
                    borderColor: C.border,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}>{t}</Text>
                </Scale>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={{ maxHeight: 340 }} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12 }}>
          {items.map((it) => (
            <Scale
              key={it.n}
              onPress={() => {
                onAdd(it);
                onClose();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 13,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: C.primary50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Droplets size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: C.fg }}>{it.n}</Text>
                <Text style={{ fontSize: 12, color: C.fgMuted }}>
                  {it.hint} · ₹{it.rate}/{it.u}
                </Text>
              </View>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: C.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={17} color={C.onPrimary} strokeWidth={2.6} />
              </View>
            </Scale>
          ))}
          {items.length === 0 ? (
            <Text style={{ textAlign: 'center', paddingVertical: 30, color: C.fgSubtle, fontSize: 14 }}>
              No inputs match &ldquo;{q}&rdquo;.
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export function AddActivityScreen({ navigation, route }: Props) {
  const C = useTheme().c;
  const toast = useToast();
  const paramFarmId = route.params?.farmId ?? '';
  const paramFarmerId = route.params?.farmerId ?? '';

  const [type, setType] = useState<string | null>(null);
  const [date, setDate] = useState(todayIso());
  const [farmId, setFarmId] = useState(paramFarmId);
  const [farmerId] = useState(paramFarmerId);
  const [notes, setNotes] = useState('');
  const [inputs, setInputs] = useState<SelectedInput[]>([]);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  const total = inputs.reduce((s, i) => s + i.rate * i.qty, 0);
  const totalDisplay = useCountUp(total);

  const canSave = type !== null && farmId.trim().length > 0 && date.trim().length > 0;

  const setQty = (idx: number, d: number) =>
    setInputs((arr) => arr.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty + d) } : it)));
  const removeInput = (idx: number) => setInputs((arr) => arr.filter((_, i) => i !== idx));
  const addInput = (it: CatalogItem) => setInputs((arr) => [...arr, { ...it, qty: 1 }]);

  const handleSave = async () => {
    if (!type) {
      toast.error('Select an activity type');
      return;
    }
    if (!farmId.trim()) {
      toast.error('Farm ID is required');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      toast.error('Date must be in YYYY-MM-DD format');
      return;
    }

    setBusy(true);
    try {
      const inputUsed = inputs.length
        ? inputs.map((i) => `${i.n} ${i.qty}${i.u}`).join(', ')
        : undefined;
      await api.createActivity({
        farmId: farmId.trim(),
        farmerId: farmerId.trim(),
        category: type,
        date: date.trim(),
        notes: notes.trim() || undefined,
        inputUsed,
      });
      toast.success(`${type} logged · ₹${total.toLocaleString()}`);
      navigation.goBack();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
          backgroundColor: C.bgElevated,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Scale
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={24} color={C.fg} />
        </Scale>
        <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg }}>Log activity</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          {/* Activity type grid */}
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fgMuted, marginBottom: 10 }}>Activity type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 16 }}>
            {ACT_TYPES.map((a) => {
              const on = type === a.k;
              const Ic = a.icon;
              return (
                <Scale
                  key={a.k}
                  onPress={() => setType(a.k)}
                  disabled={busy}
                  style={{
                    width: '31.5%',
                    alignItems: 'center',
                    gap: 7,
                    paddingVertical: 14,
                    borderRadius: 14,
                    borderWidth: on ? 2 : 1.5,
                    borderColor: on ? C.primary : C.border,
                    backgroundColor: on ? C.primary50 : C.bgElevated,
                  }}
                >
                  <Ic size={22} color={on ? C.primary : C.fgMuted} strokeWidth={on ? 2.1 : 1.7} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: on ? C.primary : C.fgMuted }}>{a.k}</Text>
                </Scale>
              );
            })}
          </View>

          {/* Date + farm row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 9,
                height: 54,
                paddingHorizontal: 14,
                borderRadius: 13,
                backgroundColor: C.bgElevated,
                borderWidth: 1.5,
                borderColor: C.borderStrong,
              }}
            >
              <Calendar size={18} color={C.primary} />
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.fgSubtle}
                editable={!busy}
                style={{ flex: 1, fontSize: 14, fontWeight: '500', color: C.fg }}
              />
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 9,
                height: 54,
                paddingHorizontal: 14,
                borderRadius: 13,
                backgroundColor: C.bgElevated,
                borderWidth: 1.5,
                borderColor: C.borderStrong,
              }}
            >
              <MapPin size={18} color={C.primary} />
              {paramFarmId ? (
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, fontWeight: '500', color: C.fg, fontFamily: 'monospace' }}>
                  {paramFarmId}
                </Text>
              ) : (
                <TextInput
                  value={farmId}
                  onChangeText={setFarmId}
                  placeholder="Farm ID"
                  placeholderTextColor={C.fgSubtle}
                  autoCapitalize="none"
                  editable={!busy}
                  style={{ flex: 1, fontSize: 14, fontWeight: '500', color: C.fg }}
                />
              )}
              <ChevronRight size={16} color={C.fgSubtle} />
            </View>
          </View>

          {/* Inputs card */}
          <View
            style={{
              backgroundColor: C.bgElevated,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: C.border,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.fg }}>Inputs used</Text>
              <Scale
                onPress={() => setPicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: C.primary50,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                }}
              >
                <Plus size={15} color={C.primary} strokeWidth={2.6} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.primary }}>Add</Text>
              </Scale>
            </View>

            {inputs.map((it, i) => (
              <View
                key={`${it.n}-${i}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 11,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: C.border,
                }}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.fg }}>{it.n}</Text>
                  <Text style={{ fontSize: 12, color: C.fgMuted, fontFamily: 'monospace' }}>
                    ₹{it.rate}/{it.u} · ₹{(it.rate * it.qty).toLocaleString()}
                  </Text>
                </View>
                <Scale
                  onPress={() => setQty(i, -1)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: C.borderStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Minus size={16} color={C.fg} />
                </Scale>
                <Text style={{ minWidth: 44, textAlign: 'center', fontSize: 14, fontWeight: '600', color: C.fg, fontFamily: 'monospace' }}>
                  {it.qty} {it.u}
                </Text>
                <Scale
                  onPress={() => setQty(i, 1)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: C.borderStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={16} color={C.fg} />
                </Scale>
                <Scale onPress={() => removeInput(i)} hitSlop={6} style={{ padding: 2 }}>
                  <X size={16} color={C.fgSubtle} />
                </Scale>
              </View>
            ))}

            {inputs.length === 0 ? (
              <Text style={{ paddingHorizontal: 16, paddingBottom: 14, fontSize: 13, color: C.fgSubtle, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 14 }}>
                No inputs added yet.
              </Text>
            ) : null}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 13,
                borderTopWidth: 1,
                borderTopColor: C.border,
                backgroundColor: C.bgMuted,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.fgMuted }}>Total cost</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: C.primary, fontFamily: 'monospace' }}>₹{totalDisplay}</Text>
            </View>
          </View>

          {/* Notes */}
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fgMuted, marginBottom: 8 }}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe what was done…"
            placeholderTextColor={C.fgSubtle}
            multiline
            editable={!busy}
            textAlignVertical="top"
            style={{
              minHeight: 80,
              borderRadius: 13,
              borderWidth: 1.5,
              borderColor: C.borderStrong,
              backgroundColor: C.bgElevated,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: C.fg,
              marginBottom: 16,
            }}
          />

          {/* Photo + Geotag tiles */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Scale
              onPress={() => toast.info('Photo capture needs a dev build')}
              style={{
                flex: 1,
                aspectRatio: 1.3,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: C.borderStrong,
                borderStyle: 'dashed',
                backgroundColor: C.bgMuted,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <Camera size={24} color={C.primary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.fgMuted }}>Add photo</Text>
            </Scale>
            <Scale
              onPress={() => toast.info('Geotag needs a dev build')}
              style={{
                flex: 1,
                aspectRatio: 1.3,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: C.borderStrong,
                backgroundColor: C.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <MapPin size={24} color={C.secondaryD} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.fgMuted }}>Geotag</Text>
              <Text style={{ fontSize: 10, color: C.fgSubtle, fontFamily: 'monospace' }}>13.16°N 75.86°E</Text>
            </Scale>
          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 28,
            borderTopWidth: 1,
            borderTopColor: C.border,
            backgroundColor: C.bgElevated,
          }}
        >
          <Scale
            onPress={handleSave}
            disabled={!canSave || busy}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              paddingVertical: 15,
              borderRadius: 14,
              backgroundColor: canSave ? C.primary : C.bgMuted,
            }}
          >
            {busy ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <>
                <Check size={20} color={canSave ? C.onPrimary : C.fgSubtle} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: canSave ? C.onPrimary : C.fgSubtle }}>Log activity</Text>
              </>
            )}
          </Scale>
        </View>
      </KeyboardAvoidingView>

      <InputPicker open={picker} onClose={() => setPicker(false)} onAdd={addInput} />
    </SafeAreaView>
  );
}
