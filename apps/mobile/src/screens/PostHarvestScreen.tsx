/**
 * Post-harvest hub — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — PostHarvestScreen
 *   - PushHeader "Post-harvest" + back
 *   - 2×2 grid of large tiles: Batches, Inventory, Accept GRN, Procurement
 *   - Each tile: 46px tinted icon, label 16px/700, subtitle 12px/muted
 *   - Tap → navigate to the respective screen.
 * Expo Go safe.
 */
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Box, ScanLine, FileText, type LucideIcon } from 'lucide-react-native';
import { useTheme, type ThemeTokens } from '@/theme';

type Route = 'Batches' | 'Inventory' | 'AcceptGRN' | 'Procurement';
type Nav = { goBack: () => void; navigate: (route: Route) => void };

const makeTiles = (
  c: ThemeTokens,
): Array<{
  route: Route;
  icon: LucideIcon;
  color: string;
  title: string;
  subtitle: string;
}> => [
  { route: 'Batches', icon: Box, color: c.primary, title: 'Batches', subtitle: '34 active · 3 grades' },
  {
    route: 'Inventory',
    icon: Box,
    color: c.secondaryD,
    title: 'Inventory',
    subtitle: 'Sell · transfer · process',
  },
  {
    route: 'AcceptGRN',
    icon: ScanLine,
    color: c.accentD,
    title: 'Accept GRN',
    subtitle: 'Scan incoming goods',
  },
  {
    route: 'Procurement',
    icon: FileText,
    color: c.info,
    title: 'Procurement',
    subtitle: '12 pending payments',
  },
];

function tint(hex: string): string {
  // 14% tint over white-ish elevated bg — match color-mix(in oklab, color 14%, bg-elevated)
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.14)`;
}

export function PostHarvestScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const TILES = makeTiles(C);

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
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Post-harvest</Text>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Pressable
                key={t.route}
                onPress={() => navigation.navigate(t.route)}
                style={{
                  width: '47.5%',
                  flexGrow: 1,
                  minHeight: 130,
                  backgroundColor: C.bgElevated,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: C.border,
                  padding: 18,
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    backgroundColor: tint(t.color),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={t.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: C.fg }}>{t.title}</Text>
                  <Text style={{ fontSize: 12, color: C.fgMuted, marginTop: 2 }}>{t.subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
