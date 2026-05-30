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
import { isPhoneOtpAvailable, sendOtp, type OtpConfirmation } from '@/firebase/auth';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  Debug: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type Mode = 'password' | 'otp';
type OtpStep = 'enter-phone' | 'enter-code';

export function LoginScreen({ navigation }: Props) {
  const otpAvailable = isPhoneOtpAvailable();
  const [mode, setMode] = useState<Mode>('password');
  const [phone, setPhone] = useState('9066666481');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP-only state
  const [otpStep, setOtpStep] = useState<OtpStep>('enter-phone');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<OtpConfirmation | null>(null);

  async function submitPassword() {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setBusy(true);
    try {
      await api.passwordLogin(phone.trim(), password);
      navigation.replace('Main');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reach the server');
    } finally {
      setBusy(false);
    }
  }

  async function submitSendOtp() {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setBusy(true);
    try {
      const c = await sendOtp(phone.trim());
      setConfirmation(c);
      setOtpStep('enter-code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function submitVerifyOtp() {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return;
    }
    if (!confirmation) {
      setError('Session expired — request a new code');
      setOtpStep('enter-phone');
      return;
    }
    setBusy(true);
    try {
      const idToken = await confirmation.confirm(code);
      await api.otpVerify(idToken);
      navigation.replace('Main');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }

  function toggleMode(next: Mode) {
    setMode(next);
    setError(null);
    setOtpStep('enter-phone');
    setCode('');
    setConfirmation(null);
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
          <Pressable
            onLongPress={() => navigation.navigate('Debug')}
            delayLongPress={800}
            className="mb-2 flex-row items-center gap-2"
          >
            <View className="size-2 rounded-full bg-primary" />
            <Text className="text-xs uppercase tracking-wider text-fg-subtle">Nesso</Text>
          </Pressable>

          <Text className="font-display text-4xl text-fg tracking-tight">Welcome back</Text>
          <Text className="mt-2 text-base text-fg-muted">
            {mode === 'password' ? 'Sign in with password' : 'Sign in with OTP'}
          </Text>

          {/* Mode toggle */}
          <View className="mt-6 flex-row rounded-md border border-border bg-bg-elevated p-1">
            <Pressable
              onPress={() => toggleMode('password')}
              className={`flex-1 h-9 items-center justify-center rounded ${
                mode === 'password' ? 'bg-primary' : ''
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  mode === 'password' ? 'text-white' : 'text-fg-muted'
                }`}
              >
                Password
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleMode('otp')}
              className={`flex-1 h-9 items-center justify-center rounded ${
                mode === 'otp' ? 'bg-primary' : ''
              }`}
            >
              <Text
                className={`text-sm font-medium ${mode === 'otp' ? 'text-white' : 'text-fg-muted'}`}
              >
                OTP
              </Text>
            </Pressable>
          </View>

          {mode === 'password' ? (
            <View className="mt-6 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-fg">Phone</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="9066666481"
                  placeholderTextColor="#7A8A82"
                  keyboardType="number-pad"
                  maxLength={10}
                  autoComplete="tel"
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
                  onSubmitEditing={submitPassword}
                  className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
                />
              </View>
            </View>
          ) : otpStep === 'enter-phone' ? (
            <View className="mt-6 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-fg">Phone</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="9066666481"
                  placeholderTextColor="#7A8A82"
                  keyboardType="number-pad"
                  maxLength={10}
                  autoComplete="tel"
                  editable={!busy}
                  onSubmitEditing={submitSendOtp}
                  className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg"
                />
              </View>
            </View>
          ) : (
            <View className="mt-6 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-fg">6-digit code sent to +91 {phone}</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#7A8A82"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="sms-otp"
                  editable={!busy}
                  onSubmitEditing={submitVerifyOtp}
                  className="h-12 rounded-md border border-border-strong bg-bg-elevated px-3 text-base text-fg tracking-[6px]"
                />
              </View>
              <Pressable onPress={() => setOtpStep('enter-phone')} disabled={busy}>
                <Text className="text-sm text-primary">Change phone number</Text>
              </Pressable>
            </View>
          )}

          {error ? (
            <View className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
              <Text className="text-sm text-danger">{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={
              mode === 'password'
                ? submitPassword
                : otpStep === 'enter-phone'
                  ? submitSendOtp
                  : submitVerifyOtp
            }
            disabled={busy}
            className="mt-6 h-12 items-center justify-center rounded-md bg-primary active:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-medium text-white">
                {mode === 'password'
                  ? 'Sign in'
                  : otpStep === 'enter-phone'
                    ? 'Send OTP'
                    : 'Verify & continue'}
              </Text>
            )}
          </Pressable>

          {mode === 'otp' && !otpAvailable ? (
            <View className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <Text className="text-xs text-amber-200">
                Phone OTP needs an EAS dev build. In Expo Go, use password login instead.
              </Text>
            </View>
          ) : null}

          {mode === 'password' ? (
            <Text className="mt-6 text-xs text-fg-subtle">
              Seeded admin: <Text className="font-mono">9066666481</Text> /{' '}
              <Text className="font-mono">Nesso!Admin!2026</Text>
            </Text>
          ) : null}
          <Text className="mt-2 text-xs text-fg-subtle">
            On Android emulator the API is at <Text className="font-mono">10.0.2.2:4000</Text>. On a
            real phone, set <Text className="font-mono">EXPO_PUBLIC_API_URL</Text> to your PC's LAN
            IP.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
