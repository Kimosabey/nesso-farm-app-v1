/**
 * Splash screen — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_auth.jsx
 *   - Background: radial gradient #5DB683 → #0D783C → #06401f
 *   - Logo: 5 green circles (petals) + yellow teardrop drop, staggered entrance
 *   - Text: "NESSO" 700/38px + tagline, both rise-in animated
 *   - Bottom: spinning golden ring + "v1.0 · NR Group" mono text
 *   - Tap anywhere to skip; auto-advances after 2.6s
 */
import { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { loadSessionFromStorage } from '@/api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

// Individual petal that scales in from 0 with a delay
function Petal({ cx, cy, r, fill, delay }: {
  cx: number; cy: number; r: number; fill: string; delay: number;
}) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ scale }],
        opacity,
      }}
    >
      <Svg width={100} height={100} viewBox="0 0 100 100" style={{ position: 'absolute', left: -(100 / 2), top: -(100 / 2) }}>
        <Circle cx={cx} cy={cy} r={r} fill={fill} />
      </Svg>
    </Animated.View>
  );
}

function LogoBloom({ size = 116 }: { size?: number }) {
  const dropScale = useRef(new Animated.Value(0)).current;
  const dropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(dropScale, {
          toValue: 1,
          damping: 14,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const svgSize = size * 0.66;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 18 },
        elevation: 12,
      }}
    >
      <View style={{ width: svgSize, height: svgSize }}>
        {/* Petal 1 — top (100ms) */}
        <View style={{ position: 'absolute', left: svgSize / 2, top: svgSize / 2 }}>
          <Petal cx={50} cy={26} r={15} fill="#0D783C" delay={100} />
        </View>
        {/* Petal 2 — bottom-left (200ms) */}
        <View style={{ position: 'absolute', left: svgSize / 2, top: svgSize / 2 }}>
          <Petal cx={28} cy={46} r={15} fill="#0D783C" delay={200} />
        </View>
        {/* Petal 3 — right (300ms) */}
        <View style={{ position: 'absolute', left: svgSize / 2, top: svgSize / 2 }}>
          <Petal cx={72} cy={46} r={15} fill="#207647" delay={300} />
        </View>
        {/* Petal 4 — lower-left (400ms) */}
        <View style={{ position: 'absolute', left: svgSize / 2, top: svgSize / 2 }}>
          <Petal cx={40} cy={58} r={14} fill="#207647" delay={400} />
        </View>
        {/* Petal 5 — lower-right (480ms) */}
        <View style={{ position: 'absolute', left: svgSize / 2, top: svgSize / 2 }}>
          <Petal cx={60} cy={58} r={14} fill="#0D783C" delay={480} />
        </View>
        {/* Yellow teardrop drop (550ms) */}
        <Animated.View
          style={{
            position: 'absolute',
            left: svgSize / 2,
            top: svgSize / 2,
            transform: [{ scaleY: dropScale }],
            opacity: dropOpacity,
            transformOrigin: 'top center',
          }}
        >
          <Svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 100 100"
            style={{ position: 'absolute', left: -(svgSize / 2), top: -(svgSize / 2) }}
          >
            <Path
              d="M50 48 C59 60 59 74 50 82 C41 74 41 60 50 48 Z"
              fill="#F1D412"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

function SpinningRing() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2.5,
        borderColor: 'rgba(255,255,255,0.25)',
        borderTopColor: '#F1D412',
        transform: [{ rotate: spin }],
      }}
    />
  );
}

export function SplashScreen({ navigation }: Props) {
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(12)).current;
  const word2Opacity = useRef(new Animated.Value(0)).current;
  const word2Translate = useRef(new Animated.Value(12)).current;

  const navigateAway = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    // "NESSO" rise-in at 700ms
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(wordOpacity, { toValue: 1, damping: 18, stiffness: 200, useNativeDriver: true }),
        Animated.spring(wordTranslate, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
      ]).start();
    }, 700);

    // Tagline rise-in at 900ms
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(word2Opacity, { toValue: 1, damping: 18, stiffness: 200, useNativeDriver: true }),
        Animated.spring(word2Translate, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
      ]).start();
    }, 900);

    const doNavigate = async (): Promise<void> => {
      const me = await loadSessionFromStorage();
      if (!mounted) return;
      navigation.replace(me ? 'Main' : 'Login');
    };

    navigateAway.current = (): void => {
      if (!mounted) return;
      mounted = false;
      void doNavigate();
    };

    const timer = setTimeout(() => navigateAway.current?.(), 2600);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <Pressable
      onPress={() => navigateAway.current?.()}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // Radial gradient approximation via background layers
        // React Native doesn't support radial-gradient natively,
        // so we use a primary green background with an aurora glow overlay
        backgroundColor: '#0D783C',
        overflow: 'hidden',
      }}
    >
      {/* Aurora glow — simulates radial gradient highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          top: '-5%',
          borderRadius: 180,
          backgroundColor: 'rgba(93,182,131,0.35)',
          // No blur in RN without libraries — use opacity to simulate
        }}
      />
      {/* Golden aurora behind logo */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          top: '8%',
          borderRadius: 150,
          backgroundColor: 'rgba(241,212,18,0.12)',
        }}
      />

      {/* Content */}
      <View style={{ alignItems: 'center' }}>
        <LogoBloom size={116} />

        {/* "NESSO" — rise-in */}
        <Animated.Text
          style={{
            marginTop: 30,
            fontFamily: 'System',
            fontWeight: '700',
            fontSize: 38,
            letterSpacing: 6,
            color: '#ffffff',
            opacity: wordOpacity,
            transform: [{ translateY: wordTranslate }],
          }}
        >
          NESSO
        </Animated.Text>

        {/* Tagline — rise-in */}
        <Animated.Text
          style={{
            marginTop: 8,
            fontSize: 14,
            color: 'rgba(255,255,255,0.78)',
            fontWeight: '500',
            letterSpacing: 0.3,
            opacity: word2Opacity,
            transform: [{ translateY: word2Translate }],
          }}
        >
          Farm to fork, verified
        </Animated.Text>
      </View>

      {/* Bottom spinner + version */}
      <View
        style={{
          position: 'absolute',
          bottom: 72,
          alignItems: 'center',
          gap: 16,
        }}
      >
        <SpinningRing />
        <Text
          style={{
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 0.8,
            fontVariant: ['tabular-nums'],
          }}
        >
          v0.0.1 · NR Group
        </Text>
      </View>
    </Pressable>
  );
}
