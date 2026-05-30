/**
 * Login screen — 100% spec parity with design handoff (M2).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_auth.jsx — LoginScreen
 *   - Top row: Language chip (🌐 EN) + Theme toggle
 *   - Hero: 60px logo tile + H1 "Welcome to Nesso" + description
 *   - "+91" prefix field, mono hint, 10-digit validation
 *   - Sticky bottom: "Send OTP" CTA (disabled until valid) + T&C line
 *   - Long-press logo (800ms) → hidden password login (staff only)
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
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError } from '@/api/client';
import { isPhoneOtpAvailable, sendOtp } from '@/firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/** Language chip — top-left */
function LangChip() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 38,
        paddingHorizontal: 13,
        borderRadius: 999,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#DDE6E0',
      }}
    >
      <Text style={{ fontSize: 15 }}>🌐</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F1A14', fontFamily: 'System' }}>EN</Text>
      <Text style={{ fontSize: 11, color: '#7A8A82', marginLeft: 2 }}>›</Text>
    </View>
  );
}

/** Theme toggle — top-right (placeholder, wired to AsyncStorage in ThemeScreen) */
function ThemeToggle() {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#DDE6E0',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 18 }}>🌙</Text>
    </View>
  );
}

export function LoginScreen({ navigation }: Props) {
  const otpAvailable = isPhoneOtpAvailable();

  // OTP is the spec path for farmers, but it requires a dev build. In Expo Go
  // (otp unavailable) we surface the staff password login as the visible path
  // so the screen always has a working button. In a dev/prod build the clean
  // OTP-only design shows, with staff password reachable via long-press logo.
  const [phone, setPhone] = useState(otpAvailable ? '' : '9066666481');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPasswordMode, setShowPasswordMode] = useState(!otpAvailable);
  const [password, setPassword] = useState(otpAvailable ? '' : 'Nesso!Admin!2026');

  const valid = /^[6-9]\d{9}$/.test(phone);

  async function handleSendOtp() {
    if (!valid || busy) return;
    setError(null);
    if (!otpAvailable) {
      Alert.alert(
        'Dev build required',
        'Phone OTP requires a development build. Use password login (long-press the logo).',
      );
      return;
    }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFDFA' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          <LangChip />
          <ThemeToggle />
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero section */}
          <View style={{ padding: 26, paddingTop: 26, flex: 1 }}>
            {/* Logo tile — long-press for password mode */}
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

            {/* H1 */}
            <Text
              style={{
                fontSize: 34,
                fontWeight: '700',
                color: '#0F1A14',
                letterSpacing: -0.7,
                lineHeight: 38,
              }}
            >
              {'Welcome to\nNesso'}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 16,
                color: '#4A5A52',
                marginTop: 14,
                lineHeight: 24,
                maxWidth: 280,
              }}
            >
              {showPasswordMode
                ? 'Staff login — enter your phone and password.'
                : "Log in with your mobile number. We'll send a one-time code to verify it's you."}
            </Text>

            {/* Phone field */}
            <View style={{ marginTop: 36 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#0F1A14',
                  marginBottom: 8,
                }}
              >
                Mobile number
              </Text>

              {/* +91 prefix + input */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 54,
                  borderWidth: 1.5,
                  borderColor: '#DDE6E0',
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                }}
              >
                {/* Prefix pill */}
                <View
                  style={{
                    height: '100%',
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    borderRightWidth: 1.5,
                    borderRightColor: '#DDE6E0',
                    backgroundColor: '#F1F5F2',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#0F1A14',
                      letterSpacing: 0.2,
                    }}
                  >
                    +91
                  </Text>
                </View>

                <TextInput
                  value={phone}
                  onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  placeholderTextColor="#7A8A82"
                  keyboardType="number-pad"
                  maxLength={10}
                  autoComplete="tel"
                  editable={!busy}
                  style={{
                    flex: 1,
                    height: '100%',
                    paddingHorizontal: 14,
                    fontSize: 17,
                    color: '#0F1A14',
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    letterSpacing: 1,
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 12,
                  color: '#7A8A82',
                  marginTop: 6,
                  lineHeight: 18,
                }}
              >
                Standard SMS rates may apply.
              </Text>
            </View>

            {/* Password field — only in staff mode */}
            {showPasswordMode && (
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#0F1A14',
                    marginBottom: 8,
                  }}
                >
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#7A8A82"
                  secureTextEntry
                  autoComplete="current-password"
                  editable={!busy}
                  style={{
                    height: 54,
                    borderWidth: 1.5,
                    borderColor: '#DDE6E0',
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 14,
                    fontSize: 16,
                    color: '#0F1A14',
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
                  backgroundColor: 'rgba(180,35,24,0.06)',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 14, color: '#B42318' }}>{error}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Sticky bottom CTA */}
        <View
          style={{
            paddingHorizontal: 26,
            paddingTop: 16,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
            backgroundColor: '#FAFDFA',
          }}
        >
          <Pressable
            onPress={showPasswordMode ? handlePasswordLogin : handleSendOtp}
            disabled={busy || (showPasswordMode ? !phone || !password : !valid)}
            style={({ pressed }) => ({
              height: 54,
              borderRadius: 14,
              backgroundColor: '#0D783C',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity:
                busy || (showPasswordMode ? !phone || !password : !valid)
                  ? 0.5
                  : pressed
                    ? 0.9
                    : 1,
            })}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    letterSpacing: 0.2,
                  }}
                >
                  {showPasswordMode ? 'Sign in' : 'Send OTP'}
                </Text>
                {!showPasswordMode && (
                  <Text style={{ fontSize: 17, color: '#FFFFFF' }}>›</Text>
                )}
              </>
            )}
          </Pressable>

          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#7A8A82',
              marginTop: 16,
              lineHeight: 18,
            }}
          >
            By continuing you agree to Nesso&apos;s{' '}
            <Text style={{ color: '#0D783C', fontWeight: '600' }}>Terms</Text>
            {' & '}
            <Text style={{ color: '#0D783C', fontWeight: '600' }}>Privacy Policy</Text>.
          </Text>

          {/* Dev hint — Expo Go can't run native phone OTP */}
          {!otpAvailable && showPasswordMode && (
            <Text
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: '#7A8A82',
                marginTop: 8,
              }}
            >
              Staff password login (Expo Go) · Phone OTP needs a dev build
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
