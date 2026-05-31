/**
 * Pre-harvest — wired to real DB data.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_feature.jsx — PreHarvestScreen
 *   - PageTop "Pre-harvest" + back header
 *   - Tabs Report / Activities / Crop history
 *   - Report: 4 stat tiles + crop rows with "Due soon" / "On track" chips
 *   - Activities + Crop history: lists / empty states
 *
 * Data:
 *   - Report      → GET /reports/pre-harvest (api.preHarvestReport)
 *   - Activities  → api.listActivities
 *   - Crop history→ api.listCrops
 * Each tab loads lazily on first view, with graceful empty states. Offline-safe:
 * failed fetches fall back to an empty state, never crash.
 */
import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Leaf,
  Droplets,
  type LucideIcon,
} from 'lucide-react-native';
import {
  api,
  type PreHarvestReport,
  type PreHarvestRow,
  type ActivityRow,
  type Crop,
} from '@/api/client';
import { useTheme } from '@/theme';

const TABS = ['Report', 'Activities', 'Crop history'] as const;
type Tab = (typeof TABS)[number];

type Nav = { goBack: () => void };

/** Days from now (calendar) for an ISO date; null if invalid/missing. */
function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function Chip({ due }: { due: boolean }) {
  const C = useTheme().c;
  const tone = due
    ? { bg: 'rgba(154,132,7,0.14)', fg: C.warning, label: 'Due soon' }
    : { bg: 'rgba(13,120,60,0.12)', fg: C.primary, label: 'On track' };
  return (
    <View
      style={{ backgroundColor: tone.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
    >
      <Text style={{ color: tone.fg, fontSize: 11.5, fontWeight: '700' }}>{tone.label}</Text>
    </View>
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

export function PreHarvestScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('Report');

  // Report tab
  const [report, setReport] = useState<PreHarvestReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  // Activities tab
  const [activities, setActivities] = useState<ActivityRow[] | null>(null);
  const [actLoading, setActLoading] = useState(false);
  // Crop history tab
  const [crops, setCrops] = useState<Crop[] | null>(null);
  const [cropLoading, setCropLoading] = useState(false);

  // Report loads immediately (default tab).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await api.preHarvestReport({ approvalStatus: 'approved' });
        if (!cancelled) setReport(r);
      } catch {
        if (!cancelled) setReport(null);
      } finally {
        if (!cancelled) setReportLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Activities — lazy on first view.
  useEffect(() => {
    if (tab !== 'Activities' || activities !== null) return;
    let cancelled = false;
    setActLoading(true);
    void (async () => {
      try {
        const page = await api.listActivities({ pageSize: 50 });
        if (!cancelled) setActivities(page.data);
      } catch {
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setActLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, activities]);

  // Crop history — lazy on first view.
  useEffect(() => {
    if (tab !== 'Crop history' || crops !== null) return;
    let cancelled = false;
    setCropLoading(true);
    void (async () => {
      try {
        const page = await api.listCrops({ pageSize: 50 });
        if (!cancelled) setCrops(page.data);
      } catch {
        if (!cancelled) setCrops([]);
      } finally {
        if (!cancelled) setCropLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, crops]);

  // --- Report derivations ---
  const cropRows: PreHarvestRow[] = (report?.rows ?? []).filter((r) => r.crop);
  const stats: Array<[string, string]> = report
    ? [
        ['Crops nearing harvest', String(report.totals.crops)],
        ['Farmers in scope', String(report.totals.farmersInScope)],
        ['Farms', String(report.totals.farms)],
        ['Missing farm', String(report.totals.farmersMissingFarm)],
      ]
    : [
        ['Crops nearing harvest', '—'],
        ['Farmers in scope', '—'],
        ['Farms', '—'],
        ['Missing farm', '—'],
      ];

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
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Pre-harvest</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* PageTop */}
        <View style={{ paddingHorizontal: 4, paddingBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.6 }}>
            Pre-harvest
          </Text>
          <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 3 }}>
            Readiness & forecasts
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 14 }}>
          {TABS.map((t) => {
            const on = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: on ? C.primary : C.bgElevated,
                  borderWidth: on ? 0 : 1.5,
                  borderColor: C.border,
                }}
              >
                <Text
                  style={{ fontSize: 13.5, fontWeight: '600', color: on ? C.onPrimary : C.fgMuted }}
                >
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'Report' &&
          (reportLoading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator color={C.primary} />
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {/* Stat tiles */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {stats.map(([label, value]) => (
                  <View
                    key={label}
                    style={{
                      width: '47.5%',
                      flexGrow: 1,
                      backgroundColor: C.bgElevated,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: C.border,
                      padding: 16,
                    }}
                  >
                    <Text style={{ fontSize: 24, fontWeight: '700', color: C.fg }}>{value}</Text>
                    <Text style={{ fontSize: 12.5, color: C.fgMuted, marginTop: 2 }}>{label}</Text>
                  </View>
                ))}
              </View>

              {/* Crop rows */}
              {cropRows.length === 0 ? (
                <EmptyState
                  icon={<Leaf size={36} color="rgba(13,120,60,0.4)" />}
                  label="No crops to report yet"
                />
              ) : (
                cropRows.map((row) => {
                  const rollup = row.activityRollup;
                  const due = (rollup?.overdue ?? 0) > 0 || (rollup?.pending ?? 0) > 0;
                  const title = `${row.crop?.name ?? 'Crop'} · ${row.farm?.name ?? '—'}`;
                  const sub = [
                    row.crop?.variety,
                    `${rollup?.completed ?? 0} done · ${rollup?.pending ?? 0} pending`,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <View
                      key={`${row.crop?.id}-${row.farm?.id}`}
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
                          backgroundColor: 'rgba(60,107,81,0.12)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Leaf size={20} color={C.secondaryD} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 14.5, fontWeight: '600', color: C.fg }}>
                          {title}
                        </Text>
                        <Text style={{ fontSize: 12.5, color: C.fgMuted }}>{sub}</Text>
                      </View>
                      <Chip due={due} />
                    </View>
                  );
                })
              )}
            </View>
          ))}

        {tab === 'Activities' &&
          (actLoading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator color={C.primary} />
            </View>
          ) : !activities || activities.length === 0 ? (
            <EmptyState
              icon={<Droplets size={36} color="rgba(13,120,60,0.4)" />}
              label="No activities recorded yet"
            />
          ) : (
            <View style={{ gap: 10 }}>
              {activities.map((row) => {
                const Icon: LucideIcon = Droplets;
                const cost = row.totalCost ? `₹${Math.round(row.totalCost)}` : row.status;
                return (
                  <View
                    key={row._id}
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
                        backgroundColor: 'rgba(13,120,60,0.10)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={19} color={C.primary} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.fg }}>
                        {row.activity}
                      </Text>
                      <Text style={{ fontSize: 12, color: C.fgMuted }}>
                        {cost} · {fmtDate(row.completedDate ?? row.scheduledOn ?? row.enteredDate)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

        {tab === 'Crop history' &&
          (cropLoading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator color={C.primary} />
            </View>
          ) : !crops || crops.length === 0 ? (
            <EmptyState
              icon={<Leaf size={36} color="rgba(13,120,60,0.4)" />}
              label="No crops recorded yet"
            />
          ) : (
            <View style={{ gap: 10 }}>
              {crops.map((row) => {
                const days = daysUntil(row.harvestDate);
                const status =
                  days === null ? '—' : days <= 0 ? 'Ready' : `in ${days}d`;
                return (
                  <View
                    key={row._id}
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
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        backgroundColor: 'rgba(60,107,81,0.12)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Leaf size={19} color={C.secondaryD} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '600', color: C.fg }}>
                        {row.cropName}
                      </Text>
                      <Text style={{ fontSize: 12, color: C.fgMuted }}>
                        {[row.cropVariety, row.season].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: C.fg,
                          fontFamily: 'monospace',
                        }}
                      >
                        {Math.round(row.estHarvest ?? 0)} {row.unit}
                      </Text>
                      <Text style={{ fontSize: 11, color: C.fgSubtle }}>{status}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
