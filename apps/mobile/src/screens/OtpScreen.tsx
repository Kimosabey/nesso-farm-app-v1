import { useEffect, useRef, useState } from 'react';
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
import { ChevronLeft } from 'lucide-react-native';
import { type OtpConfirmation } from '@/firebase/auth';
import { api, ApiError } from '@/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  Debug: undefined;
};

type OtpRouteParams = {
  Otp: { phone: string; confirmation: OtpConfirmation };
};

type Props = NativeStackScreenProps<RootStackParamList & OtpRouteParams, 'Otp'>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_S = 30;
const PRIMARY = '#0D783C';
const DANGER = '#B42318';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mask all but the last 3 digits of a 10-digit phone, prefixed with +91 */
function formatMaskedPhone(tenDigits: string): string {
  const last3 = tenDigits.slice(-3);
  const bullets = '•'.repeat(Math.max(0, tenDigits.length - 3));
  return `+91 ${bullets}${last3}`;
}

// ---------------------------------------------------------------------------
// Sub-component: single OTP box
// ---------------------------------------------------------------------------

interface OtpBoxProps {
  digit: string;
  isActive: boolean;
  index: number;
}

function OtpBox({ digit, isActive }: OtpBoxProps) {
  const filled = digit.length > 0;

  const borderColor = isActive ? PRIMARY : filled ? `${PRIMARY}66` : undefined;
  const borderWidth = isActive || filled ? 2 : 2;

  return (
    <View
      className={[
        'items-center justify-center rounded-xl',
        filled ? 'bg-primary/5' : 'bg-bg-elevated',
      ].join(' ')}
      style={{
        width: 48,
        height: 56,
        borderWidth,
        borderColor: borderColor ?? '#C9D6CE', // border-border-strong fallback
        // Glow ring on active input
        ...(isActive
          ? {
              shadowColor: PRIMARY,
              shadowOpacity: 0.35,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
              elevation: 4,
            }
          : {}),
      }}
    >
      <Text
        className="font-mono text-xl text-fg text-center"
        style={{ letterSpacing: 0 }}
      >
        {digit}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function OtpScreen({ navigation, route }: Props) {
  const { phone, confirmation } = route.params;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  const hiddenInputRef = useRef<TextInput>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start the countdown on mount
  useEffect(() => {
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Focus hidden input on mount
  useEffect(() => {
    const t = setTimeout(() => hiddenInputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const codeString = digits.join('');
  const isComplete = codeString.length === OTP_LENGTH && digits.every((d) => d !== '');

  // -------------------------------------------------------------------------
  // Keystroke handling on the hidden TextInput
  // -------------------------------------------------------------------------

  function handleChangeText(text: string) {
    // Strip non-digits
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) return;

    // Paste: fill all boxes at once
    if (cleaned.length > 1) {
      const next = Array(OTP_LENGTH).fill('');
      for (let i = 0; i < OTP_LENGTH && i < cleaned.length; i++) {
        next[i] = cleaned[i] ?? '';
      }
      setDigits(next);
      setActiveIndex(Math.min(cleaned.length, OTP_LENGTH - 1));
      return;
    }

    // Single character: fill current box then advance
    if (activeIndex < OTP_LENGTH) {
      const next = [...digits];
      next[activeIndex] = cleaned;
      setDigits(next);
      const nextIndex = Math.min(activeIndex + 1, OTP_LENGTH - 1);
      setActiveIndex(nextIndex);
    }
  }

  function handleKeyPress(e: { nativeEvent: { key: string } }) {
    if (e.nativeEvent.key === 'Backspace') {
      setError(null);
      const next = [...digits];
      if (next[activeIndex]) {
        // Clear current box
        next[activeIndex] = '';
        setDigits(next);
      } else if (activeIndex > 0) {
        // Move back and clear previous
        const prevIndex = activeIndex - 1;
        next[prevIndex] = '';
        setDigits(next);
        setActiveIndex(prevIndex);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  async function handleVerify() {
    setError(null);
    if (!isComplete) return;
    setBusy(true);
    try {
      const idToken = await confirmation.confirm(codeString);
      await api.otpVerify(idToken);
      navigation.replace('Main');
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Verification failed',
      );
    } finally {
      setBusy(false);
    }
  }

  // -------------------------------------------------------------------------
  // Resend
  // -------------------------------------------------------------------------

  function handleResend() {
    if (cooldown > 0) return;
    // Reset state
    setDigits(Array(OTP_LENGTH).fill(''));
    setActiveIndex(0);
    setError(null);
    setCooldown(RESEND_COOLDOWN_S);
    // Restart countdown
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Re-focus input
    hiddenInputRef.current?.focus();
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const maskedPhone = formatMaskedPhone(phone);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ---- Back button ---- */}
          <View className="px-6 pt-4 pb-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-bg-muted"
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={24} color="#4A5A52" strokeWidth={2} />
            </Pressable>
          </View>

          <View className="flex-1 px-6 pt-6">
            {/* ---- Phone chip ---- */}
            <View className="self-start mb-6">
              <View
                className="flex-row items-center rounded-full px-4 py-2"
                style={{ backgroundColor: `${PRIMARY}14` }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: PRIMARY, letterSpacing: 0.5 }}
                >
                  {maskedPhone}
                </Text>
              </View>
            </View>

            {/* ---- Heading ---- */}
            <Text
              className="font-display text-fg"
              style={{ fontSize: 30, fontWeight: '700', letterSpacing: -0.5 }}
            >
              Verify your number
            </Text>

            {/* ---- Subtext ---- */}
            <Text className="mt-2 text-sm text-fg-muted">
              Enter the 6-digit code sent to your number
            </Text>

            {/* ---- OTP boxes ---- */}
            <View className="mt-8 flex-row gap-2">
              {digits.map((digit, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setActiveIndex(index);
                    hiddenInputRef.current?.focus();
                  }}
                  accessibilityLabel={`Digit ${index + 1}`}
                >
                  <OtpBox digit={digit} isActive={activeIndex === index} index={index} />
                </Pressable>
              ))}
            </View>

            {/* Hidden TextInput that captures all keystrokes */}
            <TextInput
              ref={hiddenInputRef}
              value=""
              onChangeText={handleChangeText}
              onKeyPress={handleKeyPress}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              caretHidden
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                opacity: 0,
                // Place off-screen to prevent any visible flicker
                top: -999,
                left: -999,
              }}
            />

            {/* ---- Resend section ---- */}
            <View className="mt-6 flex-row items-center">
              {cooldown > 0 ? (
                <Text className="text-sm text-fg-subtle">
                  Resend code in{' '}
                  <Text className="font-medium text-fg-subtle">
                    0:{String(cooldown).padStart(2, '0')}
                  </Text>
                </Text>
              ) : (
                <Pressable onPress={handleResend} className="active:opacity-70">
                  <Text className="text-sm font-medium" style={{ color: PRIMARY }}>
                    Resend code
                  </Text>
                </Pressable>
              )}
            </View>

            {/* ---- Error message ---- */}
            {error ? (
              <View
                className="mt-4 rounded-md px-3 py-2"
                style={{
                  borderWidth: 1,
                  borderColor: `${DANGER}4D`,
                  backgroundColor: `${DANGER}1A`,
                }}
              >
                <Text className="text-sm" style={{ color: DANGER }}>
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Spacer so the sticky CTA doesn't overlap content */}
          <View style={{ height: 96 }} />
        </ScrollView>

        {/* ---- Sticky CTA ---- */}
        <View className="px-6 pb-8 pt-3 bg-bg border-t border-border">
          <Pressable
            onPress={handleVerify}
            disabled={!isComplete || busy}
            className="items-center justify-center rounded-xl bg-primary active:opacity-90"
            style={{
              height: 52,
              opacity: !isComplete || busy ? 0.6 : 1,
            }}
            accessibilityLabel="Verify and continue"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Verify &amp; continue
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
