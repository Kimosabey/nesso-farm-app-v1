/**
 * AddActivityScreen — log a farm activity with category + key inputs.
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
import { ChevronLeft } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError } from '@/api/client';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORIES = [
  'Land Prep',
  'Planting',
  'Irrigation',
  'Fertilizer',
  'Pesticide',
  'Harvesting',
  'Post-harvest',
  'Other',
] as const;

type Category = (typeof CATEGORIES)[number];

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Dry'] as const;
type WeatherOption = (typeof WEATHER_OPTIONS)[number];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Props = NativeStackScreenProps<RootStackParamList, 'AddActivity'>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
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

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export function AddActivityScreen({ navigation, route }: Props) {
  const paramFarmId = route.params?.farmId ?? '';
  const paramFarmerId = route.params?.farmerId ?? '';

  // Step 1 — category
  const [category, setCategory] = useState<Category | null>(null);

  // Step 2 — form fields
  const [date, setDate] = useState(todayIso());
  const [farmId, setFarmId] = useState(paramFarmId);
  const [farmerId] = useState(paramFarmerId);
  const [notes, setNotes] = useState('');
  const [labourCount, setLabourCount] = useState('');
  const [inputUsed, setInputUsed] = useState('');
  const [weather, setWeather] = useState<WeatherOption | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave =
    category !== null && farmId.trim().length > 0 && date.trim().length > 0;

  const handleSave = async () => {
    setError(null);
    if (!category) return setError('Please select a category');
    if (!farmId.trim()) return setError('Farm ID is required');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      return setError('Date must be in YYYY-MM-DD format');
    }

    setBusy(true);
    try {
      await api.createActivity({
        farmId: farmId.trim(),
        farmerId: farmerId.trim(),
        category,
        date: date.trim(),
        notes: notes.trim() || undefined,
        labourCount: labourCount ? parseInt(labourCount, 10) : undefined,
        inputUsed: inputUsed.trim() || undefined,
        weather: weather ?? undefined,
      });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <View className="flex-row items-center justify-between border-b border-border bg-bg-elevated px-4 py-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="size-10 items-center justify-center rounded-full"
          hitSlop={8}
        >
          <ChevronLeft size={24} color="#0F1A14" />
        </Pressable>

        <Text className="flex-1 text-center text-base font-semibold text-fg">Add Activity</Text>

        <Pressable
          onPress={handleSave}
          disabled={!canSave || busy}
          className="px-3 py-1.5"
          hitSlop={8}
        >
          {busy ? (
            <ActivityIndicator size="small" color="#0D783C" />
          ) : (
            <Text
              style={{ color: canSave ? '#0D783C' : '#7A8A82' }}
              className="text-sm font-semibold"
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ---------------------------------------------------------------- */}
          {/* Step 1 — Category picker                                          */}
          {/* ---------------------------------------------------------------- */}
          <View className="px-4 pt-5 pb-2">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
              Activity Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    disabled={busy}
                    style={{
                      borderColor: active ? '#0D783C' : '#DDE6E0',
                      backgroundColor: active ? '#0D783C' : '#FFFFFF',
                    }}
                    className="rounded-full border px-4 py-2"
                  >
                    <Text
                      style={{ color: active ? '#FFFFFF' : '#0F1A14' }}
                      className="text-sm font-medium"
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Divider */}
          <View className="mx-4 my-2 h-px bg-border" />

          {/* ---------------------------------------------------------------- */}
          {/* Step 2 — Form fields                                              */}
          {/* ---------------------------------------------------------------- */}
          <View className="gap-4 px-4 pt-2">
            {/* Date */}
            <Field label="Date *" hint="YYYY-MM-DD">
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="e.g. 2025-06-15"
                placeholderTextColor="#7A8A82"
                editable={!busy}
                className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
              />
            </Field>

            {/* Farm ID */}
            <Field label="Farm ID *">
              {paramFarmId ? (
                <View className="h-12 justify-center rounded-md border border-border bg-bg-elevated px-3">
                  <Text className="font-mono text-sm text-fg-muted">{paramFarmId}</Text>
                </View>
              ) : (
                <TextInput
                  value={farmId}
                  onChangeText={setFarmId}
                  placeholder="Enter farm ID"
                  placeholderTextColor="#7A8A82"
                  autoCapitalize="none"
                  editable={!busy}
                  className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
                />
              )}
            </Field>

            {/* Activity notes */}
            <Field label="Activity notes">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Describe what was done…"
                placeholderTextColor="#7A8A82"
                multiline
                numberOfLines={3}
                editable={!busy}
                textAlignVertical="top"
                style={{ minHeight: 80 }}
                className="rounded-md border border-border bg-bg-elevated px-3 py-3 text-base text-fg"
              />
            </Field>

            {/* Labour count */}
            <Field label="Labour count">
              <TextInput
                value={labourCount}
                onChangeText={setLabourCount}
                keyboardType="number-pad"
                placeholder="e.g. 4"
                placeholderTextColor="#7A8A82"
                editable={!busy}
                className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
              />
            </Field>

            {/* Input used */}
            <Field label="Input used" hint="e.g. NPK 20kg, Urea 10kg">
              <TextInput
                value={inputUsed}
                onChangeText={setInputUsed}
                placeholder="e.g. NPK 20kg"
                placeholderTextColor="#7A8A82"
                autoCapitalize="words"
                editable={!busy}
                className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
              />
            </Field>

            {/* Weather chips */}
            <View>
              <Text className="mb-2 text-sm font-medium text-fg">Weather at time</Text>
              <View className="flex-row flex-wrap gap-2">
                {WEATHER_OPTIONS.map((w) => {
                  const active = weather === w;
                  return (
                    <Pressable
                      key={w}
                      onPress={() => setWeather(active ? null : w)}
                      disabled={busy}
                      style={{
                        borderColor: active ? '#0D783C' : '#DDE6E0',
                        backgroundColor: active ? '#0D783C' : '#FFFFFF',
                      }}
                      className="rounded-full border px-4 py-1.5"
                    >
                      <Text
                        style={{ color: active ? '#FFFFFF' : '#0F1A14' }}
                        className="text-sm font-medium"
                      >
                        {w}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <Text className="text-sm text-red-600">{error}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
