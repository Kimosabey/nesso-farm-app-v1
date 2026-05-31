/**
 * Farm Details — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_detail.jsx — FarmDetailsScreen
 * + SCREENS.md "Farm Details": map, stat grid, tabs Crops/Activities/Weather/
 *   Certificates/Soil; sticky Add crop.
 *   - Header: back chevron + farm name + sub (farmId · area)
 *   - Map: large (~180px) SVG polygon thumbnail, accent fill, on dark field
 *   - Stat grid: Area (acres) / Crops count / Soil type (+ Vertices)
 *   - Tabs (active underline primary):
 *       Crops      → crop cards (name, variety/method/sown, area)
 *       Activities → recent activity rows (type icon, title, date)
 *       Weather    → current weather card (static placeholder) + 4-day strip
 *       Certificates → empty state "No certificates uploaded"
 *       Soil       → soil type, water source, pH placeholder rows
 *   - Sticky bottom "Add crop" → AddCrop with { farmId }
 *
 * Params: { farmId: string }
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Plus,
  Leaf,
  Droplet,
  CloudSun,
  Cloud,
  Wheat,
  ShieldCheck,
} from 'lucide-react-native';
import Svg, { Rect, Path, Circle, Defs, Pattern } from 'react-native-svg';
import { api, type Farm, type Crop, type WeatherSnapshot } from '@/api/client';
import { useTheme } from '@/theme';

// Local nav/route param lists — FarmDetails + AddCrop are registered by the
// parent navigator. Declared here so navigation typechecks without editing
// App.tsx / MainTabs.tsx.
type DetailsParamList = {
  FarmDetails: { farmId: string };
  AddCrop: { farmId?: string; farmerId?: string };
};
type Nav = NativeStackNavigationProp<DetailsParamList, 'FarmDetails'>;
type DetailsRoute = RouteProp<DetailsParamList, 'FarmDetails'>;

const TABS = ['Crops', 'Activities', 'Weather', 'Certificates', 'Soil'] as const;
type TabName = (typeof TABS)[number];

function fmtDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function dayShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

/** Large polygon map (~180px). Draws polygonPoints if present, else a default. */
function MiniMap({ polygonPoints, height = 180 }: { polygonPoints?: Array<{ lat: number; lng: number }>; height?: number }) {
  const C = useTheme().c;
  let d = 'M34 26 L60 18 L70 44 L54 62 L30 52 Z';
  let dots: Array<[number, number]> = [
    [34, 26],
    [60, 18],
    [70, 44],
    [54, 62],
    [30, 52],
  ];
  if (polygonPoints && polygonPoints.length >= 3) {
    const lats = polygonPoints.map((p) => p.lat);
    const lngs = polygonPoints.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 1;
    const spanLng = maxLng - minLng || 1;
    const pad = 18;
    const span = 100 - pad * 2;
    const pts = polygonPoints.map((p) => {
      const x = pad + ((p.lng - minLng) / spanLng) * span;
      const y = pad + (1 - (p.lat - minLat) / spanLat) * span;
      return [x, y] as [number, number];
    });
    d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
    dots = pts;
  }
  return (
    <View style={{ height, backgroundColor: '#21331f', overflow: 'hidden' }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <Pattern id="fmap" width="14" height="14" patternUnits="userSpaceOnUse">
            <Path d="M0 4 H14 M0 10 H14" stroke="#5b8a5f" strokeWidth={1.4} opacity={0.5} />
          </Pattern>
        </Defs>
        <Rect width="100" height="100" fill="url(#fmap)" opacity={0.35} />
        <Path
          d={d}
          fill="rgba(241,212,18,0.18)"
          stroke={C.accent}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        {dots.map((p, i) => (
          <Circle key={i} cx={p[0]} cy={p[1]} r={1.4} fill="#fff" />
        ))}
      </Svg>
    </View>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  const C = useTheme().c;
  return (
    <View style={{ width: '50%', paddingVertical: 6 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: C.fgSubtle,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg, marginTop: 3 }}>{value}</Text>
    </View>
  );
}

const STATIC_ACTIVITIES: Array<{ icon: 'drop' | 'cloud' | 'wheat' | 'leaf'; title: string; meta: string }> = [
  { icon: 'drop', title: 'Spraying', meta: 'today' },
  { icon: 'cloud', title: 'Irrigation', meta: 'yesterday' },
  { icon: 'wheat', title: 'Fertilizer', meta: '24 May' },
  { icon: 'leaf', title: 'Weeding', meta: '21 May' },
];

export function FarmDetailsScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailsRoute>();
  const { farmId } = route.params;

  const [farm, setFarm] = useState<Farm | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabName>('Crops');
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherTried, setWeatherTried] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const f = await api.farmById(farmId);
      setFarm(f);
      try {
        const cr = await api.listCrops({ farmId, pageSize: 100 });
        setCrops(cr.data);
      } catch {
        setCrops([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load farm');
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Weather — lazy fetch the first time the Weather tab is opened, using the
  // farm's GPS. Offline-safe: a failure leaves `weather` null → static fallback.
  useEffect(() => {
    if (tab !== 'Weather' || weatherTried || !farm) return;
    setWeatherTried(true);
    let cancelled = false;
    void (async () => {
      try {
        const coords = farm.location?.coordinates;
        const s =
          coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])
            ? await api.getWeather(coords[1], coords[0]) // [lng, lat] → (lat, lng)
            : await api.getFarmWeather(farmId);
        if (!cancelled) setWeather(s);
      } catch {
        if (!cancelled) setWeather(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, weatherTried, farm, farmId]);

  const areaLabel = useMemo(() => {
    const a = farm?.farmArea ?? 0;
    return `${a % 1 === 0 ? a.toFixed(0) : a.toFixed(2)} ac`;
  }, [farm]);

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
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={24} color={C.fg} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }} numberOfLines={1}>
            {farm?.farmName ?? 'Farm'}
          </Text>
          {farm ? (
            <Text style={{ fontSize: 12, color: C.fgMuted }}>
              {farm.farmId} · {areaLabel}
            </Text>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
            {error ? (
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 12,
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

            {/* Map */}
            <MiniMap polygonPoints={farm?.polygonPoints} height={180} />

            {/* Stat grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <StatCell label="Area" value={areaLabel} />
              <StatCell label="Crops" value={String(crops.length)} />
              <StatCell label="Soil" value={farm?.soilType ?? '—'} />
              <StatCell label="Vertices" value={String(farm?.polygonPoints?.length ?? 0)} />
            </View>

            {/* Tab bar */}
            <View style={{ borderBottomWidth: 1, borderBottomColor: C.border }}>
              <FlatList
                horizontal
                data={TABS as readonly TabName[]}
                keyExtractor={(t) => t}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => {
                  const active = tab === item;
                  return (
                    <Pressable
                      onPress={() => setTab(item)}
                      style={{ paddingHorizontal: 14, paddingVertical: 12, position: 'relative' }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: active ? '700' : '600',
                          color: active ? C.primary : C.fgSubtle,
                        }}
                      >
                        {item}
                      </Text>
                      {active ? (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 14,
                            right: 14,
                            height: 2,
                            backgroundColor: C.primary,
                            borderRadius: 1,
                          }}
                        />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            </View>

            {/* Tab content */}
            <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
              {tab === 'Crops' ? (
                crops.length ? (
                  <View style={{ gap: 10 }}>
                    {crops.map((c) => (
                      <View
                        key={c._id}
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
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            backgroundColor: C.primary50,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Leaf size={20} color={C.primary} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>
                            {c.cropName}
                          </Text>
                          <Text style={{ fontSize: 12.5, color: C.fgMuted, marginTop: 1 }}>
                            {[c.cropVariety, `sown ${fmtDate(c.sowingDate)}`]
                              .filter(Boolean)
                              .join(' · ')}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: C.secondaryBg,
                            borderRadius: 999,
                            paddingHorizontal: 9,
                            paddingVertical: 3,
                          }}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '600', color: C.secondaryD }}>
                            {(c.acre ?? 0).toFixed(c.acre % 1 === 0 ? 0 : 1)} ac
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyState icon={<Leaf size={36} color="rgba(13,120,60,0.4)" />} label="No crops on this farm yet" />
                )
              ) : null}

              {tab === 'Activities' ? (
                <View style={{ gap: 10 }}>
                  {STATIC_ACTIVITIES.map((a, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 13,
                        backgroundColor: C.bgElevated,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: C.border,
                        padding: 13,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 11,
                          backgroundColor: C.primary50,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {a.icon === 'drop' ? (
                          <Droplet size={19} color={C.primary} />
                        ) : a.icon === 'cloud' ? (
                          <Cloud size={19} color={C.primary} />
                        ) : a.icon === 'wheat' ? (
                          <Wheat size={19} color={C.primary} />
                        ) : (
                          <Leaf size={19} color={C.primary} />
                        )}
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 14.5, fontWeight: '600', color: C.fg }}>
                          {a.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: C.fgMuted }}>{a.meta}</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: 'rgba(13,120,60,0.12)',
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: C.primary }}>Done</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              {tab === 'Weather' ? (
                (() => {
                  const live = weather && Number.isFinite(weather.current.tempC) ? weather : null;
                  const temp = live ? Math.round(live.current.tempC) : 27;
                  const caption = live
                    ? [live.current.description, live.advisories?.[0]].filter(Boolean).join(' · ') ||
                      (farm?.address?.village ?? farm?.address?.district ?? '')
                    : farm?.address?.village ??
                      farm?.address?.district ??
                      'Spraying window till 4 PM';
                  const fourDays: Array<[string, number]> = live
                    ? live.daily
                        .slice(0, 4)
                        .map((d) => [dayShort(d.date), Math.round(d.maxC)] as [string, number])
                    : [
                        ['Mon', 28],
                        ['Tue', 31],
                        ['Wed', 28],
                        ['Thu', 25],
                      ];
                  return (
                    <View style={{ gap: 12 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                          padding: 16,
                          borderRadius: 16,
                          backgroundColor: C.secondary,
                        }}
                      >
                        <CloudSun size={36} color="#fff" strokeWidth={1.6} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 30, fontWeight: '700', color: '#fff' }}>
                            {temp}°
                          </Text>
                          <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.9)' }}>
                            {caption}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {fourDays.map(([d, t], i) => (
                          <View
                            key={`${d}-${i}`}
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              paddingVertical: 11,
                              borderRadius: 12,
                              backgroundColor: C.bgElevated,
                              borderWidth: 1,
                              borderColor: C.border,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: C.fgMuted }}>{d}</Text>
                            <Cloud size={17} color={C.secondaryD} style={{ marginVertical: 6 }} />
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.fg }}>
                              {t}°
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })()
              ) : null}

              {tab === 'Certificates' ? (
                <EmptyState
                  icon={<ShieldCheck size={36} color="rgba(13,120,60,0.4)" />}
                  label="No certificates uploaded"
                />
              ) : null}

              {tab === 'Soil' ? (
                <View
                  style={{
                    backgroundColor: C.bgElevated,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: C.border,
                    overflow: 'hidden',
                  }}
                >
                  {(
                    [
                      ['Soil type', farm?.soilType ?? '—'],
                      ['Water source', farm?.waterSource ?? '—'],
                      ['pH', '—'],
                      ['Organic stage', farm?.organicStage ?? '—'],
                    ] as Array<[string, string]>
                  ).map(([k, v], i) => (
                    <View
                      key={k}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                        borderTopWidth: i ? 1 : 0,
                        borderTopColor: C.border,
                      }}
                    >
                      <Text style={{ fontSize: 13.5, color: C.fgMuted }}>{k}</Text>
                      <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fg }}>{v}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Sticky Add crop */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 28,
              backgroundColor: C.bgElevated,
              borderTopWidth: 1,
              borderTopColor: C.border,
            }}
          >
            <Pressable
              onPress={() =>
                navigation.navigate('AddCrop', { farmId, farmerId: farm?.farmerId })
              }
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: C.primary,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Plus size={20} color={C.onPrimary} strokeWidth={2.4} />
              <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.onPrimary }}>Add crop</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  const C = useTheme().c;
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
      {icon}
      <Text style={{ fontSize: 14, color: C.fgSubtle }}>{label}</Text>
    </View>
  );
}
