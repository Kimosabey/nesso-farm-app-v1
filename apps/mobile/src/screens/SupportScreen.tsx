/**
 * Help & Support — a real in-app help screen (replaces the old "coming soon"
 * alert). Themed via `useTheme().c`.
 *
 *   - Back header "Help & Support"
 *   - Hero line "We're here to help."
 *   - FAQ accordion (tap to expand/collapse)
 *   - Contact tiles that open mail / dialer / WhatsApp via Linking
 *   - Footer "Nesso v1.0.0 · NR Group"
 */
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme, type ThemeTokens } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Support'>;

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I register a farmer?',
    a: 'Open the Register tab, tap "New farmer", then capture their name, phone, and ID. You can add farms and crops afterwards from the farmer\'s profile. Everything saves locally first and syncs when you\'re back online.',
  },
  {
    q: "Why can't I log in?",
    a: "Make sure you entered your 10-digit mobile number correctly and have network for the OTP SMS. Staff can switch to password sign-in from the login screen. If the code never arrives, wait a minute and tap Resend, or contact us below.",
  },
  {
    q: 'How does offline sync work?',
    a: "Nesso works fully offline — new records are queued on your device and a sync runs automatically once you regain a connection. You can also trigger a manual sync from the Sync screen. The status chip shows Offline, Syncing, or Synced.",
  },
  {
    q: 'How do I map a farm boundary?',
    a: 'From a farm\'s details, tap "Map boundary" and walk the perimeter, or drop pins on the map. You can capture GPS points even with no signal — the boundary uploads on the next sync.',
  },
];

export function SupportScreen({ navigation }: Props) {
  const C = useTheme().c;
  const [open, setOpen] = useState<number | null>(0);

  const openUrl = (url: string) => {
    void Linking.openURL(url).catch(() => {});
  };

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
          Help & Support
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 22, paddingBottom: 32 }}>
        {/* Hero */}
        <Text style={{ fontSize: 26, fontWeight: '700', color: C.fg, letterSpacing: -0.4 }}>
          We&apos;re here to help.
        </Text>
        <Text style={{ fontSize: 15, color: C.fgMuted, marginTop: 8, lineHeight: 22 }}>
          Browse the common questions below, or reach our team directly.
        </Text>

        {/* FAQ */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: C.fgSubtle,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            marginTop: 28,
            marginBottom: 10,
          }}
        >
          Frequently asked
        </Text>
        <View
          style={{
            backgroundColor: C.bgElevated,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.border,
            overflow: 'hidden',
          }}
        >
          {FAQS.map((item, i) => {
            const expanded = open === i;
            return (
              <View
                key={item.q}
                style={{
                  borderBottomWidth: i === FAQS.length - 1 ? 0 : 1,
                  borderBottomColor: C.border,
                }}
              >
                <Pressable
                  onPress={() => setOpen(expanded ? null : i)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 15,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: C.fg }}>
                    {item.q}
                  </Text>
                  {expanded ? (
                    <ChevronDown size={18} color={C.fgSubtle} />
                  ) : (
                    <ChevronRight size={18} color={C.fgSubtle} />
                  )}
                </Pressable>
                {expanded ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: C.fgMuted,
                      lineHeight: 21,
                      paddingHorizontal: 16,
                      paddingBottom: 16,
                    }}
                  >
                    {item.a}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Contact */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: C.fgSubtle,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            marginTop: 28,
            marginBottom: 10,
          }}
        >
          Contact us
        </Text>
        <View
          style={{
            backgroundColor: C.bgElevated,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.border,
            overflow: 'hidden',
          }}
        >
          <ContactRow
            c={C}
            icon={<Mail size={18} color={C.primary} />}
            tint="rgba(13,120,60,0.14)"
            label="Email us"
            value="help@nesso.in"
            onPress={() => openUrl('mailto:help@nesso.in')}
          />
          <ContactRow
            c={C}
            icon={<Phone size={18} color={C.info} />}
            tint="rgba(14,116,144,0.14)"
            label="Call support"
            value="+91 80000 00000"
            onPress={() => openUrl('tel:+918000000000')}
          />
          <ContactRow
            c={C}
            icon={<MessageCircle size={18} color={C.secondaryD} />}
            tint="rgba(60,107,81,0.14)"
            label="WhatsApp"
            value="Chat with us"
            onPress={() => openUrl('https://wa.me/918000000000')}
            last
          />
        </View>

        {/* Footer */}
        <Text style={{ textAlign: 'center', fontSize: 12, color: C.fgSubtle, marginTop: 26 }}>
          Nesso v1.0.0 · NR Group
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  c: C,
  icon,
  tint,
  label,
  value,
  onPress,
  last,
}: {
  c: ThemeTokens;
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
  onPress: () => void;
  last?: boolean;
}) {
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
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }}>{label}</Text>
        <Text style={{ fontSize: 13, color: C.fgMuted, marginTop: 1 }}>{value}</Text>
      </View>
      <ChevronRight size={18} color={C.fgSubtle} />
    </Pressable>
  );
}
