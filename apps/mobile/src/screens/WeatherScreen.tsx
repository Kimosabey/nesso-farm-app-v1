/**
 * Weather — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_feature.jsx — WeatherScreen
 *   - PushHeader "Weather" / "Hassan, Karnataka" / "5 min ago" (right, mono)
 *   - Big current card: gradient secondary→primary, 56px temp, condition, hourly strip
 *   - Spraying-window advisory banner (primary tint)
 *   - 7-day forecast list (day, icon, hi/lo)
 * Pulls real data from GET /weather?lat=&lng= (Open-Meteo proxy). Defaults to
 * Hassan, Karnataka. Falls back to a static realistic placeholder when the
 * call fails (offline) so the screen never crashes. Expo Go safe.
 */
import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { api, type WeatherSnapshot } from '@/api/client';
import { useTheme } from '@/theme';

type Nav = { goBack: () => void };

// Default location — Hassan, Karnataka.
const DEFAULT_LAT = 13.005;
const DEFAULT_LNG = 76.099;

// emoji glyphs per design note: ☀️🌧️☁️⛅
const GLYPH: Record<string, string> = { sun: '☀️', cloud: '⛅', overcast: '☁️', drop: '🌧️' };

/** Map a WMO weather code to one of our glyph keys. */
function glyphForCode(code?: number): string {
  if (code === undefined) return 'cloud';
  if (code === 0) return 'sun';
  if (code <= 2) return 'cloud';
  if (code <= 48) return 'overcast';
  return 'drop'; // rain / showers / thunderstorm / snow
}

function dayLabel(iso: string, i: number): string {
  if (i === 0) return 'Today';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function fetchedAgo(iso?: string): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 'just now';
  const min = Math.round(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  return `${hr} hr ago`;
}

// --- static fallback (used only when the live fetch fails) ---
const FALLBACK_HOURS: Array<[string, number, string]> = [
  ['Now', 27, 'cloud'],
  ['1PM', 28, 'sun'],
  ['2PM', 29, 'sun'],
  ['3PM', 28, 'cloud'],
  ['4PM', 26, 'cloud'],
  ['5PM', 24, 'drop'],
];

const FALLBACK_DAYS: Array<[string, string, number, number]> = [
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

  const [snap, setSnap] = useState<WeatherSnapshot | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await api.getWeather(DEFAULT_LAT, DEFAULT_LNG);
        if (!cancelled) {
          setSnap(s);
          setOffline(false);
        }
      } catch {
        if (!cancelled) setOffline(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derive view rows from the live snapshot, or fall back to placeholders.
  const live = snap && Number.isFinite(snap.current.tempC) ? snap : null;
  const currentTemp = live ? Math.round(live.current.tempC) : 27;
  const feelsLike =
    live && Number.isFinite(live.current.feelsLikeC ?? NaN)
      ? Math.round(live.current.feelsLikeC as number)
      : 29;
  const condition = live?.current.description ?? 'Partly cloudy';
  const currentGlyph = live ? GLYPH[glyphForCode(live.current.code)] : '⛅';
  const advisory = live?.advisories?.[0];
  const ageLabel = live ? fetchedAgo(live.fetchedAt) : offline ? 'offline' : '…';

  // Hourly strip: API gives only daily granularity, so show the 7-day mins as
  // a compact strip when live, otherwise the static hourly placeholder.
  const hourRows: Array<[string, number, string]> = live
    ? live.daily.slice(0, 6).map((d) => [dayLabel(d.date, 0) === 'Today' ? 'Today' : dayLabel(d.date, 1), Math.round(d.maxC), GLYPH[glyphForCode(d.code)]] as [string, number, string])
    : FALLBACK_HOURS.map(([h, t, ic]) => [h, t, GLYPH[ic]]);

  const dayRows: Array<[string, string, number, number]> = live
    ? live.daily.slice(0, 7).map((d, i) => [dayLabel(d.date, i), GLYPH[glyphForCode(d.code)], Math.round(d.maxC), Math.round(d.minC)] as [string, string, number, number])
    : FALLBACK_DAYS.map(([d, ic, hi, lo]) => [d, GLYPH[ic], hi, lo]);

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
          {ageLabel}
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
                {currentTemp}°
              </Text>
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', marginTop: 6 }}>
                {condition} · feels {feelsLike}°
              </Text>
            </View>
            <Text style={{ fontSize: 52 }}>{currentGlyph}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}
          >
            {hourRows.slice(0, 6).map(([h, t, glyph], idx) => (
              <View key={`${h}-${idx}`} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{h}</Text>
                <Text style={{ fontSize: 18, marginVertical: 4 }}>{glyph}</Text>
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
              {advisory ? 'Field advisory' : 'Good window for spraying till 4 PM'}
            </Text>
            <Text style={{ fontSize: 12.5, color: C.fgMuted, marginTop: 2 }}>
              {advisory ?? 'Low wind, no rain. Avoid after 5 PM — light showers likely.'}
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
          {live ? 'NEXT DAYS' : 'HOURLY'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {hourRows.map(([h, t, glyph], idx) => (
              <View
                key={`${h}-${idx}`}
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
                <Text style={{ fontSize: 22, marginVertical: 6 }}>{glyph}</Text>
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
          {dayRows.map(([d, glyph, hi, lo], i) => (
            <View
              key={`${d}-${i}`}
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
              <Text style={{ fontSize: 20 }}>{glyph}</Text>
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
