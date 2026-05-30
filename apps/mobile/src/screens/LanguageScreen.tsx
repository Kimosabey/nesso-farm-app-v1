/**
 * Language picker — 12 languages, themed, live-switching.
 *
 * Selecting a language calls i18n `setLocale(code)`, which persists to
 * AsyncStorage `@nesso/language` and re-renders every `useT()` consumer, so the
 * app language changes immediately (no Alert, no restart). The active row shows a
 * primary ring + Check.
 */
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Check } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSettings'>;

export function LanguageScreen({ navigation }: Props) {
  const C = useTheme().c;
  const { locale, setLocale, languages } = useT();

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
          Language
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {languages.map((lang) => {
          const active = locale === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => setLocale(lang.code)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                marginBottom: 10,
                borderRadius: 14,
                backgroundColor: active ? C.primary50 : C.bgElevated,
                borderWidth: active ? 2 : 1,
                borderColor: active ? C.primary : C.border,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: C.fg,
                    textAlign: lang.code === 'ur' ? 'right' : 'left',
                  }}
                >
                  {lang.native}
                </Text>
                <Text style={{ fontSize: 13, color: C.fgSubtle, marginTop: 2 }}>{lang.name}</Text>
              </View>
              {active ? <Check size={20} color={C.primary} /> : <View style={{ width: 20 }} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
