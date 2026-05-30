/**
 * Location picker — 100% spec parity with design handoff (LocationScreen).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — LocationScreen
 *   - PushHeader: "Pick location" + back
 *   - Faux map (~50% height) with center pin overlay
 *   - Sheet pulled up over the map: "Use current location", Latitude / Longitude
 *     mono fields, locality line, sticky "Confirm location"
 *   - Lat/long prefilled with a Hassan default; "Use current location" fills via
 *     expo-location (guarded for Expo Go).
 */
import { useCallback, useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Defs, Pattern, Path, Rect, Polygon, Circle } from 'react-native-svg';
import { ChevronLeft, LocateFixed, MapPin, Check } from 'lucide-react-native';
import { useTheme } from '@/theme';

// Local nav/route param lists — LocationPicker is registered by the parent navigator.
// Declared here so navigation typechecks without editing App.tsx / MainTabs.tsx.
type LocationPickerParamList = {
  LocationPicker: { lat?: number; lng?: number; onPick?: (r: { lat: number; lng: number }) => void };
};
type Nav = NativeStackNavigationProp<LocationPickerParamList, 'LocationPicker'>;
type LocationPickerRoute = RouteProp<LocationPickerParamList, 'LocationPicker'>;

// Hassan, Karnataka default
const DEFAULT_LAT = 13.005;
const DEFAULT_LNG = 76.099;

/** Faux satellite/field map background (matches MiniMapM in the handoff). */
function FauxMap() {
  return (
    <View style={{ flex: 1, backgroundColor: '#21331f', overflow: 'hidden' }}>
      <Svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.35 }}>
        <Defs>
          <Pattern
            id="fm"
            width={40}
            height={40}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(20)"
          >
            <Path d="M0 10H40M0 26H40" stroke="#5b8a5f" strokeWidth={5} opacity={0.5} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#fm)" />
      </Svg>
      <Svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <Polygon
          points="34,26 60,18 70,44 54,62 30,52"
          fill="rgba(241,212,18,0.18)"
          stroke="#F1D412"
          strokeWidth={2.5}
        />
        {([[34, 26], [60, 18], [70, 44], [54, 62], [30, 52]] as const).map((p, i) => (
          <Circle key={i} cx={p[0]} cy={p[1]} r={1.4} fill="#fff" />
        ))}
      </Svg>
    </View>
  );
}

export function LocationPickerScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const route = useRoute<LocationPickerRoute>();
  const initial = route.params ?? {};

  const [lat, setLat] = useState(String(initial.lat ?? DEFAULT_LAT));
  const [lng, setLng] = useState(String(initial.lng ?? DEFAULT_LNG));
  const [locating, setLocating] = useState(false);
  const [locality, setLocality] = useState('Hassan, Karnataka');

  const useCurrent = useCallback(async () => {
    setLocating(true);
    try {
      // Lazy require so the screen still loads if the module is unavailable.
      const Location = await import('expo-location');
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setLocality('Permission denied — using default');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLat(pos.coords.latitude.toFixed(6));
      setLng(pos.coords.longitude.toFixed(6));
      setLocality('Current location');
    } catch {
      // Expo Go / simulator / denied — fall back gracefully, keep existing values.
      setLocality('Location unavailable — using default');
    } finally {
      setLocating(false);
    }
  }, []);

  const confirm = useCallback(() => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (initial.onPick && Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      initial.onPick({ lat: parsedLat, lng: parsedLng });
    }
    navigation.goBack();
  }, [lat, lng, initial, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#21331f' }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: C.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: C.bgElevated,
            borderWidth: 1.5,
            borderColor: C.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={22} color={C.fg} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg, letterSpacing: -0.2 }}>
          Pick location
        </Text>
      </View>

      {/* Map area (~half height) with center pin overlay */}
      <View style={{ flex: 1, position: 'relative' }}>
        <FauxMap />
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <MapPin size={40} color={C.accent} fill={C.primary} />
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.45)',
                marginTop: 2,
              }}
            />
          </View>
        </View>
      </View>

      {/* Sheet pulled up over the map */}
      <View
        style={{
          backgroundColor: C.bgElevated,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -28,
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.12,
          shadowRadius: 30,
          elevation: 10,
        }}
      >
        <Pressable
          onPress={useCurrent}
          disabled={locating}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: C.borderStrong,
            backgroundColor: C.bgElevated,
            marginBottom: 16,
          }}
        >
          {locating ? (
            <ActivityIndicator size="small" color={C.primary} />
          ) : (
            <LocateFixed size={18} color={C.primary} />
          )}
          <Text style={{ color: C.primary, fontWeight: '600', fontSize: 14 }}>
            {locating ? 'Locating…' : 'Use current location'}
          </Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Coord label="Latitude" value={lat} onChange={setLat} />
          <Coord label="Longitude" value={lng} onChange={setLng} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }}>
          <MapPin size={14} color={C.secondaryD} />
          <Text style={{ fontSize: 12.5, color: C.fgMuted }}>{locality}</Text>
        </View>

        <Pressable
          onPress={confirm}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 52,
            borderRadius: 14,
            backgroundColor: C.primary,
            marginTop: 20,
          }}
        >
          <Check size={20} color={C.onPrimary} />
          <Text style={{ color: C.onPrimary, fontWeight: '700', fontSize: 16 }}>
            Confirm location
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Coord({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const C = useTheme().c;
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: C.fgMuted, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numbers-and-punctuation"
        style={{
          height: 46,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: C.border,
          backgroundColor: C.bg,
          paddingHorizontal: 14,
          fontSize: 15,
          color: C.fg,
          fontFamily: 'monospace',
        }}
      />
    </View>
  );
}
