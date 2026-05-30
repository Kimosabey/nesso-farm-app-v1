/**
 * Harvest Board — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_feature.jsx — HarvestBoardScreen
 *   - PageTop "Harvest Board" + back header
 *   - Groups Today / Tomorrow / Planned, each with a count chip
 *   - Cards: wheat icon, farm name, "farmer · crop", expected kg, distance, Navigate button
 * Static realistic data (tuberose/jasmine harvests around Hassan). Expo Go safe.
 */
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Wheat, MapPin, Navigation } from 'lucide-react-native';
import { useTheme } from '@/theme';

type Nav = { goBack: () => void };

interface HarvestItem {
  name: string;
  farmer: string;
  crop: string;
  kg: number;
  dist: string;
}

const GROUPS: Array<{ g: string; items: HarvestItem[] }> = [
  {
    g: 'Today',
    items: [
      { name: 'North Plot', farmer: 'Lakshmi Gowda', crop: 'Tuberose', kg: 320, dist: '2.4 km' },
      { name: 'Rao Garden', farmer: 'Geetha Rao', crop: 'Jasmine', kg: 180, dist: '5.1 km' },
    ],
  },
  {
    g: 'Tomorrow',
    items: [
      { name: 'Belur Estate', farmer: 'Anjali Hegde', crop: 'Marigold', kg: 540, dist: '8.0 km' },
    ],
  },
  {
    g: 'Planned',
    items: [
      { name: 'East Field', farmer: 'Prakash Naik', crop: 'Tuberose', kg: 420, dist: '3.7 km' },
    ],
  },
];

export function HarvestBoardScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();

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

        {GROUPS.map((grp) => (
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
                  key={it.name}
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
                        {it.dist} away
                      </Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <Pressable
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: 'rgba(13,120,60,0.10)',
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                      }}
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
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
