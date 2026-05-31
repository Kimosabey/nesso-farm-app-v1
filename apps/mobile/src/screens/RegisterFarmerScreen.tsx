/**
 * Register Farmer — 100% spec parity with design handoff (4-step sticky wizard).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_create.jsx
 *   + SCREENS.md "Register Farmer (4-step sticky form)".
 *
 * Steps: Personal / ID / Bank / Consent.
 *   §1 First/Last name, gender segmented (Female/Male/Other), +91 mobile (10-digit).
 *   §2 ID type segmented (Aadhaar/PAN/VoterID), ID number, front/back photo tiles
 *      (visual placeholders — expo-camera needs a dev build, so tap → info alert).
 *   §3 Account number, IFSC (hint "ABCD0123456") — optional.
 *   §4 Crop multi-select chips + consent checkbox.
 *   Bottom nav: Back (step > 1) + Next / Save. "Save farmer" enabled only when
 *   name + 10-digit mobile + consent checked.
 *
 * Preserves the existing API logic: sync.subscribe + OfflineBanner,
 * api.createFarmer → { mode: 'online' | 'queued' }, sync.kick on queue,
 * navigation via the bottom-tab nav (no route params expected).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ArrowLeft, ArrowRight, Check, Camera } from 'lucide-react-native';
import { api, ApiError, type CreateFarmerInput } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { MainTabParamList } from '@/navigation/MainTabs';
import { useTheme } from '@/theme';
import { useToast } from '@/components/Toast';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Register'>;

const STEPS = ['Personal', 'ID', 'Bank', 'Consent'] as const;
const GENDERS = ['Female', 'Male', 'Other'] as const;
type Gender = (typeof GENDERS)[number];
const GENDER_API: Record<Gender, NonNullable<CreateFarmerInput['gender']>> = {
  Female: 'F',
  Male: 'M',
  Other: 'Other',
};
const ID_TYPES = ['Aadhaar', 'PAN', 'VoterID'] as const;
const CROPS = ['Tuberose', 'Rose', 'Marigold', 'Jasmine', 'Chrysanthemum', 'Other'] as const;

// --- shared primitives (inline-styled to match SplashScreen/FarmersScreen) ---

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const C = useTheme().c;
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
              borderWidth: on ? 1 : 0,
              borderColor: C.border,
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

function Field({
  label,
  prefix,
  hint,
  required,
  ...input
}: {
  label: string;
  prefix?: string;
  hint?: string;
  required?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  const C = useTheme().c;
  return (
    <View>
      <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fgMuted, marginBottom: 8 }}>
        {label}
        {required ? <Text style={{ color: C.danger }}> *</Text> : null}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 48,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: C.border,
          backgroundColor: C.bgElevated,
          paddingHorizontal: 14,
        }}
      >
        {prefix ? (
          <Text style={{ fontSize: 15, color: C.fgMuted, fontWeight: '600', marginRight: 8 }}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          placeholderTextColor={C.fgSubtle}
          style={{ flex: 1, fontSize: 15, color: C.fg }}
          {...input}
        />
      </View>
      {hint ? <Text style={{ fontSize: 12, color: C.fgSubtle, marginTop: 6 }}>{hint}</Text> : null}
    </View>
  );
}

function PhotoTile({ label }: { label: string }) {
  const C = useTheme().c;
  const toast = useToast();
  return (
    <Pressable
      onPress={() => toast.info('Photo capture needs a dev build')}
      style={{
        flex: 1,
        aspectRatio: 1.3,
        borderRadius: 14,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: C.borderStrong,
        backgroundColor: C.bgMuted,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
      }}
    >
      <Camera size={24} color={C.primary} />
      <Text style={{ fontSize: 12, fontWeight: '600', color: C.fgMuted }}>{label}</Text>
    </Pressable>
  );
}

function FormSection({
  n,
  title,
  desc,
  children,
}: {
  n: number;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  const C = useTheme().c;
  return (
    <View
      style={{
        backgroundColor: C.bgElevated,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 18,
        marginBottom: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: desc ? 4 : 16 }}>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            backgroundColor: C.primary50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700' }}>{n}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.fg }}>{title}</Text>
      </View>
      {desc ? (
        <Text style={{ fontSize: 12.5, color: C.fgSubtle, marginLeft: 36, marginBottom: 16 }}>
          {desc}
        </Text>
      ) : null}
      <View style={{ gap: 14 }}>{children}</View>
    </View>
  );
}

export function RegisterFarmerScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const toast = useToast();

  const [step, setStep] = useState(0); // 0..3
  // §1 Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [mobile, setMobile] = useState('');
  // §2 ID
  const [idType, setIdType] = useState<(typeof ID_TYPES)[number]>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  // §3 Bank (optional)
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  // §4 Consent
  const [crops, setCrops] = useState<string[]>(['Tuberose']);
  const [consent, setConsent] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // animated progress fill (Expo Go safe — no reanimated worklets)
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: (step + 1) / STEPS.length,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [step, progress]);

  useEffect(() => {
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setSyncStatus(e.status);
    });
    return unsub;
  }, []);

  const mobileValid = /^[6-9]\d{9}$/.test(mobile);
  const canSave = firstName.trim().length > 0 && mobileValid && consent;
  const isLast = step === STEPS.length - 1;

  const toggleCrop = (c: string) =>
    setCrops((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const reset = () => {
    setStep(0);
    setFirstName('');
    setLastName('');
    setGender('Female');
    setMobile('');
    setIdType('Aadhaar');
    setIdNumber('');
    setAccount('');
    setIfsc('');
    setCrops(['Tuberose']);
    setConsent(false);
    setError(null);
  };

  const next = () => {
    setError(null);
    if (step === 0) {
      if (!firstName.trim()) return setError('First name is required');
      if (!mobileValid) return setError('Mobile must be 10 digits starting 6–9');
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setError(null);
    if (!canSave) return;

    const input: CreateFarmerInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      mobileNumber: mobile,
      gender: GENDER_API[gender],
      selectedCrops: crops,
    };

    setBusy(true);
    try {
      const r = await api.createFarmer(input);
      if (r.mode === 'online') {
        toast.success(`${r.farmer.firstName} saved — pending approval`);
      } else {
        void sync.kick();
        toast.info('Saved offline — syncs when online');
      }
      reset();
      navigation.navigate('Farmers');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const widthPct = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      }),
    [progress],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <OfflineBanner status={syncStatus} />

      {/* header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
          backgroundColor: C.bgElevated,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg, letterSpacing: -0.2 }}>
          Register farmer
        </Text>
        <Text style={{ fontSize: 12, color: C.fgMuted, marginTop: 2 }}>
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </Text>
      </View>

      {/* progress bar — 4 segments, completed = checked, active = highlighted */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <View key={s} style={{ flex: 1 }}>
                <View
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: done || active ? C.primary : C.borderStrong,
                  }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {done ? <Check size={11} color={C.primary} /> : null}
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: '600',
                      color: done || active ? C.primary : C.fgSubtle,
                    }}
                  >
                    {s}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        {/* animated overall fill (subtle, under the segments) */}
        <View
          style={{
            height: 2,
            borderRadius: 1,
            backgroundColor: C.bgMuted,
            marginTop: 10,
            overflow: 'hidden',
          }}
        >
          <Animated.View style={{ height: 2, backgroundColor: C.primary, width: widthPct }} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
          {step === 0 ? (
            <FormSection n={1} title="Personal details">
              <Field
                label="First name"
                required
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                placeholder="e.g. Lakshmi"
                editable={!busy}
              />
              <Field
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                placeholder="e.g. Gowda"
                editable={!busy}
              />
              <View>
                <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fgMuted, marginBottom: 8 }}>
                  Gender
                </Text>
                <Segmented options={GENDERS} value={gender} onChange={setGender} />
              </View>
              <Field
                label="Mobile number"
                required
                prefix="+91"
                value={mobile}
                onChangeText={(v) => setMobile(v.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="98765 43210"
                editable={!busy}
              />
            </FormSection>
          ) : null}

          {step === 1 ? (
            <FormSection n={2} title="ID proof" desc="Photo of both sides">
              <Segmented options={ID_TYPES} value={idType} onChange={setIdType} />
              <Field
                label={`${idType} number`}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder={idType === 'Aadhaar' ? '0000 0000 0000' : 'ABCDE1234F'}
                autoCapitalize="characters"
                editable={!busy}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <PhotoTile label="Front" />
                <PhotoTile label="Back" />
              </View>
            </FormSection>
          ) : null}

          {step === 2 ? (
            <FormSection n={3} title="Bank account" desc="For procurement payments · optional">
              <Field
                label="Account number"
                value={account}
                onChangeText={(v) => setAccount(v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                placeholder="0000 0000 0000"
                editable={!busy}
              />
              <Field
                label="IFSC code"
                value={ifsc}
                onChangeText={(v) => setIfsc(v.toUpperCase())}
                autoCapitalize="characters"
                placeholder="HDFC0001234"
                hint="Format: ABCD0123456"
                editable={!busy}
              />
            </FormSection>
          ) : null}

          {step === 3 ? (
            <>
              <FormSection n={4} title="Crop preferences">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {CROPS.map((c) => {
                    const on = crops.includes(c);
                    return (
                      <Pressable
                        key={c}
                        onPress={() => toggleCrop(c)}
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
                        {on ? <Check size={14} color={C.onPrimary} /> : null}
                        <Text
                          style={{ fontSize: 13, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}
                        >
                          {c}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </FormSection>

              <Pressable
                onPress={() => setConsent((v) => !v)}
                style={{ flexDirection: 'row', gap: 11, paddingHorizontal: 4, paddingBottom: 8 }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    marginTop: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: consent ? C.primary : C.bgElevated,
                    borderWidth: consent ? 0 : 1.5,
                    borderColor: C.borderStrong,
                  }}
                >
                  {consent ? <Check size={15} color={C.onPrimary} /> : null}
                </View>
                <Text style={{ flex: 1, fontSize: 13.5, color: C.fgMuted, lineHeight: 20 }}>
                  Farmer consents to data collection
                </Text>
              </Pressable>
            </>
          ) : null}

          {error ? (
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(180,35,24,0.3)',
                backgroundColor: 'rgba(180,35,24,0.06)',
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 14, color: C.danger }}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* sticky bottom nav */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 28,
            borderTopWidth: 1,
            borderTopColor: C.border,
            backgroundColor: C.bgElevated,
          }}
        >
          {step > 0 ? (
            <Pressable
              onPress={back}
              disabled={busy}
              style={{
                height: 50,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: C.borderStrong,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <ArrowLeft size={18} color={C.fg} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>Back</Text>
            </Pressable>
          ) : null}

          {isLast ? (
            <Pressable
              onPress={submit}
              disabled={busy || !canSave}
              style={{
                flex: 1,
                height: 50,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 14,
                backgroundColor: C.primary,
                opacity: busy || !canSave ? 0.5 : 1,
              }}
            >
              {busy ? (
                <ActivityIndicator color={C.onPrimary} />
              ) : (
                <>
                  <Check size={18} color={C.onPrimary} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.onPrimary }}>
                    Save farmer
                  </Text>
                </>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={next}
              disabled={busy}
              style={{
                flex: 1,
                height: 50,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 14,
                backgroundColor: C.primary,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.onPrimary }}>Next</Text>
              <ArrowRight size={18} color={C.onPrimary} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
