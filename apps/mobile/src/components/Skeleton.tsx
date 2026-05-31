/**
 * Skeleton — shimmer placeholders for loading states.
 *
 * `Skeleton` is a single Animated.View that pulses opacity 0.4↔1 over 900ms.
 * `ListSkeleton` renders N card-shaped shimmer rows matching the list card
 * layout (avatar circle + 2 text lines). Themed via useTheme().c (bgMuted).
 */
import { useEffect, useRef } from 'react';
import { Animated, View, type DimensionValue, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/theme';

interface SkeletonProps {
  w?: DimensionValue;
  h?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ w = '100%', h = 14, radius = 8, style }: SkeletonProps) {
  const C = useTheme().c;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width: w, height: h, borderRadius: radius, backgroundColor: C.bgMuted, opacity }, style]}
    />
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  const C = useTheme().c;
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            backgroundColor: C.bgElevated,
            borderRadius: 16,
            padding: 13,
            borderWidth: 1,
            borderColor: C.border,
            marginBottom: 10,
          }}
        >
          <Skeleton w={46} h={46} radius={23} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton w="55%" h={13} />
            <Skeleton w="80%" h={11} />
          </View>
        </View>
      ))}
    </View>
  );
}
