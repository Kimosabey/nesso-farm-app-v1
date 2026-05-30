import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Sun, Moon, Monitor, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ThemeSettings'>;

const STORAGE_KEY = '@nesso/theme';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: Array<{
  value: ThemeOption;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light mode',
    icon: <Sun size={28} color="#0D783C" />,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark mode',
    icon: <Moon size={28} color="#0D783C" />,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device setting',
    icon: <Monitor size={28} color="#0D783C" />,
  },
];

export function ThemeScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<ThemeOption>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val === 'light' || val === 'dark' || val === 'system') {
          setSelected(val);
        }
      })
      .catch(() => null);
  }, []);

  const handleSelect = useCallback(async (value: ThemeOption) => {
    setSelected(value);
    await AsyncStorage.setItem(STORAGE_KEY, value);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border bg-bg-elevated px-4 py-4">
        <Pressable onPress={() => navigation.goBack()} className="mr-3 p-1">
          <ChevronLeft size={24} color="#0D783C" />
        </Pressable>
        <Text className="font-display text-xl text-fg">Theme</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 12 }}>
        {THEME_OPTIONS.map((option) => {
          const active = selected === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={[
                {
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: active ? '#0D783C' : 'rgba(0,0,0,0.08)',
                  backgroundColor: active ? 'rgba(13,120,60,0.05)' : undefined,
                },
              ]}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: 'rgba(13,120,60,0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {option.icon}
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-fg">{option.label}</Text>
                    <Text className="mt-0.5 text-sm text-fg-subtle">{option.description}</Text>
                  </View>
                </View>
                {active ? (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#0D783C',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} color="#fff" />
                  </View>
                ) : (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: 'rgba(0,0,0,0.15)',
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
