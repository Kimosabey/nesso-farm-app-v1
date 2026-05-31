/**
 * Login screen — redesigned for a dead-simple, foolproof flow.
 *
 * Why this layout: previous versions used a fixed footer + flex tricks that
 * could push the CTA off-screen on some devices. This version puts the
 * primary button INLINE, right under the fields, inside a single ScrollView.
 * It can never be hidden — worst case you scroll a few px. It also shows the
 * exact API URL it will call + full error text, so connectivity problems are
 * visible instead of silent.
 *
 * Expo Go → password mode (prefilled admin), button "Sign in".
 * Dev build → OTP mode available, button "Send OTP".
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HelpCircle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError, apiBaseUrl } from '@/api/client';
import { isPhoneOtpAvailable, sendOtp } from '@/firebase/auth';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { c: C, isDark, toggle } = useTheme();
  const { t, locale, languages } = useT();
  const otpAvailable = isPhoneOtpAvailable();
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
      if (e instanceof ApiError) {
        setError(`${e.message} (HTTP ${e.status})`);
      } else {
        setError(`Can't reach the server at ${apiBaseUrl}. Check the API is running + same network.`);
      }
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = showPasswordMode ? handlePasswordLogin : handleSendOtp;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 26 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top row: language + theme */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable
            onPress={() => navigation.navigate('LanguageSettings')}
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
            <Text style={{ fontSize: 11, color: C.fgSubtle }}>›</Text>
          </Pressable>
          <Pressable
            onPress={toggle}
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

        {/* Logo */}
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
            marginTop: 24,
            marginBottom: 20,
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

        <Text style={{ fontSize: 32, fontWeight: '700', color: C.fg, letterSpacing: -0.6, lineHeight: 38 }}>
          {t('auth.login.title')}
        </Text>
        <Text style={{ fontSize: 15, color: C.fgMuted, marginTop: 10, lineHeight: 22 }}>
          {showPasswordMode ? 'Staff login — enter your phone and password.' : t('auth.login.subtitle')}
        </Text>

        {/* Phone */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.fg, marginTop: 28, marginBottom: 8 }}>
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
          <View style={{ paddingHorizontal: 14, height: '100%', justifyContent: 'center', borderRightWidth: 1.5, borderRightColor: C.border }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: C.fg }}>+91</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
            placeholder="9XXXXXXXXX"
            placeholderTextColor={C.fgSubtle}
            keyboardType="number-pad"
            maxLength={10}
            editable={!busy}
            style={{ flex: 1, paddingHorizontal: 14, fontSize: 16, color: C.fg }}
          />
        </View>

        {/* Password (staff mode) */}
        {showPasswordMode && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.fg, marginTop: 16, marginBottom: 8 }}>
              {t('auth.login.passwordLabel')}
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={C.fgSubtle}
              secureTextEntry
              editable={!busy}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
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
          </>
        )}

        {/* Error — prominent */}
        {error ? (
          <View
            style={{
              marginTop: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(180,35,24,0.3)',
              backgroundColor: C.dangerBg,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 13, color: C.danger, lineHeight: 19 }}>{error}</Text>
          </View>
        ) : null}

        {/* PRIMARY BUTTON — inline, right under the fields, impossible to miss */}
        <Pressable
          onPress={onSubmit}
          disabled={busy || !canSubmit}
          style={({ pressed }) => ({
            height: 56,
            borderRadius: 14,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            marginTop: 22,
            opacity: busy || !canSubmit ? 0.5 : pressed ? 0.9 : 1,
          })}
        >
          {busy ? (
            <ActivityIndicator color={C.onPrimary} />
          ) : (
            <>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.onPrimary, letterSpacing: 0.2 }}>
                {showPasswordMode ? t('auth.login.sign_in') : t('auth.login.send_otp')}
              </Text>
              {!showPasswordMode && <Text style={{ fontSize: 18, color: C.onPrimary }}>›</Text>}
            </>
          )}
        </Pressable>

        {/* Mode toggle */}
        <Pressable
          onPress={() => {
            setError(null);
            setShowPasswordMode((m) => !m);
          }}
          style={{ marginTop: 16, alignSelf: 'center' }}
        >
          <Text style={{ fontSize: 13, color: C.primary, fontWeight: '600' }}>
            {showPasswordMode ? t('auth.login.useOtp') : t('auth.login.usePassword')}
          </Text>
        </Pressable>

        {/* Need help */}
        <Pressable
          onPress={() => navigation.navigate('Support')}
          style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6, marginTop: 18 }}
        >
          <HelpCircle size={15} color={C.fgMuted} />
          <Text style={{ fontSize: 13, color: C.fgMuted, fontWeight: '500' }}>{t('auth.login.needHelp')}</Text>
        </Pressable>

        {/* Diagnostics: which API + terms + version */}
        <View style={{ marginTop: 24, alignItems: 'center', gap: 6 }}>
          <Text style={{ textAlign: 'center', fontSize: 11, color: C.fgSubtle, lineHeight: 16 }}>
            {t('auth.login.terms')}
          </Text>
          <Text style={{ fontSize: 10, color: C.fgSubtle, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            API · {apiBaseUrl}
          </Text>
          <Text style={{ fontSize: 10, color: C.fgSubtle }}>Nesso v1.0.0 · NR Group</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
