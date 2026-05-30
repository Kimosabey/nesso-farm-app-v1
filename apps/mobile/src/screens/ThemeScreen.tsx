import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Sun, Moon, Monitor, Check } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme, type ThemeMode } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ThemeSettings'>;

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  Icon: typeof Sun;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light mode',
    Icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark mode',
    Icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device setting',
    Icon: Monitor,
  },
];

export function ThemeScreen({ navigation }: Props) {
  const { c: C, mode, setMode } = useTheme();

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
          Theme & display
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 12 }}>
        {THEME_OPTIONS.map((option) => {
          const active = mode === option.value;
          const { Icon } = option;
          return (
            <Pressable
              key={option.value}
              onPress={() => setMode(option.value)}
              style={{
                borderRadius: 14,
                padding: 16,
                borderWidth: 2,
                borderColor: active ? C.primary : C.border,
                backgroundColor: active ? C.primary50 : C.bgElevated,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: C.primary50,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={28} color={C.primary} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: C.fg }}>
                      {option.label}
                    </Text>
                    <Text style={{ fontSize: 13, color: C.fgSubtle, marginTop: 1 }}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                {active ? (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: C.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} color={C.onPrimary} />
                  </View>
                ) : (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: C.borderStrong,
                    }}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
