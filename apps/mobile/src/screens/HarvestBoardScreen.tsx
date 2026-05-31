/**
 * Harvest Board — wired to real DB data.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_feature.jsx — HarvestBoardScreen
 *   - PageTop "Harvest Board" + back header
 *   - Groups Today / Tomorrow / Planned, each with a count chip
 *   - Cards: wheat icon, farm name, "farmer · crop", expected kg, distance, Navigate button
 *
 * Data: fetches crops with a near-future harvestDate (api.listCrops) and the
 * farms they belong to (api.listFarms), then groups by harvestDate into
 * Today / Tomorrow / Planned. Empty state when nothing matches. Offline-safe:
 * a failed fetch falls back to an empty board, never crashes.
 */
import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Wheat, MapPin, Navigation } from 'lucide-react-native';
import { api, type Crop, type Farm } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import { useTheme } from '@/theme';

type Nav = { goBack: () => void };

interface HarvestItem {
  id: string;
  name: string; // farm name
  farmer: string;
  crop: string;
  kg: number;
  harvestDate?: string;
}

type GroupKey = 'Today' | 'Tomorrow' | 'Planned';

/** Days from now (calendar, local) for an ISO date string; null if invalid. */
function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffMs = startOfDay(d) - startOfDay(new Date());
  return Math.round(diffMs / 86400000);
}

function groupFor(days: number): GroupKey {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return 'Planned';
}

/** Only crops harvesting within this many days appear on the board. */
const HORIZON_DAYS = 30;

export function HarvestBoardScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();

  const [groups, setGroups] = useState<Array<{ g: GroupKey; items: HarvestItem[] }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [cropPage, farmPage] = await Promise.all([
          api.listCrops({ pageSize: 200 }),
          api.listFarms({ pageSize: 200 }),
        ]);
        const farmById = new Map<string, Farm>();
        for (const f of farmPage.data) farmById.set(f._id, f);

        const buckets: Record<GroupKey, HarvestItem[]> = { Today: [], Tomorrow: [], Planned: [] };
        for (const c of cropPage.data as Crop[]) {
          const days = daysUntil(c.harvestDate);
          if (days === null || days > HORIZON_DAYS) continue;
          const farm = farmById.get(c.farmId);
          buckets[groupFor(days)].push({
            id: c._id,
            name: farm?.farmName ?? 'Farm',
            farmer: farm?.farmerName ?? '—',
            crop: [c.cropName, c.cropVariety].filter(Boolean).join(' '),
            kg: Math.round(c.estHarvest ?? 0),
            harvestDate: c.harvestDate,
          });
        }

        // Sort each bucket by soonest harvest first.
        const order: GroupKey[] = ['Today', 'Tomorrow', 'Planned'];
        const next = order
          .map((g) => ({
            g,
            items: buckets[g].sort(
              (a, b) => (daysUntil(a.harvestDate) ?? 0) - (daysUntil(b.harvestDate) ?? 0),
            ),
          }))
          .filter((grp) => grp.items.length > 0);

        if (!cancelled) setGroups(next);
      } catch {
        if (!cancelled) setGroups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: C.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 6 }}>
          <ChevronLeft size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Harvest Board</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* PageTop */}
        <View style={{ paddingHorizontal: 4, paddingBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.6 }}>
            Harvest Board
          </Text>
          <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 3 }}>
            Plans grouped by date
          </Text>
        </View>

        {loading ? (
          <View style={{ marginHorizontal: -16 }}>
            <ListSkeleton />
          </View>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Wheat}
            title="No upcoming harvests"
            hint="Crops with a harvest date in the next 30 days will appear here."
          />
        ) : (
          groups.map((grp) => (
            <View key={grp.g} style={{ marginBottom: 18 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 4,
                  paddingBottom: 10,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.fg }}>{grp.g}</Text>
                <View
                  style={{
                    backgroundColor: 'rgba(13,120,60,0.10)',
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '600', color: C.primary }}>
                    {grp.items.length}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 10 }}>
                {grp.items.map((it) => (
                  <View
                    key={it.id}
                    style={{
                      backgroundColor: C.bgElevated,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: C.border,
                      padding: 15,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: 'rgba(13,120,60,0.10)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Wheat size={22} color={C.primary} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>
                          {it.name}
                        </Text>
                        <Text style={{ fontSize: 12.5, color: C.fgMuted }}>
                          {it.farmer} · {it.crop}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: C.fg,
                            fontFamily: 'monospace',
                          }}
                        >
                          {it.kg}kg
                        </Text>
                        <Text style={{ fontSize: 11.5, color: C.fgSubtle }}>expected</Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 13,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <MapPin size={14} color={C.secondaryD} />
                        <Text style={{ fontSize: 12.5, color: C.fgMuted, fontWeight: '500' }}>
                          {it.harvestDate
                            ? new Date(it.harvestDate).toLocaleDateString(undefined, {
                                day: '2-digit',
                                month: 'short',
                              })
                            : '—'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }} />
                      <Pressable
                        style={({ pressed }) => [
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: 'rgba(13,120,60,0.10)',
                            borderRadius: 999,
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            transform: [{ scale: pressed ? 0.97 : 1 }],
                          },
                        ]}
                      >
                        <Navigation size={14} color={C.primary} />
                        <Text style={{ fontSize: 12.5, fontWeight: '600', color: C.primary }}>
                          Navigate
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
