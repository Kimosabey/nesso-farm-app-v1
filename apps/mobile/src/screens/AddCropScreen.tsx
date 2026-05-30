/**
 * Add Crop — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/SCREENS.md "Add Crop" +
 *   screens_create.jsx form primitives (Seg / Check / crop chips):
 *   - Crop chips: Tuberose / Jasmine / Rose / Marigold / Chrysanthemum
 *   - Variety text input
 *   - Type segmented: Annual / Perennial  (maps to season Anytime / Perennial)
 *   - Area + unit (acre + kg/quintal/tonne/nos)
 *   - Sow date + expected harvest date (TextInput YYYY-MM-DD — datetimepicker
 *     is not installed, so plain text inputs are used; Expo Go safe)
 *   - Option toggles: multi-harvest, PoP enrolled
 *   - Sticky "Save crop" → api.createCrop → "Saved" / "Saved offline" → goBack
 *
 * Params: { farmId?: string; farmerId?: string }
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Check, Plus } from 'lucide-react-native';
import { api, ApiError, type CreateCropInput } from '@/api/client';

// Local nav/route param lists — AddCrop is registered by the parent navigator.
// Declared here so navigation typechecks without editing App.tsx / MainTabs.tsx.
type AddCropParamList = {
  AddCrop: { farmId?: string; farmerId?: string };
};
type Nav = NativeStackNavigationProp<AddCropParamList, 'AddCrop'>;
type AddCropRoute = RouteProp<AddCropParamList, 'AddCrop'>;

const C = {
  primary: '#0D783C',
  primary50: '#EAF6EE',
  accent: '#F1D412',
  bg: '#FAFDFA',
  bgElevated: '#FFFFFF',
  bgMuted: '#EEF3EF',
  fg: '#0F1A14',
  fgMuted: '#4A5A52',
  fgSubtle: '#7A8A82',
  border: '#DDE6E0',
  borderStrong: '#C4D2C9',
  onPrimary: '#FFFFFF',
  danger: '#B42318',
};

const CROPS = ['Tuberose', 'Jasmine', 'Rose', 'Marigold', 'Chrysanthemum'] as const;
const TYPES = ['Annual', 'Perennial'] as const;
type CropType = (typeof TYPES)[number];
const UNITS = ['kg', 'quintal', 'tonne', 'nos'] as const;
type Unit = (typeof UNITS)[number];

export function AddCropScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<AddCropRoute>();
  const farmId = route.params?.farmId;
  const farmerId = route.params?.farmerId;

  const [crop, setCrop] = useState<string>('Tuberose');
  const [variety, setVariety] = useState('');
  const [type, setType] = useState<CropType>('Annual');
  const [area, setArea] = useState('');
  const [unit, setUnit] = useState<Unit>('kg');
  const [sowDate, setSowDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [multiHarvest, setMultiHarvest] = useState(false);
  const [popEnrolled, setPopEnrolled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = !!farmId && !!farmerId && crop.trim().length > 0 && !busy;

  const handleSave = async () => {
    if (!canSave || !farmId || !farmerId) {
      if (!farmId || !farmerId) setError('Missing farm or farmer reference.');
      return;
    }
    setBusy(true);
    setError(null);
    const input: CreateCropInput = {
      farmId,
      farmerId,
      cropName: crop.trim(),
      cropVariety: variety.trim() || undefined,
      unit,
      acre: area ? Number(area) || 0 : undefined,
      sowingDate: sowDate.trim() || undefined,
      harvestDate: harvestDate.trim() || undefined,
      multipleHarvest: multiHarvest,
      season: type === 'Perennial' ? 'Perennial' : 'Anytime',
      practice: popEnrolled ? 'ORGANIC' : 'CONVENTIONAL',
    };
    try {
      const res = await api.createCrop(input);
      setToast(res.mode === 'online' ? 'Saved' : 'Saved offline');
      setTimeout(() => navigation.goBack(), 600);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to save crop';
      setError(msg);
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
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
          backgroundColor: C.bgElevated,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={24} color={C.fg} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Add crop</Text>
          {farmId ? <Text style={{ fontSize: 12, color: C.fgMuted }}>This farm</Text> : null}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Crop chips */}
          <Label>Crop</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {CROPS.map((c) => {
              const on = crop === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCrop(c)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 999,
                    backgroundColor: on ? C.primary : C.bgElevated,
                    borderWidth: on ? 0 : 1.5,
                    borderColor: C.borderStrong,
                  }}
                >
                  {on ? <Check size={14} color={C.onPrimary} strokeWidth={3} /> : null}
                  <Text style={{ fontSize: 13, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}>
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Variety */}
          <Label>Variety</Label>
          <TextInput
            value={variety}
            onChangeText={setVariety}
            placeholder="e.g. Single, African, Local"
            placeholderTextColor={C.fgSubtle}
            style={inputStyle}
          />
          <View style={{ height: 18 }} />

          {/* Type segmented */}
          <Label>Type</Label>
          <Segmented options={TYPES} value={type} onChange={setType} />
          <View style={{ height: 18 }} />

          {/* Area + unit */}
          <Label>Area</Label>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={area}
              onChangeText={(t) => setArea(t.replace(/[^0-9.]/g, ''))}
              placeholder="0.0"
              placeholderTextColor={C.fgSubtle}
              keyboardType="decimal-pad"
              style={[inputStyle, { flex: 1 }]}
            />
            <View style={{ flex: 1.4 }}>
              <Segmented options={UNITS} value={unit} onChange={setUnit} />
            </View>
          </View>
          <View style={{ height: 18 }} />

          {/* Dates */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Label>Sow date</Label>
              <TextInput
                value={sowDate}
                onChangeText={setSowDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.fgSubtle}
                autoCapitalize="none"
                style={inputStyle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label>Expected harvest</Label>
              <TextInput
                value={harvestDate}
                onChangeText={setHarvestDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.fgSubtle}
                autoCapitalize="none"
                style={inputStyle}
              />
            </View>
          </View>
          <View style={{ height: 18 }} />

          {/* Options */}
          <Label>Options</Label>
          <Toggle label="Multi-harvest crop" value={multiHarvest} onChange={setMultiHarvest} />
          <View style={{ height: 12 }} />
          <Toggle label="PoP enrolled (organic package of practices)" value={popEnrolled} onChange={setPopEnrolled} />

          {error ? (
            <View
              style={{
                marginTop: 18,
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
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast */}
      {toast ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: C.fg,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <Check size={16} color={C.accent} strokeWidth={3} />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{toast}</Text>
          </View>
        </View>
      ) : null}

      {/* Sticky Save crop */}
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
          onPress={handleSave}
          disabled={!canSave}
          style={{
            height: 52,
            borderRadius: 14,
            backgroundColor: canSave ? C.primary : C.borderStrong,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {busy ? (
            <ActivityIndicator color={C.onPrimary} />
          ) : (
            <>
              <Plus size={20} color={C.onPrimary} strokeWidth={2.4} />
              <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.onPrimary }}>Save crop</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const inputStyle = {
  height: 50,
  borderRadius: 13,
  borderWidth: 1.5,
  borderColor: C.borderStrong,
  backgroundColor: C.bgElevated,
  paddingHorizontal: 14,
  fontSize: 15,
  color: C.fg,
} as const;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fgMuted, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: C.bgMuted,
        borderRadius: 12,
        padding: 3,
        gap: 3,
      }}
    >
      {options.map((o) => {
        const on = value === o;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 9,
              alignItems: 'center',
              backgroundColor: on ? C.bgElevated : 'transparent',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: on ? C.primary : C.fgMuted }}>
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: value ? C.primary : C.bgElevated,
          borderWidth: value ? 0 : 1.5,
          borderColor: C.borderStrong,
        }}
      >
        {value ? <Check size={15} color={C.onPrimary} strokeWidth={3} /> : null}
      </View>
      <Text style={{ flex: 1, fontSize: 13.5, color: C.fgMuted, lineHeight: 20 }}>{label}</Text>
    </Pressable>
  );
}
