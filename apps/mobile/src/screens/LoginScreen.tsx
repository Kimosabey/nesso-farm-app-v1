import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, ApiError } from '@/api/client';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('9066666481');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!phone.trim() || !password) {
      setError('Phone and password are required');
      return;
    }
    setBusy(true);
    try {
      await api.passwordLogin(phone.trim(), password);
      navigation.replace('Home');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reach the server');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-2 flex-row items-center gap-2">
            <View className="size-2 rounded-full bg-primary" />
            <Text className="text-xs uppercase tracking-wider text-fg-subtle">Nesso</Text>
          </View>

          <Text className="font-display text-4xl text-fg tracking-tight">Welcome back</Text>
          <Text className="mt-2 text-base text-fg-muted">Sign in to continue</Text>

          <View className="mt-8 gap-4">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-fg">Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="9066666481"
                placeholderTextColor="#7A8A82"
                keyboardType="number-pad"
                autoComplete="tel"
                returnKeyType="next"
                editable={!busy}
                className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
              />
            </View>
            <View>
              <Text className="mb-1.5 text-sm font-medium text-fg">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#7A8A82"
                secureTextEntry
                autoComplete="current-password"
                returnKeyType="go"
                editable={!busy}
                onSubmitEditing={submit}
                className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
              />
            </View>
          </View>

          {error ? (
            <View className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
              <Text className="text-sm text-danger">{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={busy}
            className="mt-6 h-12 items-center justify-center rounded-md bg-primary active:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-medium text-white">Sign in</Text>
            )}
          </Pressable>

          <Text className="mt-6 text-xs text-fg-subtle">
            Try the seeded admin: <Text className="font-mono">9066666481</Text> /{' '}
            <Text className="font-mono">Nesso!Admin!2026</Text>
          </Text>
          <Text className="mt-2 text-xs text-fg-subtle">
            Note: on Android emulator the API URL is{' '}
            <Text className="font-mono">http://10.0.2.2:4000</Text>. On a real phone, set{' '}
            <Text className="font-mono">EXPO_PUBLIC_API_URL</Text> to your PC's LAN IP.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
