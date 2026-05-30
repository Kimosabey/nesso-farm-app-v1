import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';

export function SettingsPlaceholderScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-4">
        <View className="items-center justify-center rounded-2xl bg-primary/10 p-6">
          <Settings size={40} color="#0D783C" />
        </View>
        <Text className="font-display text-xl text-fg">Settings coming soon</Text>
        <Text className="px-8 text-center text-sm text-fg-subtle">
          App settings and preferences are on the way.
        </Text>
      </View>
    </SafeAreaView>
  );
}
