/**
 * AddFarmScreen — draw a farm boundary polygon on a map.
 *
 * react-native-maps requires a dev build (not Expo Go).
 * We guard the import with the same isExpoGo pattern used in
 * src/firebase/auth.ts: check ExecutionEnvironment first,
 * then wrap the require in try/catch as a belt-and-braces fallback.
 */
import { useState, useCallback } from 'react';
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
import { ChevronLeft, MapPin } from 'lucide-react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api } from '@/api/client';
import { useToast } from '@/components/Toast';

// ---------------------------------------------------------------------------
// Expo Go guard — identical pattern to src/firebase/auth.ts
// ---------------------------------------------------------------------------
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Lazily-loaded react-native-maps types & components (dev build only)
interface LatLng {
  latitude: number;
  longitude: number;
}

interface MapPressEventNative {
  nativeEvent: { coordinate: LatLng };
}

type MapViewModule = {
  default: React.ComponentType<{
    style?: object;
    initialRegion?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
    onPress?: (e: MapPressEventNative) => void;
    children?: React.ReactNode;
  }>;
  Polygon: React.ComponentType<{
    coordinates: LatLng[];
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
  }>;
  Marker: React.ComponentType<{
    coordinate: LatLng;
    anchor?: { x: number; y: number };
    children?: React.ReactNode;
  }>;
};

