import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadSessionFromStorage } from '@/api/client';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let mounted = true;
    (async () => {
      const me = await loadSessionFromStorage();
      // Small delay so the splash isn't a flash
      await new Promise((r) => setTimeout(r, 400));
      if (!mounted) return;
      navigation.replace(me ? 'Main' : 'Login');
    })();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="font-display text-5xl text-white tracking-tight">Nesso</Text>
      <Text className="mt-2 text-sm text-white/80">Farm-to-fork traceability</Text>
      <ActivityIndicator className="mt-8" color="white" />
    </View>
  );
}
