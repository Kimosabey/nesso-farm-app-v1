/**
 * About — 100% spec parity with design handoff (AboutScreen).
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_settings.jsx — AboutScreen
 *   - PushHeader "About"
 *   - Centered logo tile, "NESSO", tagline "Farm to fork, verified"
 *   - Mono version line: v1.0.0 · build · NR Group
 *   - Links card: Privacy policy, Terms of service, Contact support (·email),
 *     Open-source licenses
 *   - Footer: © NR Group
 */
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Shield, FileText, Phone, ScrollText, ChevronRight } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme, type ThemeTokens } from '@/theme';
import { useToast } from '@/components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

function tint(c: ThemeTokens, hex: string): string {
  if (hex === c.primary) return 'rgba(13,120,60,0.14)';
  if (hex === c.secondaryD) return 'rgba(60,107,81,0.14)';
  if (hex === c.info) return 'rgba(14,116,144,0.14)';
  if (hex === c.warning) return 'rgba(154,132,7,0.14)';
  return 'rgba(13,120,60,0.14)';
}

export function AboutScreen({ navigation }: Props) {
  const C = useTheme().c;
  const toast = useToast();
  const comingSoon = (what: string) => toast.info(`${what} — coming soon`);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: C.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: C.bgElevated,
            borderWidth: 1.5,
            borderColor: C.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={22} color={C.fg} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.fg, letterSpacing: -0.2 }}>
          About
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 30,
          paddingBottom: 28,
          alignItems: 'center',
        }}
      >
        {/* Logo tile */}
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <Image
            source={require('../../assets/nesso-logo.jpeg')}
            style={{ width: 60, height: 60, borderRadius: 12 }}
            resizeMode="contain"
          />
        </View>

        <Text
          style={{ fontSize: 24, fontWeight: '700', color: C.fg, marginTop: 18, letterSpacing: 1 }}
        >
          NESSO
        </Text>
        <Text style={{ fontSize: 14, color: C.fgMuted, marginTop: 4 }}>Farm to fork, verified</Text>
        <Text
          style={{ fontSize: 12.5, color: C.fgSubtle, marginTop: 12, fontFamily: 'monospace' }}
        >
          v1.0.0 · build 2026.05.29 · NR Group
        </Text>

        {/* Links */}
        <View
          style={{
            width: '100%',
            marginTop: 28,
            backgroundColor: C.bgElevated,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.border,
            overflow: 'hidden',
          }}
        >
          <LinkRow
            icon={<Shield size={18} color={C.primary} />}
            tintColor={C.primary}
            label="Privacy policy"
            onPress={() => comingSoon('Privacy policy')}
          />
          <LinkRow
            icon={<FileText size={18} color={C.info} />}
            tintColor={C.info}
            label="Terms of service"
            onPress={() => comingSoon('Terms of service')}
          />
          <LinkRow
            icon={<Phone size={18} color={C.secondaryD} />}
            tintColor={C.secondaryD}
            label="Contact support"
            value="help@nesso.in"
            onPress={() => comingSoon('Contact support')}
          />
          <LinkRow
            icon={<ScrollText size={18} color={C.warning} />}
            tintColor={C.warning}
            label="Open-source licenses"
            onPress={() => comingSoon('Open-source licenses')}
            last
          />
        </View>

        <Text style={{ fontSize: 12, color: C.fgSubtle, marginTop: 24, textAlign: 'center' }}>
          © 2026 NR Group · Made for Indian horticulture
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinkRow({
  icon,
  tintColor,
  label,
  value,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  tintColor: string;
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
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
          backgroundColor: tint(C, tintColor),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: C.fg }}>{label}</Text>
      {value ? <Text style={{ fontSize: 14, color: C.fgMuted }}>{value}</Text> : null}
      <ChevronRight size={18} color={C.fgSubtle} />
    </Pressable>
  );
}
