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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, ApiError, type CreateFarmerInput } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type TabParamList = {
  Dashboard: undefined;
  Farmers: undefined;
  Register: undefined;
  Verify: undefined;
  Sync: undefined;
};
type Props = BottomTabScreenProps<TabParamList, 'Register'>;

export function RegisterFarmerScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [practice, setPractice] = useState<CreateFarmerInput['productionPractice']>('Conventional');
  const [crops, setCrops] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to sync status (one-time; OfflineBanner uses it)
  useState(() => {
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setSyncStatus(e.status);
    });
    return unsub;
  });

  const reset = () => {
    setFirstName('');
    setLastName('');
    setMobile('');
    setVillage('');
    setDistrict('');
    setPincode('');
    setCrops('');
    setError(null);
  };

  const submit = async () => {
    setError(null);

    if (!firstName.trim()) return setError('First name is required');
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return setError('Mobile must be 10 digits starting 6–9');
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return setError('Pincode must be 6 digits');
    }

    const input: CreateFarmerInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      mobileNumber: mobile,
      address: {
        village: village.trim() || undefined,
        district: district.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode || undefined,
      },
      productionPractice: practice,
      selectedCrops: crops
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setBusy(true);
    try {
      const r = await api.createFarmer(input);
      if (r.mode === 'online') {
        Alert.alert('Registered', `${r.farmer.firstName} (${r.farmer.farmerId}) — pending approval.`, [
          {
            text: 'OK',
            onPress: () => {
              reset();
              navigation.navigate('Farmers');
            },
          },
        ]);
      } else {
        // Queued offline
        void sync.kick();
        Alert.alert(
          'Saved offline',
          'This farmer is queued and will sync the next time you have network.',
          [
            {
              text: 'OK',
              onPress: () => {
                reset();
                navigation.navigate('Sync');
              },
            },
          ],
        );
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <OfflineBanner status={syncStatus} />

      <View className="border-b border-border bg-bg-elevated px-6 py-4">
        <Text className="font-display text-2xl text-fg tracking-tight">Register a farmer</Text>
        <Text className="mt-1 text-sm text-fg-muted">
          {syncStatus?.online === false
            ? "You're offline — this will queue and sync later."
            : 'Saves to the server immediately.'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="px-6 py-6 gap-4">
          <Field label="First name *">
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>

          <Field label="Last name">
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoComplete="family-name"
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>

          <Field label="Mobile number *" hint="10 digits, starts 6–9">
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              keyboardType="number-pad"
              maxLength={10}
              autoComplete="tel"
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>

          <Text className="mt-2 text-xs uppercase tracking-wider text-fg-subtle">Address</Text>

          <Field label="Village">
            <TextInput
              value={village}
              onChangeText={setVillage}
              autoCapitalize="words"
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>
          <Field label="District">
            <TextInput
              value={district}
              onChangeText={setDistrict}
              autoCapitalize="words"
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>
          <Field label="State">
            <TextInput
              value={state}
              onChangeText={setState}
              autoCapitalize="words"
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>
          <Field label="Pincode">
            <TextInput
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>

          <Text className="mt-2 text-xs uppercase tracking-wider text-fg-subtle">Practice</Text>

          <View className="flex-row flex-wrap gap-2">
            {(['Conventional', 'Organic', 'NaturalFarming', 'GAPCertified'] as const).map((p) => {
              const active = practice === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPractice(p)}
                  disabled={busy}
                  className={`rounded-full px-3 py-1.5 ${
                    active ? 'bg-primary' : 'border border-border-strong bg-bg-muted'
                  }`}
                >
                  <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-fg'}`}>
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Field label="Crops" hint="Comma-separated, e.g. Tuberose, Jasmine">
            <TextInput
              value={crops}
              onChangeText={setCrops}
              autoCapitalize="words"
              editable={!busy}
              className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
            />
          </Field>

          {error ? (
            <View className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
              <Text className="text-sm text-danger">{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={busy}
            className="mt-2 h-12 items-center justify-center rounded-md bg-primary active:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-medium text-white">Register</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text className="mb-1.5 text-sm font-medium text-fg">{label}</Text>
      {children}
      {hint ? <Text className="mt-1 text-xs text-fg-subtle">{hint}</Text> : null}
    </View>
  );
}
