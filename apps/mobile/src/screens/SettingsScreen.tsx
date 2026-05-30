import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronRight,
  Globe,
  Moon,
  RefreshCw,
  Bell,
  Info,
  Tag,
  LogOut,
} from 'lucide-react-native';
import { api, type MeResponse } from '@/api/client';
import type { RootStackParamList } from '../../App';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<RootNav>();
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => null);
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign out?', 'You will be returned to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await api.logout();
          navigation.replace('Login');
        },
      },
    ]);
  }, [navigation]);

  const displayName = [me?.firstName, me?.lastName].filter(Boolean).join(' ') || 'Agent';
  const initials =
    ((me?.firstName?.[0] ?? '').toUpperCase() + (me?.lastName?.[0] ?? '').toUpperCase()).trim() ||
    'A';

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="border-b border-border bg-bg-elevated px-6 py-4">
        <Text className="font-display text-2xl text-fg tracking-tight">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ---------------------------------------------------------------- */}
        {/* Account section                                                    */}
        {/* ---------------------------------------------------------------- */}
        <SectionHeader label="Account" />
        <View className="bg-bg-elevated">
          {/* Avatar + name row */}
          <View className="flex-row items-center border-b border-border px-4 py-4">
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(13,120,60,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ color: '#0D783C', fontWeight: '700', fontSize: 16 }}>{initials}</Text>
            </View>
            <View className="flex-1 min-w-0">
              <Text className="font-medium text-fg" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="mt-0.5 text-sm text-fg-subtle" numberOfLines={1}>
                {me?.phone ?? ''}
              </Text>
            </View>
          </View>

          {/* Edit profile */}
          <SettingsRow
            icon={null}
            label="Edit profile"
            onPress={() => {
              /* navigate to edit profile — coming soon */
            }}
            showChevron
          />
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* App section                                                        */}
        {/* ---------------------------------------------------------------- */}
        <SectionHeader label="App" />
        <View className="bg-bg-elevated">
          <SettingsRow
            icon={<Globe size={18} color="#7A8A82" />}
            label="Language"
            value="English"
            onPress={() => navigation.navigate('LanguageSettings')}
            showChevron
          />
          <SettingsRow
            icon={<Moon size={18} color="#7A8A82" />}
            label="Theme"
            value="System"
            onPress={() => navigation.navigate('ThemeSettings')}
            showChevron
          />
          <SettingsRow
            icon={<RefreshCw size={18} color="#7A8A82" />}
            label="Sync Health"
            value="View status"
            onPress={() => {
              /* navigate to SyncScreen — coming soon */
            }}
            showChevron
          />
          <SettingsRow
            icon={<Bell size={18} color="#7A8A82" />}
            label="Notifications"
            onPress={() => {
              /* coming soon */
            }}
            showChevron
          />
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Info section                                                       */}
        {/* ---------------------------------------------------------------- */}
        <SectionHeader label="Info" />
        <View className="bg-bg-elevated">
          <SettingsRow
            icon={<Info size={18} color="#7A8A82" />}
            label="About Nesso"
            onPress={() => navigation.navigate('About')}
            showChevron
          />
          <SettingsRow
            icon={<Tag size={18} color="#7A8A82" />}
            label="Version"
            value="0.0.1 (dev)"
            onPress={() => {}}
            showChevron={false}
          />
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Danger section                                                     */}
        {/* ---------------------------------------------------------------- */}
        <SectionHeader label="Account actions" />
        <View className="bg-bg-elevated">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center border-b border-border px-4 py-4"
          >
            <View className="mr-3">
              <LogOut size={18} color="#EF4444" />
            </View>
            <Text className="flex-1 text-base font-medium text-danger">Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <View className="px-4 pb-1 pt-5">
      <Text className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{label}</Text>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-border bg-bg-elevated px-4 py-4"
    >
      {icon ? <View className="mr-3">{icon}</View> : <View className="mr-3 w-[18px]" />}
      <Text className="flex-1 text-base text-fg">{label}</Text>
      {value ? <Text className="mr-2 text-sm text-fg-subtle">{value}</Text> : null}
      {showChevron ? <ChevronRight size={16} color="#7A8A82" /> : null}
    </Pressable>
  );
}
