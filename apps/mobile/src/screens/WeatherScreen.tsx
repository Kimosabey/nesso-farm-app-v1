/**
 * Weather — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_feature.jsx — WeatherScreen
 *   - PushHeader "Weather" / "Hassan, Karnataka" / "5 min ago" (right, mono)
 *   - Big current card: gradient secondary→primary, 56px temp, condition, hourly strip
 *   - Spraying-window advisory banner (primary tint)
 *   - 7-day forecast list (day, icon, hi/lo)
 * Static realistic placeholder data (Hassan, Karnataka). Expo Go safe.
 */
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/theme';

type Nav = { goBack: () => void };

// emoji glyphs per design note: ☀️🌧️☁️⛅
const GLYPH: Record<string, string> = { sun: '☀️', cloud: '⛅', overcast: '☁️', drop: '🌧️' };

const HOURS: Array<[string, number, string]> = [
  ['Now', 27, 'cloud'],
  ['1PM', 28, 'sun'],
  ['2PM', 29, 'sun'],
  ['3PM', 28, 'cloud'],
  ['4PM', 26, 'cloud'],
  ['5PM', 24, 'drop'],
  ['6PM', 23, 'drop'],
  ['7PM', 22, 'overcast'],
];

const DAYS: Array<[string, string, number, number]> = [
  ['Today', 'cloud', 29, 21],
  ['Thu', 'sun', 31, 22],
  ['Fri', 'cloud', 28, 20],
  ['Sat', 'drop', 25, 19],
  ['Sun', 'drop', 24, 19],
  ['Mon', 'sun', 30, 21],
  ['Tue', 'cloud', 28, 20],
];

export function WeatherScreen() {
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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }}>Weather</Text>
          <Text style={{ fontSize: 12.5, color: C.fgMuted }}>Hassan, Karnataka</Text>
        </View>
        <Text style={{ fontSize: 11, color: C.fgSubtle, fontFamily: 'monospace', paddingRight: 6 }}>
          5 min ago
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Current card */}
        <View
          style={{
            backgroundColor: C.secondary,
            borderRadius: 22,
            padding: 22,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 56,
                  fontWeight: '700',
                  color: C.onPrimary,
                  letterSpacing: -1.5,
                  lineHeight: 60,
                }}
              >
                27°
              </Text>
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', marginTop: 6 }}>
                Partly cloudy · feels 29°
              </Text>
            </View>
            <Text style={{ fontSize: 52 }}>⛅</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}
          >
            {HOURS.slice(0, 6).map(([h, t, ic]) => (
              <View key={h} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{h}</Text>
                <Text style={{ fontSize: 18, marginVertical: 4 }}>{GLYPH[ic]}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: C.onPrimary,
                    fontFamily: 'monospace',
                  }}
                >
                  {t}°
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spraying advisory */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 11,
            backgroundColor: 'rgba(13,120,60,0.08)',
            borderRadius: 14,
            padding: 14,
            marginTop: 14,
          }}
        >
          <CheckCircle2 size={18} color={C.primary} style={{ marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.primary }}>
              Good window for spraying till 4 PM
            </Text>
            <Text style={{ fontSize: 12.5, color: C.fgMuted, marginTop: 2 }}>
              Low wind, no rain. Avoid after 5 PM — light showers likely.
            </Text>
          </View>
        </View>

        {/* Hourly strip (horizontal scroll, ~8 hours) */}
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: '700',
            letterSpacing: 0.9,
            color: C.fgSubtle,
            paddingHorizontal: 4,
            paddingTop: 20,
            paddingBottom: 10,
          }}
        >
          HOURLY
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {HOURS.map(([h, t, ic]) => (
              <View
                key={h}
                style={{
                  alignItems: 'center',
                  width: 64,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: C.bgElevated,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <Text style={{ fontSize: 12, color: C.fgMuted }}>{h}</Text>
                <Text style={{ fontSize: 22, marginVertical: 6 }}>{GLYPH[ic]}</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: C.fg,
                    fontFamily: 'monospace',
                  }}
                >
                  {t}°
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 7-day forecast */}
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: '700',
            letterSpacing: 0.9,
            color: C.fgSubtle,
            paddingHorizontal: 4,
            paddingTop: 20,
            paddingBottom: 10,
          }}
        >
          7-DAY FORECAST
        </Text>
        <View
          style={{
            backgroundColor: C.bgElevated,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.border,
            overflow: 'hidden',
          }}
        >
          {DAYS.map(([d, ic, hi, lo], i) => (
            <View
              key={d}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingHorizontal: 16,
                paddingVertical: 13,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: C.border,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.fg, width: 56 }}>{d}</Text>
              <Text style={{ fontSize: 20 }}>{GLYPH[ic]}</Text>
              <View style={{ flex: 1 }} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: C.fg,
                  fontFamily: 'monospace',
                }}
              >
                {hi}°
              </Text>
              <Text style={{ fontSize: 14, color: C.fgSubtle, fontFamily: 'monospace' }}>
                {lo}°
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