let mapsModule: MapViewModule | null = null;
function loadMaps(): MapViewModule | null {
  if (isExpoGo || Platform.OS === 'web') return null;
  if (mapsModule) return mapsModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mapsModule = require('react-native-maps') as MapViewModule;
    return mapsModule;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shoelace / spherical-excess area calculation (sq km → acres)
// ---------------------------------------------------------------------------
function calcAreaAcres(pts: Array<{ latitude: number; longitude: number }>): number {
  if (pts.length < 3) return 0;
  let area = 0;
  const R = 6371; // km
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const xi = pts[i]!.longitude * (Math.PI / 180);
    const xj = pts[j]!.longitude * (Math.PI / 180);
    const yi = pts[i]!.latitude * (Math.PI / 180);
    const yj = pts[j]!.latitude * (Math.PI / 180);
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
  }
  area = Math.abs(area) * R * R * 0.5;
  return area * 247.105; // sq km → acres
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Props = NativeStackScreenProps<RootStackParamList, 'AddFarm'>;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
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
export function AddFarmScreen({ navigation, route }: Props) {
  const farmerId = route.params?.farmerId ?? '';
  const toast = useToast();

  const [vertices, setVertices] = useState<LatLng[]>([]);
  const [farmName, setFarmName] = useState('');
  const [village, setVillage] = useState('');
  const [busy, setBusy] = useState(false);

  const area = calcAreaAcres(vertices);
  const canSave = vertices.length >= 3 && farmName.trim().length > 0;

  const handleMapPress = useCallback((e: MapPressEventNative) => {
    setVertices((prev) => [...prev, e.nativeEvent.coordinate]);
  }, []);

  const handleUndo = useCallback(() => {
    setVertices((prev) => prev.slice(0, -1));
  }, []);

  const handleSave = async () => {
    if (!canSave) return;
    if (!farmerId) {
      toast.error('No farmer ID provided');
      return;
    }
    setBusy(true);
    try {
      // Centroid lat/lng from vertices
      const lat =
        vertices.reduce((sum, v) => sum + v.latitude, 0) / vertices.length;
      const lng =
        vertices.reduce((sum, v) => sum + v.longitude, 0) / vertices.length;

      await api.createFarm({
        farmerId,
        farmName: farmName.trim(),
        latitude: lat,
        longitude: lng,
        polygonPoints: vertices.map((v) => ({ lat: v.latitude, lng: v.longitude })),
      });
      navigation.goBack();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save farm');
    } finally {
      setBusy(false);
    }
  };

  const maps = loadMaps();

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

        <Text className="flex-1 text-center text-base font-semibold text-fg">Add Farm</Text>

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

      {/* ------------------------------------------------------------------ */}
      {/* Map area                                                             */}
      {/* ------------------------------------------------------------------ */}
      {isExpoGo || !maps ? (
        /* --- Expo Go placeholder ----------------------------------------- */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView contentContainerClassName="flex-grow px-4 py-6 gap-4">
            {/* Placeholder card */}
            <View className="items-center rounded-2xl border border-border bg-bg-elevated p-6">
              <View className="mb-3 size-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin size={24} color="#0D783C" />
              </View>
              <Text className="text-center text-sm font-semibold text-fg">
                Map editor requires a dev build
              </Text>
              <Text className="mt-1 text-center text-xs text-fg-muted">
                Polygon drawing is unavailable in Expo Go. Run{' '}
                <Text className="font-mono">expo run:ios</Text> or{' '}
                <Text className="font-mono">expo run:android</Text> to use the full map editor.
              </Text>
            </View>

            {/* Form fields still available in Expo Go */}
            <Field label="Farm name *">
              <TextInput
                value={farmName}
                onChangeText={setFarmName}
                autoCapitalize="words"
                placeholder="e.g. North Field"
                placeholderTextColor="#7A8A82"
                className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
              />
            </Field>

            <Field label="Village / location">
              <TextInput
                value={village}
                onChangeText={setVillage}
                autoCapitalize="words"
                placeholder="e.g. Channapatna"
                placeholderTextColor="#7A8A82"
                className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
              />
            </Field>

            {farmerId ? (
              <Field label="Farmer ID">
                <View className="h-12 justify-center rounded-md border border-border bg-bg-elevated px-3">
                  <Text className="font-mono text-sm text-fg-muted">{farmerId}</Text>
                </View>
              </Field>
            ) : null}

            <View className="rounded-lg border border-border bg-bg-elevated px-4 py-3">
              <Text className="text-xs text-fg-subtle">
                Area: <Text className="font-semibold text-fg">-- acres</Text> (draw polygon in dev build)
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        /* --- Full map editor (dev / prod build) --------------------------- */
        <>
          {/* Map */}
          <View className="flex-1">
            <maps.default
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 12.97,
                longitude: 77.59,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              onPress={handleMapPress}
            >
              {vertices.length >= 3 ? (
                <maps.Polygon
                  coordinates={vertices}
                  fillColor="rgba(13,120,60,0.2)"
                  strokeColor="#0D783C"
                  strokeWidth={2}
                />
              ) : null}
              {vertices.map((v, i) => (
                <maps.Marker
                  key={i}
                  coordinate={v}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#0D783C',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}
                  />
                </maps.Marker>
              ))}
            </maps.default>

            {/* Vertex count chip */}
            <View
              style={{ position: 'absolute', bottom: 12, alignSelf: 'center' }}
              className="rounded-full border border-border bg-bg-elevated px-4 py-2 shadow-sm"
            >
              <Text className="text-xs text-fg-muted">
                <Text className="font-semibold text-fg">{vertices.length}</Text> points
                {vertices.length < 3 ? ' (min 3 to save)' : ' ✓'}
              </Text>
            </View>

            {/* Undo button */}
            {vertices.length > 0 ? (
              <Pressable
                onPress={handleUndo}
                style={{ position: 'absolute', top: 12, right: 12 }}
                className="rounded-full border border-border bg-bg-elevated px-3 py-2"
              >
                <Text className="text-xs font-medium text-fg">Undo</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Form below map */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}
              keyboardShouldPersistTaps="handled"
            >
              <Field label="Farm name *">
                <TextInput
                  value={farmName}
                  onChangeText={setFarmName}
                  autoCapitalize="words"
                  placeholder="e.g. North Field"
                  placeholderTextColor="#7A8A82"
                  className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
                />
              </Field>

              <Field label="Village / location">
                <TextInput
                  value={village}
                  onChangeText={setVillage}
                  autoCapitalize="words"
                  placeholder="e.g. Channapatna"
                  placeholderTextColor="#7A8A82"
                  className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
                />
              </Field>

              <View className="flex-row items-center justify-between rounded-lg border border-border bg-bg-elevated px-4 py-3">
                <Text className="text-sm text-fg-muted">Computed area</Text>
                <Text className="font-semibold text-fg">
                  {vertices.length >= 3 ? `${area.toFixed(2)} acres` : '-- acres'}
                </Text>
              </View>

              {farmerId ? (
                <View className="flex-row items-center justify-between rounded-lg border border-border bg-bg-elevated px-4 py-3">
                  <Text className="text-sm text-fg-muted">Farmer ID</Text>
                  <Text className="font-mono text-sm text-fg">{farmerId}</Text>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
}
