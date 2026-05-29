import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, getAccessToken, type MeResponse } from '@/api/client';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      navigation.replace('Login');
      return;
    }
    api
      .me()
      .then(setMe)
      .catch((e: Error) => setError(e.message));
  }, [navigation]);

  function signOut() {
    api.logout();
    navigation.replace('Login');
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 py-8" contentInsetAdjustmentBehavior="automatic">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="size-2 rounded-full bg-primary" />
            <Text className="text-xs uppercase tracking-wider text-fg-subtle">
              {me ? me.role : 'Phase 1 · Auth'}
            </Text>
          </View>
          <Pressable
            onPress={signOut}
            className="h-9 items-center justify-center rounded-md border border-border-strong px-3"
          >
            <Text className="text-sm text-fg">Sign out</Text>
          </Pressable>
        </View>

        {error ? (
          <View className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        <Text className="font-display text-4xl text-fg tracking-tight">
          {me ? `Welcome, ${me.firstName ?? me.phone}` : 'Welcome to Nesso'}
        </Text>
        <Text className="mt-3 text-base text-fg-muted">
          {me
            ? `Signed in as ${me.phone}. Tablet layout: ${isTablet ? 'on' : 'off'} (${width}px).`
            : 'Loading your profile…'}
        </Text>

        <View className={isTablet ? 'mt-8 flex-row flex-wrap gap-3' : 'mt-8 gap-3'}>
          {[
            { label: 'Farmers', value: '0' },
            { label: 'Farms', value: '0' },
            { label: 'Today', value: '0' },
            { label: 'Pending', value: '0' },
          ].map((s) => (
            <View
              key={s.label}
              className={`rounded-2xl border border-border bg-bg-elevated p-4 ${isTablet ? 'w-44' : ''}`}
            >
              <Text className="text-xs uppercase tracking-wider text-fg-subtle">{s.label}</Text>
              <Text className="mt-1 font-display text-xl text-fg tabular-nums">{s.value}</Text>
            </View>
          ))}
        </View>

        <View className="mt-10 rounded-2xl border border-border bg-bg-muted p-5">
          <Text className="font-display text-lg text-fg">Coming next · Phase 2</Text>
          <Text className="mt-2 text-sm text-fg-muted">
            Farmer registration with offline SQLite outbox, polygon farm mapping, and approval
            sync. Tokens currently in-memory — Phase 2 persists them in MMKV.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
