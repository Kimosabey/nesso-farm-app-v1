/**
 * OTP verify screen — 100% spec parity with design handoff (M3).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_auth.jsx — OtpScreen
 *   - Back button: 42px circle, top-left
 *   - H1 "Verify your number" 30px/700
 *   - Subtext + masked phone "+91 ••••• XXX" (last 3 digits, mono)
 *   - 6 square inputs (aspect 1, 24px mono, 14px radius):
 *       filled → 2px primary ring; empty → inset 1.5px border-strong
 *   - Auto-advance on fill, backspace-to-prev
 *   - Resend: "Resend code in 0:30" countdown → "Resend code" button
 *   - Sticky CTA "Verify & continue" + checkmark, disabled until all 6
 */
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError } from '@/api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

export function OtpScreen({ navigation, route }: Props) {
  const { phone, confirmation } = route.params;
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const full = code.every((c) => c !== '');
  const masked = `+91 ••••• ${phone.slice(-3)}`;

  function setDigit(i: number, raw: string) {
    const v = raw.replace(/\D/g, '').slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKeyPress(i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (!full || busy) return;
    setError(null);
    setBusy(true);
    try {
      const idToken = await confirmation.confirm(code.join(''));
      await api.otpVerify(idToken);
      navigation.replace('Main');
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Verification failed',
      );
    } finally {
      setBusy(false);
    }
  }

  function handleResend() {
    if (cooldown > 0) return;
    setCooldown(30);
    // A full resend would re-call sendOtp; for now reset the countdown.
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFDFA' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back button */}
        <View style={{ paddingTop: 8, paddingLeft: 18, paddingRight: 26 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DDE6E0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 24, color: '#0F1A14', marginTop: -3 }}>‹</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 26, paddingTop: 24, flex: 1 }}>
          <Text style={{ fontSize: 30, fontWeight: '700', color: '#0F1A14', letterSpacing: -0.6 }}>
            Verify your number
          </Text>
          <Text style={{ fontSize: 15.5, color: '#4A5A52', marginTop: 12, lineHeight: 23 }}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={{ color: '#0F1A14', fontWeight: '600', fontFamily: MONO }}>{masked}</Text>
          </Text>

          {/* 6 segmented inputs */}
          <View style={{ flexDirection: 'row', gap: 9, marginTop: 34 }}>
            {code.map((c, i) => (
              <TextInput
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={c}
                onChangeText={(v) => setDigit(i, v)}
                onKeyPress={(e) => onKeyPress(i, e)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!busy}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: '600',
                  fontFamily: MONO,
                  borderRadius: 14,
                  color: '#0F1A14',
                  backgroundColor: '#FFFFFF',
                  borderWidth: c ? 2 : 1.5,
                  borderColor: c ? '#0D783C' : '#BFCFC6',
                }}
              />
            ))}
          </View>

          {/* Resend */}
          <View style={{ marginTop: 24 }}>
            {cooldown > 0 ? (
              <Text style={{ fontSize: 14, color: '#4A5A52' }}>
                Resend code in{' '}
                <Text style={{ color: '#0F1A14', fontFamily: MONO }}>
                  0:{String(cooldown).padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0D783C' }}>Resend code</Text>
              </Pressable>
            )}
          </View>

          {/* Error */}
          {error ? (
            <View
              style={{
                marginTop: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(180,35,24,0.3)',
                backgroundColor: 'rgba(180,35,24,0.06)',
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: '#B42318' }}>{error}</Text>
            </View>
          ) : null}
        </View>

        {/* Sticky CTA */}
        <View
          style={{
            paddingHorizontal: 26,
            paddingTop: 16,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
          }}
        >
          <Pressable
            onPress={handleVerify}
            disabled={!full || busy}
            style={({ pressed }) => ({
              height: 54,
              borderRadius: 14,
              backgroundColor: '#0D783C',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: !full || busy ? 0.5 : pressed ? 0.9 : 1,
            })}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>
                  Verify &amp; continue
                </Text>
                <Text style={{ fontSize: 16, color: '#FFFFFF' }}>✓</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
