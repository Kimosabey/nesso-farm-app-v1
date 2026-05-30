import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Code2, ExternalLink } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  const showComingSoon = () => {
    Alert.alert('Coming soon', 'This page is not available yet.', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border bg-bg-elevated px-4 py-4">
        <Pressable onPress={() => navigation.goBack()} className="mr-3 p-1">
          <ChevronLeft size={24} color="#0D783C" />
        </Pressable>
        <Text className="font-display text-xl text-fg">About</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                               */}
        {/* ---------------------------------------------------------------- */}
        <View className="items-center px-6 py-12">
          {/* Logo text */}
          <Text
            className="font-display text-primary"
            style={{ fontSize: 48, fontWeight: '800', letterSpacing: -1 }}
          >
            Nesso
          </Text>
          <Text className="mt-1 text-base text-fg-subtle">Farm-to-fork traceability platform</Text>

          {/* Version badge */}
          <View className="mt-4 rounded-full border border-border bg-bg-elevated px-4 py-1.5">
            <Text className="text-sm text-fg-subtle">
              Version 0.0.1 · Built with ❤ for NR Group
            </Text>
          </View>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Mission                                                            */}
        {/* ---------------------------------------------------------------- */}
        <View className="mx-4 rounded-2xl border border-border bg-bg-elevated p-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Our Mission
          </Text>
          <Text className="leading-6 text-fg">
            Nesso exists to bring verified, transparent traceability to every step of the farming
            journey. We empower field agents to register and manage farmers digitally, ensuring that
            every harvest can be traced from soil to shelf.
          </Text>
          <Text className="mt-3 leading-6 text-fg">
            By connecting farmers, agents, and buyers on a single platform, Nesso creates trust,
            reduces fraud, and helps smallholder farmers access fair markets with confidence.
          </Text>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Links                                                              */}
        {/* ---------------------------------------------------------------- */}
        <View className="mx-4 mt-4 rounded-2xl border border-border bg-bg-elevated">
          <Text className="border-b border-border px-5 pb-3 pt-4 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Legal
          </Text>
          <Pressable
            onPress={showComingSoon}
            className="flex-row items-center border-b border-border px-5 py-4"
          >
            <Text className="flex-1 text-base text-fg">Privacy Policy</Text>
            <ExternalLink size={16} color="#7A8A82" />
          </Pressable>
          <Pressable
            onPress={showComingSoon}
            className="flex-row items-center px-5 py-4"
          >
            <Text className="flex-1 text-base text-fg">Terms of Service</Text>
            <ExternalLink size={16} color="#7A8A82" />
          </Pressable>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Developer credit                                                   */}
        {/* ---------------------------------------------------------------- */}
        <View className="mx-4 mt-4 rounded-2xl border border-border bg-bg-elevated p-5">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Developed by
          </Text>
          <View className="flex-row items-center gap-3">
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(13,120,60,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Code2 size={20} color="#0D783C" />
            </View>
            <View>
              <Text className="font-medium text-fg">Harshan Aiyappa</Text>
              <Text className="mt-0.5 text-sm text-fg-subtle">github.com/harshanaiyappa</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
