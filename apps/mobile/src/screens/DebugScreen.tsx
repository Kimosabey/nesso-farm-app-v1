import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isPhoneOtpAvailable } from '@/firebase/auth';

type Stack = { Splash: undefined; Login: undefined; Main: undefined; Debug: undefined };
type Props = NativeStackScreenProps<Stack, 'Debug'>;

export function DebugScreen({ navigation }: Props) {
  const [log, setLog] = useState<string[]>([]);

  function push(line: string) {
    setLog((prev) => [`${new Date().toISOString().slice(11, 19)}  ${line}`, ...prev].slice(0, 30));
  }

  function captureMessage() {
    const id = Sentry.captureMessage(`Sentry mobile message — ${new Date().toISOString()}`, 'info');
    push(`captureMessage → eventId ${id ?? '(no DSN?)'}`);
  }

  function captureException() {
    const id = Sentry.captureException(new Error(`Sentry mobile error — ${new Date().toISOString()}`));
    push(`captureException → eventId ${id ?? '(no DSN?)'}`);
  }

  function uncaught() {
    push('throwing on next tick…');
    setTimeout(() => {
      throw new Error(`Sentry mobile uncaught — ${new Date().toISOString()}`);
    }, 0);
  }

  function checkFirebase() {
    const ok = isPhoneOtpAvailable();
    push(ok ? 'Firebase native module: AVAILABLE (dev build)' : 'Firebase native module: NOT available (Expo Go)');
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="p-6">
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-2xl text-fg">Debug</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text className="text-primary">Back</Text>
          </Pressable>
        </View>
        <Text className="mt-1 text-xs text-fg-subtle">Sentry + Firebase probes</Text>

        <View className="mt-6 gap-3">
          <Btn label="Sentry · captureMessage" onPress={captureMessage} tone="primary" />
          <Btn label="Sentry · captureException" onPress={captureException} tone="warn" />
          <Btn label="Sentry · uncaught throw" onPress={uncaught} tone="danger" />
          <Btn label="Firebase · check native module" onPress={checkFirebase} tone="primary" />
        </View>

        <Text className="mt-6 mb-2 text-xs uppercase tracking-wider text-fg-subtle">Log</Text>
        <View className="rounded-md border border-border bg-bg-elevated p-3">
          {log.length === 0 ? (
            <Text className="text-xs text-fg-subtle">No events yet</Text>
          ) : (
            log.map((line, i) => (
              <Text key={i} className="font-mono text-xs text-fg-muted">
                {line}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Btn({
  label,
  onPress,
  tone,
}: {
  label: string;
  onPress: () => void;
  tone: 'primary' | 'warn' | 'danger';
}) {
  const bg = tone === 'primary' ? 'bg-primary' : tone === 'warn' ? 'bg-amber-600' : 'bg-red-700';
  return (
    <Pressable
      onPress={onPress}
      className={`h-12 items-center justify-center rounded-md ${bg} active:opacity-90`}
    >
      <Text className="text-base font-medium text-white">{label}</Text>
    </Pressable>
  );
}
