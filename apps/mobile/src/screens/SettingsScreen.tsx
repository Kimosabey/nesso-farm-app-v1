/**
 * Settings hub — 100% spec parity with design handoff (SettingsScreen).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_settings.jsx — SettingsScreen
 *   - PushHeader "Profile & settings"
 *   - Profile card: avatar, name, +91 phone, role pill
 *   - Group "Account": Associations, My cluster
 *   - Group "App": Language (·English), Theme & display, Notifications,
 *     Sync health (·N queued), Offline maps
 *   - Group "Support": Help & docs, About Nesso (·v1.0)
 *   - Group (danger): Log out → clearSession + reset to Login
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Users,
  Map as MapIcon,
  Globe,
  Sun,
  Bell,
  RefreshCw,
  Download,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Pencil,
} from 'lucide-react-native';
import { api, clearSession, type MeResponse } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { useTheme, type ThemeTokens } from '@/theme';
import { useT } from '@/i18n';
import { useToast } from '@/components/Toast';

// Local nav param list — these routes are registered by the parent navigator
// (some, e.g. Sync / OfflineMaps / LocationPicker, may be wired later). Declared
// here so navigation typechecks without editing App.tsx / MainTabs.tsx.
type SettingsParamList = {
  Login: undefined;
  LanguageSettings: undefined;
  ThemeSettings: undefined;
  Notifications: undefined;
  About: undefined;
  Sync: undefined;
  OfflineMaps: undefined;
};
type Nav = NativeStackNavigationProp<SettingsParamList>;

function tint(c: ThemeTokens, hex: string): string {
  // Light fill behind an icon (approximation of color-mix 14%).
  if (hex === c.primary) return 'rgba(13,120,60,0.14)';
  if (hex === c.secondaryD) return 'rgba(60,107,81,0.14)';
  if (hex === c.info) return 'rgba(14,116,144,0.14)';
  if (hex === c.warning) return 'rgba(154,132,7,0.14)';
  return 'rgba(13,120,60,0.14)';
}

function roleLabel(role?: string): string {
  if (!role) return 'Field Officer';
  return role
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SettingsScreen() {
  const C = useTheme().c;
  const { t } = useT();
  const toast = useToast();
  const navigation = useNavigation<Nav>();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => null);
  }, []);

  useEffect(() => {
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setStatus(e.status);
    });
    return unsub;
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Log out?', 'You will be returned to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
          );
        },
      },
    ]);
  }, [navigation]);

  const displayName = [me?.firstName, me?.lastName].filter(Boolean).join(' ') || 'Field Officer';
  const initials =
    ((me?.firstName?.[0] ?? '').toUpperCase() + (me?.lastName?.[0] ?? '').toUpperCase()).trim() ||
    'FO';
  const phone = me?.phone ?? '+91 ••••• ••••';
  const queued = status ? status.pending + status.failed : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: C.fg, letterSpacing: -0.6 }}>
          Profile & settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }}>
        {/* Profile card */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            backgroundColor: C.bgElevated,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.border,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(13,120,60,0.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: C.primary, fontWeight: '700', fontSize: 20 }}>{initials}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg }} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={{ fontSize: 13, color: C.fgMuted, marginTop: 1 }} numberOfLines={1}>
              {phone}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              <View
                style={{
                  backgroundColor: 'rgba(60,107,81,0.14)',
                  borderRadius: 999,
                  paddingHorizontal: 9,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondaryD }}>
                  {roleLabel(me?.role)}
                </Text>
              </View>
            </View>
          </View>
          <Pencil size={19} color={C.fgSubtle} />
        </View>

        {/* Account */}
        <Group title={t('settings.account')}>
          <Row
            icon={<Users size={18} color={C.primary} />}
            tintColor={C.primary}
            label="Associations"
            value="Belur FPO"
            onPress={() => toast.info('Associations — coming soon')}
          />
          <Row
            icon={<MapIcon size={18} color={C.secondaryD} />}
            tintColor={C.secondaryD}
            label="My cluster"
            value="Hassan"
            onPress={() => toast.info('Hassan cluster')}
            last
          />
        </Group>

        {/* App */}
        <Group title={t('settings.app')}>
          <Row
            icon={<Globe size={18} color={C.info} />}
            tintColor={C.info}
            label={t('settings.language')}
            value="English"
            onPress={() => navigation.navigate('LanguageSettings')}
          />
          <Row
            icon={<Sun size={18} color={C.warning} />}
            tintColor={C.warning}
            label={t('settings.theme')}
            onPress={() => navigation.navigate('ThemeSettings')}
          />
          <Row
            icon={<Bell size={18} color={C.primary} />}
            tintColor={C.primary}
            label={t('settings.notifications')}
            onPress={() => navigation.navigate('Notifications')}
          />
          <Row
            icon={<RefreshCw size={18} color={C.secondaryD} />}
            tintColor={C.secondaryD}
            label={t('settings.syncHealth')}
            value={`${queued} queued`}
            onPress={() => navigation.navigate('Sync')}
          />
          <Row
            icon={<Download size={18} color={C.info} />}
            tintColor={C.info}
            label={t('settings.offlineMaps')}
            onPress={() => navigation.navigate('OfflineMaps')}
            last
          />
        </Group>

        {/* Support */}
        <Group title={t('settings.support')}>
          <Row
            icon={<HelpCircle size={18} color={C.secondaryD} />}
            tintColor={C.secondaryD}
            label={t('settings.help')}
            onPress={() => toast.info('Opening help & docs')}
          />
          <Row
            icon={<Shield size={18} color={C.primary} />}
            tintColor={C.primary}
            label={t('settings.about')}
            value="v1.0"
            onPress={() => navigation.navigate('About')}
            last
          />
        </Group>

        {/* Log out */}
        <Group>
          <Row
            icon={<LogOut size={18} color={C.danger} />}
            tintColor={C.danger}
            danger
            label={t('settings.logout')}
            onPress={handleLogout}
            last
          />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  const C = useTheme().c;
  return (
    <View style={{ marginBottom: 18 }}>
      {title ? (
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: '700',
            letterSpacing: 1,
            color: C.fgSubtle,
            textTransform: 'uppercase',
            paddingHorizontal: 4,
            paddingBottom: 8,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: C.bgElevated,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: C.border,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  tintColor,
  label,
  value,
  onPress,
  last,
  danger,
}: {
  icon: React.ReactNode;
  tintColor: string;
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
  danger?: boolean;
}) {
  const C = useTheme().c;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger ? C.dangerBg : tint(C, tintColor),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text
        style={{ flex: 1, fontSize: 15, fontWeight: '600', color: danger ? C.danger : C.fg }}
      >
        {label}
      </Text>
      {value ? <Text style={{ fontSize: 14, color: C.fgMuted }}>{value}</Text> : null}
      {danger ? null : <ChevronRight size={18} color={C.fgSubtle} />}
    </Pressable>
  );
}
