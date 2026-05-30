import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSettings'>;

const STORAGE_KEY = '@nesso/language';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
];

export function LanguageScreen({ navigation }: Props) {
  const [selected, setSelected] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val) setSelected(val);
      })
      .catch(() => null);
  }, []);

  const handleSelect = useCallback(
    async (code: string) => {
      setSelected(code);
      await AsyncStorage.setItem(STORAGE_KEY, code);
      Alert.alert('Language updated', '', [{ text: 'OK' }]);
    },
    [],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border bg-bg-elevated px-4 py-4">
        <Pressable onPress={() => navigation.goBack()} className="mr-3 p-1">
          <ChevronLeft size={24} color="#0D783C" />
        </Pressable>
        <Text className="font-display text-xl text-fg">Language</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {LANGUAGES.map((lang) => {
          const active = selected === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => handleSelect(lang.code)}
              className="flex-row items-center border-b border-border bg-bg-elevated px-4 py-4"
            >
              <View className="flex-1 min-w-0">
                <Text
                  className="text-lg font-medium text-fg"
                  style={lang.code === 'ur' ? { textAlign: 'right' } : undefined}
                >
                  {lang.native}
                </Text>
                <Text className="mt-0.5 text-sm text-fg-subtle">{lang.name}</Text>
              </View>
              {active ? (
                <Check size={20} color="#0D783C" />
              ) : (
                <View style={{ width: 20 }} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
