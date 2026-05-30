/**
 * Farms list — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_main.jsx — FarmsScreen
 * + SCREENS.md "Farms": search; cards with polygon thumbnail, name, village,
 *   crop+area chips → Farm Details.
 *   - PageTop: "Farms" 28px/700 + count sub
 *   - SearchBar: 48px, search icon + input + filter icon (primary)
 *   - Cards: ~56px SVG polygon thumbnail (drawn from polygonPoints if present,
 *     else a stylized default polygon with accent fill), farmName, village (pin),
 *     crop + area chips, chevron. Tap → FarmDetails.
 *   - Empty: "No farms yet."
 *
 * Tab screen — no params. Uses useNavigation to push FarmDetails.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, SlidersHorizontal, MapPin, ChevronRight } from 'lucide-react-native';
import Svg, { Rect, Path, Circle, Defs, Pattern } from 'react-native-svg';
import { api, type Farm, type Crop } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useTheme } from '@/theme';

// Local nav param list — FarmDetails is registered by the parent navigator.
// Declared here so navigation typechecks without editing App.tsx / MainTabs.tsx.
type FarmsNavParamList = {
  FarmDetails: { farmId: string };
};
type Nav = NativeStackNavigationProp<FarmsNavParamList>;

// Default stylized polygons (matching screens_main.jsx PolyThumb sets).
const DEFAULT_POLYS = [
  'M10 18 L30 8 L50 16 L46 44 L18 48 Z',
  'M8 24 L24 10 L48 20 L42 46 L14 42 Z',
  'M12 14 L40 10 L50 32 L34 50 L10 38 Z',
];

/**
 * 56px farm polygon thumbnail. If the farm has polygonPoints, the lat/lng ring
 * is normalised into the 0..60 SVG viewBox; otherwise a stylized default
 * polygon (seeded by index) is drawn with accent fill.
 */
export function PolyThumb({
  polygonPoints,
  seed = 0,
  size = 56,
}: {
  polygonPoints?: Array<{ lat: number; lng: number }>;
  seed?: number;
  size?: number;
}) {
  const C = useTheme().c;
  let d = DEFAULT_POLYS[seed % DEFAULT_POLYS.length]!;
  if (polygonPoints && polygonPoints.length >= 3) {
    const lats = polygonPoints.map((p) => p.lat);
    const lngs = polygonPoints.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 1;
    const spanLng = maxLng - minLng || 1;
    const pad = 8;
    const span = 60 - pad * 2;
    d =
      polygonPoints
        .map((p, i) => {
          const x = pad + ((p.lng - minLng) / spanLng) * span;
          // invert Y so north is up
          const y = pad + (1 - (p.lat - minLat) / spanLat) * span;
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ') + ' Z';
  }
  const gridId = `grid${seed}`;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 13,
        backgroundColor: 'rgba(13,120,60,0.08)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 60 60">
        <Defs>
          <Pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
            <Path d="M10 0H0V10" fill="none" stroke={C.primary} strokeWidth={0.4} opacity={0.25} />
          </Pattern>
        </Defs>
        <Rect width="60" height="60" fill={`url(#${gridId})`} />
        <Path
          d={d}
          fill="rgba(241,212,18,0.22)"
          stroke={C.primary}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {[
          [10, 18],
          [50, 16],
          [46, 44],
          [18, 48],
        ].map((p, i) => (
          <Circle key={i} cx={p[0]} cy={p[1]} r={2.2} fill={C.primary} />
        ))}
      </Svg>
    </View>
  );
}

export function FarmsListScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cropsByFarm, setCropsByFarm] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listFarms({ pageSize: 100 });
      setFarms(r.data);
      // Best-effort: fetch crops to label cards. Non-fatal if it fails.
      try {
        const cr = await api.listCrops({ pageSize: 200 });
        const map: Record<string, string> = {};
        for (const crop of cr.data as Crop[]) {
          if (!map[crop.farmId]) map[crop.farmId] = crop.cropName;
        }
        setCropsByFarm(map);
      } catch {
        // ignore — chips just won't show a crop
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setSyncStatus(e.status);
      else if (e.type === 'drained' && e.ok > 0) void load();
    });
    return unsub;
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const list = useMemo(() => {
    const query = q.toLowerCase();
    return farms.filter((f) => {
      const name = (f.farmName ?? '').toLowerCase();
      const village = (f.address?.village ?? '').toLowerCase();
      return !query || name.includes(query) || village.includes(query);
    });
  }, [farms, q]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <OfflineBanner status={syncStatus} />

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* PageTop */}
            <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.6 }}>
                Farms
              </Text>
              <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 3 }}>
                {farms.length} mapped
              </Text>
            </View>

            {/* SearchBar */}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  height: 48,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: C.bgElevated,
                  borderWidth: 1.5,
                  borderColor: C.border,
                }}
              >
                <Search size={19} color={C.fgSubtle} />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder="Search farm or village"
                  placeholderTextColor={C.fgSubtle}
                  style={{ flex: 1, fontSize: 15, color: C.fg }}
                />
                <SlidersHorizontal size={19} color={C.primary} />
              </View>
            </View>

            {error ? (
              <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 12,
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
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => {
          const crop = cropsByFarm[item.farmId];
          const area = `${(item.farmArea ?? 0).toFixed(item.farmArea % 1 === 0 ? 0 : 1)} ac`;
          return (
            <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
              <Pressable
                onPress={() => navigation.navigate('FarmDetails', { farmId: item._id })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 13,
                  backgroundColor: C.bgElevated,
                  borderRadius: 16,
                  padding: 13,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <PolyThumb polygonPoints={item.polygonPoints} seed={index} size={56} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>
                    {item.farmName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <MapPin size={13} color={C.fgSubtle} />
                    <Text style={{ fontSize: 12.5, color: C.fgMuted }}>
                      {item.address?.village ?? item.address?.district ?? '—'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
                    {crop ? (
                      <View
                        style={{
                          backgroundColor: C.secondaryBg,
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondaryD }}>
                          {crop}
                        </Text>
                      </View>
                    ) : null}
                    <View
                      style={{
                        backgroundColor: C.bgMuted,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: C.fgMuted,
                          fontFamily: 'monospace',
                        }}
                      >
                        {area}
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={18} color={C.fgSubtle} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          error ? null : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 14, color: C.fgSubtle }}>No farms yet.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
