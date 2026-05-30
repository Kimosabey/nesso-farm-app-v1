import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadSessionFromStorage } from '@/api/client';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

// Animated SVG wrapper — Animated.Value can't be passed directly to SVG transform
// so we use a wrapping Animated.View around the SVG component.
function NessoLogomark() {
  return (
    <Svg width={88} height={88} viewBox="0 0 88 88" fill="none">
      {/* Top petal */}
      <Ellipse
        cx={44}
        cy={18}
        rx={9}
        ry={16}
        fill="rgba(241, 212, 18, 0.85)"
        transform="rotate(0 44 44)"
      />
      {/* Right petal */}
      <Ellipse
        cx={70}
        cy={44}
        rx={9}
        ry={16}
        fill="rgba(241, 212, 18, 0.60)"
        transform="rotate(90 44 44)"
      />
      {/* Bottom petal */}
      <Ellipse
        cx={44}
        cy={70}
        rx={9}
        ry={16}
        fill="rgba(241, 212, 18, 0.40)"
        transform="rotate(180 44 44)"
      />
      {/* Left petal */}
      <Ellipse
        cx={18}
        cy={44}
        rx={9}
        ry={16}
        fill="rgba(241, 212, 18, 0.60)"
        transform="rotate(270 44 44)"
      />
      {/* Center circle */}
      <Ellipse cx={44} cy={44} rx={14} ry={14} fill="white" />
      {/* N letterform inside center circle */}
      <Path
        d="M36 52 L36 36 L39 36 L49 48 L49 36 L52 36 L52 52 L49 52 L39 40 L39 52 Z"
        fill="#0D783C"
      />
    </Svg>
  );
}

export function SplashScreen({ navigation }: Props) {
  // Bloom scale: 0.6 → 1.0 on mount
  const bloomScale = useRef(new Animated.Value(0.6)).current;
  // Pulse scale: 1.0 → 1.04 → 1.0 loop, starts after bloom
  const pulseScale = useRef(new Animated.Value(1.0)).current;
  // Progress bar: 0 → 1 over 2s
  const progress = useRef(new Animated.Value(0)).current;

  // Combined scale: bloom * pulse (both driving the same wrapper)
  // We sequence them so pulse begins only after bloom completes.

  useEffect(() => {
    let mounted = true;

    // Bloom animation
    Animated.spring(bloomScale, {
      toValue: 1.0,
      damping: 12,
      stiffness: 180,
      useNativeDriver: true,
    }).start(() => {
      if (!mounted) return;
      // Start pulse loop after bloom
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.04,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1.0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });

    // Progress bar — runs independently, drives navigation
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false, // width is not a transform, needs layout driver
    }).start();

    // Session load + navigate after 2s progress bar
    (async () => {
      const me = await loadSessionFromStorage();
      // Wait at least 2s for the progress animation to finish
      await new Promise((r) => setTimeout(r, 2200));
      if (!mounted) return;
      navigation.replace(me ? 'Main' : 'Login');
    })();

    return () => {
      mounted = false;
    };
  }, [navigation, bloomScale, pulseScale, progress]);

  // Combine bloom + pulse into a single scale transform
  const combinedScale = Animated.multiply(bloomScale, pulseScale);

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D783C' }}
    >
      {/* Animated logomark */}
      <Animated.View style={{ transform: [{ scale: combinedScale }] }}>
        <NessoLogomark />
      </Animated.View>

      {/* Brand name */}
      <Text
        style={{
          marginTop: 20,
          color: '#FFFFFF',
          fontWeight: '700',
          fontSize: 13,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        NESSO
      </Text>

      {/* Tagline */}
      <Text
        style={{
          marginTop: 6,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 13,
        }}
      >
        Farm-to-fork traceability
      </Text>

      {/* Progress pill */}
      <View
        style={{
          position: 'absolute',
          bottom: 56,
          left: 48,
          right: 48,
          height: 3,
          borderRadius: 99,
          backgroundColor: 'rgba(255, 255, 255, 0.20)',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 99,
            backgroundColor: 'rgba(255, 255, 255, 0.90)',
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
}
