/**
 * Login screen — 100% spec parity with design handoff (M2), themed + robust.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_auth.jsx — LoginScreen
 *   - Top row: Language chip (🌐 EN) + Theme toggle (live)
 *   - Hero: 60px logo tile + H1 "Welcome to Nesso" + description
 *   - "+91" prefix field, mono hint, 10-digit validation
 *   - Primary CTA pinned to the bottom of the scroll (always reachable,
 *     never hidden behind the keyboard) + T&C line
 *   - Expo Go: staff password mode auto-shows with a working "Sign in".
 *     Dev build: OTP-only "Send OTP" per spec. Long-press logo also
 *     forces password mode.
 */
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HelpCircle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError } from '@/api/client';
import { isPhoneOtpAvailable, sendOtp } from '@/firebase/auth';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { c: C, isDark, toggle } = useTheme();
  const { t, locale, languages } = useT();
  const otpAvailable = isPhoneOtpAvailable();

  // Short label for the language chip: the native script for known locales,
  // else the uppercased code.
  const localeLabel = languages.find((l) => l.code === locale)?.native ?? locale.toUpperCase();

  const [phone, setPhone] = useState(otpAvailable ? '' : '9066666481');
  const [password, setPassword] = useState(otpAvailable ? '' : 'Nesso!Admin!2026');
  const [showPasswordMode, setShowPasswordMode] = useState(!otpAvailable);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^[6-9]\d{9}$/.test(phone);
  const canSubmit = showPasswordMode ? !!phone && !!password : valid;

  async function handleSendOtp() {
    if (!valid || busy) return;
    setError(null);
    setBusy(true);
    try {
      const confirmation = await sendOtp(phone.trim());
      navigation.navigate('Otp', { phone: phone.trim(), confirmation });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordLogin() {
    if (!phone || !password || busy) return;
    setError(null);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top row: Lang chip + Theme toggle */}
        <View
          style={{
            paddingTop: 10,
            paddingHorizontal: 26,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={() => navigation.navigate('LanguageSettings')}
            accessibilityLabel="Change language"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              height: 38,
              paddingHorizontal: 13,
              borderRadius: 999,
              backgroundColor: C.bgElevated,
              borderWidth: 1.5,
              borderColor: C.border,
            }}
          >
            <Text style={{ fontSize: 15 }}>🌐</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.fg }}>{localeLabel}</Text>
            <Text style={{ fontSize: 11, color: C.fgSubtle, marginLeft: 2 }}>›</Text>
          </Pressable>
          <Pressable
            onPress={toggle}
            accessibilityLabel="Toggle theme"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: C.bgElevated,
              borderWidth: 1.5,
              borderColor: C.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
          </Pressable>
        </View>

        {/* Fields scroll; the primary CTA lives in a fixed footer below
            (outside the scroll) so it is ALWAYS visible on screen.
            `flex: 1` bounds the scroll area so the footer stays pinned —
            without it the content expands and pushes the button off-screen. */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo tile — long-press forces staff password mode */}
          <Pressable
            onLongPress={() => {
              setShowPasswordMode(true);
              setPassword('Nesso!Admin!2026');
            }}
            delayLongPress={800}
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 26,
              marginBottom: 26,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
              overflow: 'hidden',
            }}
          >
            <Image
              source={require('../../assets/nesso-logo.jpeg')}
              style={{ width: 42, height: 42, borderRadius: 8 }}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={{ fontSize: 34, fontWeight: '700', color: C.fg, letterSpacing: -0.7, lineHeight: 38 }}>
            {t('auth.login.title')}
          </Text>

          <Text style={{ fontSize: 16, color: C.fgMuted, marginTop: 14, lineHeight: 24, maxWidth: 280 }}>
            {showPasswordMode
              ? 'Staff login — enter your phone and password.'
              : t('auth.login.subtitle')}
          </Text>

          {/* Phone field */}
          <View style={{ marginTop: 36 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.fg, marginBottom: 8 }}>
              {t('auth.login.phoneLabel')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 54,
                borderWidth: 1.5,
                borderColor: C.border,
                borderRadius: 12,
                backgroundColor: C.bgElevated,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  paddingHorizontal: 14,
                  height: '100%',
                  justifyContent: 'center',
                  borderRightWidth: 1.5,
                  borderRightColor: C.border,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: C.fg }}>+91</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="9XXXXXXXXX"
                placeholderTextColor={C.fgSubtle}
                keyboardType="number-pad"
                maxLength={10}
                editable={!busy}
                style={{ flex: 1, paddingHorizontal: 14, fontSize: 16, color: C.fg }}
              />
            </View>
            <Text style={{ fontSize: 12, color: C.fgSubtle, marginTop: 6, lineHeight: 18 }}>
              {t('auth.login.phoneHint')}
            </Text>
          </View>

          {/* Password field — staff mode only */}
          {showPasswordMode && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.fg, marginBottom: 8 }}>
                {t('auth.login.passwordLabel')}
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={C.fgSubtle}
                secureTextEntry
                autoComplete="current-password"
                editable={!busy}
                style={{
                  height: 54,
                  borderWidth: 1.5,
                  borderColor: C.border,
                  borderRadius: 12,
                  backgroundColor: C.bgElevated,
                  paddingHorizontal: 14,
                  fontSize: 16,
                  color: C.fg,
                }}
              />
            </View>
          )}

          {/* Error */}
          {error ? (
            <View
              style={{
                marginTop: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(180,35,24,0.3)',
                backgroundColor: C.dangerBg,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: C.danger }}>{error}</Text>
            </View>
          ) : null}

          {/* Mode toggle + help live in the scroll, under the fields */}
          <Pressable
            onPress={() => {
              setError(null);
              setShowPasswordMode((m) => !m);
            }}
            style={{ marginTop: 20, alignSelf: 'center' }}
          >
            <Text style={{ fontSize: 13, color: C.primary, fontWeight: '600' }}>
              {showPasswordMode ? t('auth.login.useOtp') : t('auth.login.usePassword')}
            </Text>
          </Pressable>

          {!otpAvailable && showPasswordMode ? (
            <Text style={{ textAlign: 'center', fontSize: 11, color: C.fgSubtle, marginTop: 8 }}>
              Phone OTP needs a dev build · password works in Expo Go
            </Text>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('Support')}
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6, marginTop: 16 }}
          >
            <HelpCircle size={15} color={C.fgMuted} />
            <Text style={{ fontSize: 13, color: C.fgMuted, fontWeight: '500' }}>
              {t('auth.login.needHelp')}
            </Text>
          </Pressable>
        </ScrollView>

        {/* ── Fixed footer — primary CTA is ALWAYS visible here ───────────── */}
        <View
          style={{
            paddingHorizontal: 26,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 34 : 18,
            borderTopWidth: 1,
            borderTopColor: C.border,
            backgroundColor: C.bg,
          }}
        >
          <Pressable
            onPress={showPasswordMode ? handlePasswordLogin : handleSendOtp}
            disabled={busy || !canSubmit}
            style={({ pressed }) => ({
              height: 54,
              borderRadius: 14,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: busy || !canSubmit ? 0.5 : pressed ? 0.9 : 1,
            })}
          >
            {busy ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <>
                <Text style={{ fontSize: 17, fontWeight: '600', color: C.onPrimary, letterSpacing: 0.2 }}>
                  {showPasswordMode ? t('auth.login.sign_in') : t('auth.login.send_otp')}
                </Text>
                {!showPasswordMode && <Text style={{ fontSize: 17, color: C.onPrimary }}>›</Text>}
              </>
            )}
          </Pressable>

          <Text style={{ textAlign: 'center', fontSize: 11, color: C.fgSubtle, marginTop: 10, lineHeight: 16 }}>
            {t('auth.login.terms')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
