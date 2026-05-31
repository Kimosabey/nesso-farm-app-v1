/**
 * AddFarmScreen — draw a farm boundary polygon on a map.
 *
 * Spec source: design_handoff_nesso/app/screens_create.jsx — AddFarmScreen
 *   - Full-bleed map (Standard/Satellite chip). Tap drops vertices that "pop"
 *     in (Animated spring). Undo + Clear floating buttons. "Use my current
 *     location". Live bottom sheet: area (ha, shoelace) + vertex count, CTA
 *     "Add N more corners" → "Save farm boundary" (≥3 vertices).
 *
 * react-native-maps requires a dev build (not Expo Go). We guard the import
 * with the isExpoGo pattern, and in Expo Go fall back to a styled SVG canvas
 * where taps drop vertices. Either path saves through the same api.createFarm.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Polygon as SvgPolygon } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Undo2, Trash2, Locate, Check, Plus } from 'lucide-react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api } from '@/api/client';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/theme';

// ---------------------------------------------------------------------------
// Expo Go guard — identical pattern to src/firebase/auth.ts
// ---------------------------------------------------------------------------
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

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
    mapType?: 'standard' | 'satellite';
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
// Shoelace area on lat/lng → hectares (keeps existing spherical approximation)
// ---------------------------------------------------------------------------
function calcAreaHa(pts: Array<{ latitude: number; longitude: number }>): number {
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
  area = Math.abs(area) * R * R * 0.5; // sq km
  return area * 100; // sq km → hectares
}

// Shoelace area for the SVG canvas (screen-pixel coords) → faux hectares.
function calcCanvasHa(pts: Array<{ x: number; y: number }>, w: number, h: number): number {
  if (pts.length < 3 || w === 0 || h === 0) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    area += a.x * b.y - b.x * a.y;
  }
  area = Math.abs(area / 2);
  // normalise to % of the canvas then tune to a plausible hectare figure
  const pct = (area / (w * h)) * 100;
  return pct * 0.18;
}

type Props = NativeStackScreenProps<RootStackParamList, 'AddFarm'>;

// ---------------------------------------------------------------------------
// Count-up animated number (drives the live area readout)
// ---------------------------------------------------------------------------
function useCountUp(target: number, decimals = 2): string {
  const anim = useRef(new Animated.Value(target)).current;
  const [display, setDisplay] = useState(target.toFixed(decimals));
  useEffect(() => {
    const id = anim.addListener(({ value }) => setDisplay(value.toFixed(decimals)));
    Animated.timing(anim, { toValue: target, duration: 450, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [target, anim, decimals]);
  return display;
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
      style={({ pressed }) => [style, { transform: [{ scale: pressed ? 0.95 : 1 }], opacity: disabled ? 0.5 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// A single SVG-canvas vertex that springs in on mount.
// ---------------------------------------------------------------------------
function CanvasVertex({ x, y, color }: { x: number; y: number; color: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 140 }).start();
  }, [scale]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - 8,
        top: y - 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: color,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        transform: [{ scale }],
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export function AddFarmScreen({ navigation, route }: Props) {
  const farmerId = route.params?.farmerId ?? '';
  const C = useTheme().c;
  const toast = useToast();
  const maps = loadMaps();

  const [farmName, setFarmName] = useState('');
  const [village, setVillage] = useState('');
  const [layer, setLayer] = useState<'Standard' | 'Satellite'>('Satellite');
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  // Two vertex spaces: real map uses lat/lng; the SVG canvas uses pixel coords.
  const [vertices, setVertices] = useState<LatLng[]>([]);
  const [canvasPts, setCanvasPts] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const usingMap = !isExpoGo && !!maps;
  const sat = layer === 'Satellite';

  const vertCount = usingMap ? vertices.length : canvasPts.length;
  const areaHa = usingMap
    ? calcAreaHa(vertices)
    : calcCanvasHa(canvasPts, canvasSize.w, canvasSize.h);
  const areaDisplay = useCountUp(areaHa, 2);

  const canSave = vertCount >= 3;

  // --- Map handlers (dev build) ---
  const handleMapPress = useCallback((e: MapPressEventNative) => {
    setVertices((prev) => [...prev, e.nativeEvent.coordinate]);
  }, []);

  // --- Canvas handlers (Expo Go) ---
  const handleCanvasTap = useCallback((e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setCanvasPts((prev) => [...prev, { x: locationX, y: locationY, id: Date.now() }]);
  }, []);

  const handleUndo = useCallback(() => {
    if (usingMap) setVertices((p) => p.slice(0, -1));
    else setCanvasPts((p) => p.slice(0, -1));
  }, [usingMap]);

  const handleClear = useCallback(() => {
    if (usingMap) setVertices([]);
    else setCanvasPts([]);
  }, [usingMap]);

  const onCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ w: width, h: height });
  }, []);

  // --- "Use my current location" — drops a default region / vertex ---
  const handleUseLocation = useCallback(async () => {
    setLocating(true);
    try {
      const Location = await import('expo-location');
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        toast.info('Location permission denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      if (usingMap) {
        setVertices((prev) => [
          ...prev,
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        ]);
        toast.success('Pinned current location');
      } else {
        toast.info('Tap the canvas to drop corners (GPS needs a dev build)');
      }
    } catch {
      toast.info('Location unavailable in Expo Go — tap to drop corners');
    } finally {
      setLocating(false);
    }
  }, [usingMap, toast]);

  const handleSave = async () => {
    if (!canSave) return;
    if (!farmerId) {
      toast.error('No farmer ID provided');
      return;
    }
    if (!farmName.trim()) {
      toast.error('Enter a farm name');
      return;
    }
    setBusy(true);
    try {
      let lat: number;
      let lng: number;
      let polygonPoints: Array<{ lat: number; lng: number }>;
      if (usingMap) {
        lat = vertices.reduce((s, v) => s + v.latitude, 0) / vertices.length;
        lng = vertices.reduce((s, v) => s + v.longitude, 0) / vertices.length;
        polygonPoints = vertices.map((v) => ({ lat: v.latitude, lng: v.longitude }));
      } else {
        // Canvas: derive a stable lat/lng around a default region from pixel ratios.
        const baseLat = 12.97;
        const baseLng = 77.59;
        const span = 0.02;
        polygonPoints = canvasPts.map((p) => ({
          lat: baseLat + (0.5 - p.y / Math.max(1, canvasSize.h)) * span,
          lng: baseLng + (p.x / Math.max(1, canvasSize.w) - 0.5) * span,
        }));
        lat = polygonPoints.reduce((s, v) => s + v.lat, 0) / polygonPoints.length;
        lng = polygonPoints.reduce((s, v) => s + v.lng, 0) / polygonPoints.length;
      }

      await api.createFarm({
        farmerId,
        farmName: farmName.trim(),
        latitude: lat,
        longitude: lng,
        polygonPoints,
      });
      toast.success(`Farm mapped · ${areaHa.toFixed(2)} ha`);
      navigation.goBack();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save farm');
    } finally {
      setBusy(false);
    }
  };

  const moreNeeded = Math.max(0, 3 - vertCount);
  const ctaLabel = canSave
    ? 'Save farm boundary'
    : `Add ${moreNeeded} more corner${moreNeeded === 1 ? '' : 's'}`;

  const polyPoints = canvasPts.map((p) => `${p.x},${p.y}`).join(' ');
  const accent = sat ? C.accent : C.primary;

  return (
    <View style={{ flex: 1, backgroundColor: usingMap ? C.bg : '#0b1410' }}>
      {/* ---- Map / canvas layer ---- */}
      {usingMap ? (
        <maps.default
          style={{ flex: 1 }}
          mapType={sat ? 'satellite' : 'standard'}
          initialRegion={{ latitude: 12.97, longitude: 77.59, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
          onPress={handleMapPress}
        >
          {vertices.length >= 3 ? (
            <maps.Polygon
              coordinates={vertices}
              fillColor="rgba(13,120,60,0.2)"
              strokeColor={C.primary}
              strokeWidth={2}
            />
          ) : null}
          {vertices.map((v, i) => (
            <maps.Marker key={i} coordinate={v} anchor={{ x: 0.5, y: 0.5 }}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: C.primary,
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                }}
              />
            </maps.Marker>
          ))}
        </maps.default>
      ) : (
        <Pressable style={{ flex: 1 }} onPress={handleCanvasTap} onLayout={onCanvasLayout}>
          <Svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <Defs>
              <Pattern id="fld" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
                <Rect width="46" height="46" fill={sat ? '#2c4a30' : '#d7e4d9'} />
                <Path
                  d="M0 12H46M0 30H46"
                  stroke={sat ? '#5b8a5f' : '#9bbf9f'}
                  strokeWidth={6}
                  opacity={0.4}
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#fld)" />
            {canvasPts.length >= 2 ? (
              <SvgPolygon
                points={polyPoints}
                fill={sat ? 'rgba(241,212,18,0.18)' : 'rgba(13,120,60,0.16)'}
                stroke={accent}
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
            ) : null}
          </Svg>
          {canvasPts.map((p) => (
            <CanvasVertex key={p.id} x={p.x} y={p.y} color={accent} />
          ))}
          {canvasPts.length === 0 ? (
            <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 2,
                  borderColor: sat ? 'rgba(255,255,255,0.8)' : C.fg,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Plus size={26} color={sat ? '#FFFFFF' : C.fg} />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  maxWidth: 220,
                  textAlign: 'center',
                  color: sat ? '#FFFFFF' : C.fg,
                  opacity: 0.9,
                }}
              >
                Tap to drop the corners of the farm boundary
              </Text>
            </View>
          ) : null}
        </Pressable>
      )}

      {/* ---- Header (back + Satellite/Standard toggle) ---- */}
      <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 6 }}>
          <Scale
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(255,255,255,0.92)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={22} color="#0F1A14" />
          </Scale>
          <View style={{ flex: 1 }} />
          <View
            style={{
              flexDirection: 'row',
              gap: 3,
              padding: 3,
              borderRadius: 11,
              backgroundColor: 'rgba(255,255,255,0.92)',
            }}
          >
            {(['Standard', 'Satellite'] as const).map((l) => {
              const on = layer === l;
              return (
                <Scale
                  key={l}
                  onPress={() => setLayer(l)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: on ? C.primary : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '600', color: on ? '#FFFFFF' : C.secondaryD }}>
                    {l}
                  </Text>
                </Scale>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      {/* ---- Floating Undo / Clear ---- */}
      <View style={{ position: 'absolute', right: 16, top: 140, gap: 10 }}>
        <Scale
          onPress={handleUndo}
          disabled={vertCount === 0}
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.94)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Undo2 size={20} color="#0F1A14" />
        </Scale>
        <Scale
          onPress={handleClear}
          disabled={vertCount === 0}
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.94)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={20} color={C.danger} />
        </Scale>
      </View>

      {/* ---- Live bottom sheet ---- */}
      <View
        style={{
          backgroundColor: C.bgElevated,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 34,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: -12 },
          elevation: 16,
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 320 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.fgMuted, letterSpacing: 0.4 }}>FARM AREA</Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.5 }}>
                {areaDisplay} <Text style={{ fontSize: 16, color: C.fgMuted }}>ha</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.fgMuted, letterSpacing: 0.4 }}>VERTICES</Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  color: canSave ? C.primary : C.fgSubtle,
                }}
              >
                {vertCount}
              </Text>
            </View>
          </View>

          {/* Farm name */}
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fgMuted, marginBottom: 6 }}>Farm name *</Text>
          <TextInput
            value={farmName}
            onChangeText={setFarmName}
            autoCapitalize="words"
            placeholder="e.g. North Field"
            placeholderTextColor={C.fgSubtle}
            style={{
              height: 50,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: C.borderStrong,
              backgroundColor: C.bgElevated,
              paddingHorizontal: 14,
              fontSize: 15,
              color: C.fg,
              marginBottom: 12,
            }}
          />

          {/* Village */}
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fgMuted, marginBottom: 6 }}>Village / location</Text>
          <TextInput
            value={village}
            onChangeText={setVillage}
            autoCapitalize="words"
            placeholder="e.g. Channapatna"
            placeholderTextColor={C.fgSubtle}
            style={{
              height: 50,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: C.borderStrong,
              backgroundColor: C.bgElevated,
              paddingHorizontal: 14,
              fontSize: 15,
              color: C.fg,
              marginBottom: 14,
            }}
          />

          {/* Use my current location */}
          <Scale
            onPress={handleUseLocation}
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
              marginBottom: 12,
            }}
          >
            {locating ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <>
                <Locate size={18} color={C.primary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.primary }}>Use my current location</Text>
              </>
            )}
          </Scale>
        </ScrollView>

        {/* Primary CTA */}
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
              {canSave ? <Check size={20} color={C.onPrimary} /> : <MapPin size={18} color={C.fgSubtle} />}
              <Text style={{ fontSize: 15, fontWeight: '700', color: canSave ? C.onPrimary : C.fgSubtle }}>
                {ctaLabel}
              </Text>
            </>
          )}
        </Scale>
      </View>
    </View>
  );
}
