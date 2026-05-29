import { useEffect } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAccessToken } from '@/api/client';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    // Phase 2 will: hydrate token from MMKV, run DB migrations, prefetch core data
    const id = setTimeout(() => {
      navigation.replace(getAccessToken() ? 'Home' : 'Login');
    }, 800);
    return () => clearTimeout(id);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="font-display text-5xl text-white tracking-tight">Nesso</Text>
      <Text className="mt-2 text-sm text-white/80">Farm-to-fork traceability</Text>
    </View>
  );
}
