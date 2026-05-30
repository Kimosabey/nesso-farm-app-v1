/**
 * Offline maps — 100% spec parity with design handoff (OfflineMapScreen).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_quality.jsx — OfflineMapScreen
 *   - PushHeader: "Offline maps" + sub "Download tiles for field use"
 *   - Faux map with a dashed-border selection rectangle overlay + area label
 *   - "Selected area" + size, "Download" → Animated progress bar 0→100% → adds
 *     region to a downloaded list
 *   - Downloaded regions list: name, size, date, delete icon (seeded with 2 rows)
 */
import { useCallback, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Defs, Pattern, Path, Rect, Polygon, Circle } from 'react-native-svg';
import { ChevronLeft, Download, Map as MapIcon, X } from 'lucide-react-native';
import { useTheme } from '@/theme';

type OfflineMapsParamList = { OfflineMaps: undefined };
type Nav = NativeStackNavigationProp<OfflineMapsParamList, 'OfflineMaps'>;

interface Region {
  id: string;
  name: string;
  size: string;
  date: string;
}

function FauxMap() {
  return (
    <View style={{ flex: 1, backgroundColor: '#21331f', overflow: 'hidden' }}>
      <Svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.35 }}>
        <Defs>
          <Pattern
            id="fmo"
            width={40}
            height={40}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(20)"
          >
            <Path d="M0 10H40M0 26H40" stroke="#5b8a5f" strokeWidth={5} opacity={0.5} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#fmo)" />
      </Svg>
      <Svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <Polygon
          points="34,26 60,18 70,44 54,62 30,52"
          fill="rgba(241,212,18,0.12)"
          stroke="#F1D412"
          strokeWidth={1.5}
        />
        {([[34, 26], [60, 18], [70, 44], [54, 62], [30, 52]] as const).map((p, i) => (
          <Circle key={i} cx={p[0]} cy={p[1]} r={1.2} fill="#fff" />
        ))}
      </Svg>
    </View>
  );
}

const todayLabel = () =>
  new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export function OfflineMapsScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [regions, setRegions] = useState<Region[]>([
    { id: 'r1', name: 'Hassan Central', size: '120 MB', date: '12 May 2026' },
    { id: 'r2', name: 'Belur', size: '85 MB', date: '03 May 2026' },
  ]);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDownload = useCallback(() => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);
    progressAnim.setValue(0);
    let pct = 0;
    timer.current = setInterval(() => {
      pct += 8;
      if (pct >= 100) {
        pct = 100;
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setProgress(100);
        Animated.timing(progressAnim, { toValue: 1, duration: 120, useNativeDriver: false }).start(
          () => {
            setRegions((prev) => [
              { id: `r${Date.now()}`, name: 'Channarayapatna', size: '48 MB', date: todayLabel() },
              ...prev,
            ]);
            setDownloading(false);
            setProgress(0);
            progressAnim.setValue(0);
          },
        );
        return;
      }
      setProgress(pct);
      Animated.timing(progressAnim, {
        toValue: pct / 100,
        duration: 160,
        useNativeDriver: false,
      }).start();
    }, 160);
  }, [downloading, progressAnim]);

  const removeRegion = useCallback((id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
          backgroundColor: C.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: C.bgElevated,
            borderWidth: 1.5,
            borderColor: C.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={22} color={C.fg} />
        </Pressable>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg, letterSpacing: -0.2 }}>
            Offline maps
          </Text>
          <Text style={{ fontSize: 12, color: C.fgMuted }}>Download tiles for field use</Text>
        </View>
      </View>

      {/* Map with dashed selection rectangle */}
      <View style={{ height: 200, position: 'relative' }}>
        <FauxMap />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            borderWidth: 2.5,
            borderColor: C.accent,
            borderStyle: 'dashed',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 12.5,
              fontWeight: '600',
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.4)',
              paddingHorizontal: 11,
              paddingVertical: 5,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            ~12 km² · ~48 MB
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* Selected area + download */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <View>
            <Text style={{ fontSize: 13, color: C.fgMuted }}>Selected area</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.fg, marginTop: 1 }}>
              ~12 km² · 48 MB
            </Text>
          </View>
          <Pressable
            onPress={startDownload}
            disabled={downloading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              paddingHorizontal: 16,
              height: 44,
              borderRadius: 12,
              backgroundColor: C.primary,
              opacity: downloading ? 0.6 : 1,
            }}
          >
            <Download size={17} color={C.onPrimary} />
            <Text style={{ color: C.onPrimary, fontWeight: '700', fontSize: 14 }}>
              {downloading ? 'Downloading…' : 'Download'}
            </Text>
          </Pressable>
        </View>

        {downloading ? (
          <View style={{ marginBottom: 18 }}>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: C.bgMuted,
                overflow: 'hidden',
              }}
            >
              <Animated.View
                style={{
                  height: '100%',
                  width: widthInterpolate,
                  backgroundColor: C.primary,
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ fontSize: 11.5, color: C.fgSubtle, marginTop: 6 }}>
              Downloading tiles… {progress}%
            </Text>
          </View>
        ) : null}

        {/* Downloaded regions */}
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: '700',
            letterSpacing: 1,
            color: C.fgSubtle,
            textTransform: 'uppercase',
            paddingHorizontal: 4,
            paddingBottom: 8,
          }}
        >
          Downloaded regions
        </Text>
        <View
          style={{
            backgroundColor: C.bgElevated,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.border,
            overflow: 'hidden',
          }}
        >
          {regions.length === 0 ? (
            <View style={{ paddingVertical: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: C.fgMuted }}>No regions downloaded yet.</Text>
            </View>
          ) : (
            regions.map((r, i) => (
              <View
                key={r.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 13,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: i === regions.length - 1 ? 0 : 1,
                  borderBottomColor: C.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(60,107,81,0.14)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapIcon size={18} color={C.secondaryD} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>{r.name}</Text>
                  <Text style={{ fontSize: 12, color: C.fgMuted, marginTop: 1 }}>
                    {r.size} · {r.date}
                  </Text>
                </View>
                <Pressable onPress={() => removeRegion(r.id)} hitSlop={8} style={{ padding: 4 }}>
                  <X size={18} color={C.danger} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
