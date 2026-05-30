/**
 * Pre-harvest — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_feature.jsx — PreHarvestScreen
 *   - PageTop "Pre-harvest" + back header
 *   - Tabs Report / Activities / Crop history
 *   - Report: 4 stat tiles + crop rows with "Due soon" / "On track" chips
 *   - Activities + Crop history: simple lists / empty states
 * Static realistic data (tuberose/jasmine/marigold around Hassan). Expo Go safe.
 */
import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Leaf,
  Droplets,
  CloudRain,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/theme';

const TABS = ['Report', 'Activities', 'Crop history'] as const;
type Tab = (typeof TABS)[number];

type Nav = { goBack: () => void };

const STATS: Array<[string, string]> = [
  ['Crops nearing harvest', '18'],
  ['On track', '11'],
  ['Due soon', '5'],
  ['Overdue', '2'],
];

const CROP_ROWS: Array<{ title: string; sub: string; due: boolean }> = [
  { title: 'Tuberose · North Plot', sub: 'Flowering · harvest in 8 days', due: true },
  { title: 'Marigold · Belur Estate', sub: 'Budding · harvest in 22 days', due: false },
  { title: 'Jasmine · Rao Garden', sub: 'Flowering · harvest in 5 days', due: true },
];

const ACT_ROWS: Array<{ icon: LucideIcon; title: string; sub: string }> = [
  { icon: Droplets, title: 'Spraying · North Plot', sub: 'Tuberose · ₹640' },
  { icon: CloudRain, title: 'Irrigation · Rao Garden', sub: 'Jasmine · drip 2h' },
  { icon: Wheat, title: 'Fertilizer · North Plot', sub: 'Urea · ₹240' },
];

const HISTORY_ROWS: Array<{ crop: string; season: string; yield: string; status: string }> = [
  { crop: 'Tuberose', season: '2025–26', yield: '320 kg', status: 'Harvested' },
  { crop: 'Marigold', season: '2025', yield: '480 kg', status: 'Harvested' },
  { crop: 'Jasmine', season: '2024–25', yield: '210 kg', status: 'Harvested' },
];

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

export function PreHarvestScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('Report');

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

        {tab === 'Report' && (
          <View style={{ gap: 12 }}>
            {/* Stat tiles */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {STATS.map(([label, value]) => (
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
            {CROP_ROWS.map((row) => (
              <View
                key={row.title}
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
                  <Text style={{ fontSize: 14.5, fontWeight: '600', color: C.fg }}>{row.title}</Text>
                  <Text style={{ fontSize: 12.5, color: C.fgMuted }}>{row.sub}</Text>
                </View>
                <Chip due={row.due} />
              </View>
            ))}
          </View>
        )}

        {tab === 'Activities' && (
          <View style={{ gap: 10 }}>
            {ACT_ROWS.map((row) => {
              const Icon = row.icon;
              return (
                <View
                  key={row.title}
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
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.fg }}>{row.title}</Text>
                    <Text style={{ fontSize: 12, color: C.fgMuted }}>{row.sub}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'Crop history' && (
          <View style={{ gap: 10 }}>
            {HISTORY_ROWS.map((row) => (
              <View
                key={`${row.crop}-${row.season}`}
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
                  <Text style={{ fontSize: 14.5, fontWeight: '600', color: C.fg }}>{row.crop}</Text>
                  <Text style={{ fontSize: 12, color: C.fgMuted }}>{row.season} season</Text>
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
                    {row.yield}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.fgSubtle }}>{row.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
