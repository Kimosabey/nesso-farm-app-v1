/**
 * AcceptGRNScreen — scan a QR / barcode to accept a Goods Receipt Note.
 *
 * expo-barcode-scanner requires a dev build (not Expo Go).
 * We guard the import with the same isExpoGo + try/catch pattern
 * used in src/firebase/auth.ts.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, QrCode, CheckCircle } from 'lucide-react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError } from '@/api/client';

// ---------------------------------------------------------------------------
// Expo Go guard
// ---------------------------------------------------------------------------
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Lazily-loaded expo-barcode-scanner types
interface BarCodeScannerResult {
  type: string;
  data: string;
}

type BarCodeScannerModule = {
  BarCodeScanner: React.ComponentType<{
    style?: object;
    onBarCodeScanned?: (result: BarCodeScannerResult) => void;
    children?: React.ReactNode;
  }> & {
    requestPermissionsAsync: () => Promise<{ status: string }>;
  };
};

let scannerModule: BarCodeScannerModule | null = null;
function loadScanner(): BarCodeScannerModule | null {
  if (isExpoGo || Platform.OS === 'web') return null;
  if (scannerModule) return scannerModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    scannerModule = require('expo-barcode-scanner') as BarCodeScannerModule;
    return scannerModule;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Props = NativeStackScreenProps<RootStackParamList, 'AcceptGRN'>;

type ScreenStep = 'scan' | 'confirm' | 'success';

// ---------------------------------------------------------------------------
// Corner accent helper (decorative scanner corners)
// ---------------------------------------------------------------------------
function CornerAccent({
  top,
  left,
  right,
  bottom,
}: {
  top?: boolean;
  left?: boolean;
  right?: boolean;
  bottom?: boolean;
}) {
  const size = 20;
  const thickness = 3;
  const color = '#0D783C';
  return (
    <View
      style={{
        position: 'absolute',
        top: top !== undefined ? (top ? 0 : undefined) : undefined,
        bottom: bottom !== undefined ? (bottom ? 0 : undefined) : undefined,
        left: left !== undefined ? (left ? 0 : undefined) : undefined,
        right: right !== undefined ? (right ? 0 : undefined) : undefined,
        width: size,
        height: size,
        borderTopWidth: top ? thickness : 0,
        borderBottomWidth: bottom ? thickness : 0,
        borderLeftWidth: left ? thickness : 0,
        borderRightWidth: right ? thickness : 0,
        borderColor: color,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export function AcceptGRNScreen({ navigation }: Props) {
  const [step, setStep] = useState<ScreenStep>('scan');
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animated values for success state
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const mod = loadScanner();

  // Request camera permission (dev build only)
  useEffect(() => {
    if (isExpoGo || !mod) return;
    void (async () => {
      const { status } = await mod.BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run success animation
  useEffect(() => {
    if (step === 'success') {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step, scaleAnim, opacityAnim]);

  const handleBarCodeScanned = ({ data }: BarCodeScannerResult) => {
    setScanned(true);
    setScannedCode(data);
    setStep('confirm');
  };

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) {
      Alert.alert('Error', 'Please enter a GRN code');
      return;
    }
    setScannedCode(code);
    setStep('confirm');
  };

  const handleAccept = async () => {
    setBusy(true);
    try {
      const result = await api.acceptGRN(scannedCode);
      setSuccessMessage(result.message ?? 'GRN accepted successfully');
      setStep('success');
    } catch (e) {
      Alert.alert(
        'Failed',
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not accept GRN',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    setScannedCode('');
    setScanned(false);
    setManualCode('');
    setStep('scan');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <View className="flex-row items-center border-b border-border bg-bg-elevated px-4 py-3">
        <Pressable
          onPress={() => (step === 'confirm' ? handleCancel() : navigation.goBack())}
          className="size-10 items-center justify-center rounded-full"
          hitSlop={8}
        >
          <ChevronLeft size={24} color="#0F1A14" />
        </Pressable>
        <Text className="ml-2 text-base font-semibold text-fg">Scan GRN</Text>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Success screen                                                        */}
      {/* ------------------------------------------------------------------ */}
      {step === 'success' ? (
        <View className="flex-1 items-center justify-center px-6 gap-6">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <CheckCircle size={72} color="#0D783C" />
          </Animated.View>
          <View className="items-center gap-2">
            <Text className="text-xl font-bold text-fg">GRN Accepted</Text>
            <Text className="text-center text-sm text-fg-muted">{successMessage}</Text>
            <View className="mt-1 rounded-lg bg-bg-elevated border border-border px-4 py-2">
              <Text className="font-mono text-sm text-fg">{scannedCode}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-full rounded-xl bg-primary py-4 items-center"
          >
            <Text className="text-base font-semibold text-white">Done</Text>
          </Pressable>
        </View>
      ) : step === 'confirm' ? (
        /* ------------------------------------------------------------------ */
        /* Confirm card                                                         */
        /* ------------------------------------------------------------------ */
        <View className="flex-1 justify-center px-6 gap-5">
          <View className="rounded-2xl border border-border bg-bg-elevated p-6 gap-4">
            <View className="items-center gap-2">
              <QrCode size={32} color="#0D783C" />
              <Text className="text-base font-semibold text-fg">GRN Code Scanned</Text>
            </View>

            {/* Code display */}
            <View className="items-center rounded-xl bg-bg border border-border px-4 py-4">
              <Text
                style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 18 }}
                className="font-bold text-fg tracking-widest text-center"
                numberOfLines={2}
              >
                {scannedCode}
              </Text>
            </View>

            <Text className="text-center text-sm text-fg-muted">
              Confirm that you want to accept this Goods Receipt Note.
            </Text>

            {/* Buttons */}
            <View className="gap-3">
              <Pressable
                onPress={handleAccept}
                disabled={busy}
                className="w-full rounded-xl bg-primary py-4 items-center"
              >
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-semibold text-white">Accept GRN</Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleCancel}
                disabled={busy}
                className="w-full rounded-xl border border-border bg-bg-elevated py-4 items-center"
              >
                <Text className="text-base font-medium text-fg">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        /* ------------------------------------------------------------------ */
        /* Scan step                                                            */
        /* ------------------------------------------------------------------ */
        <View className="flex-1">
          {isExpoGo || !mod ? (
            /* --- Expo Go placeholder -------------------------------------- */
            <View className="flex-1 items-center justify-center px-6 gap-6">
              <View className="items-center rounded-2xl border border-border bg-bg-elevated p-6 gap-3 w-full">
                <View className="size-12 items-center justify-center rounded-full bg-primary/10">
                  <QrCode size={24} color="#0D783C" />
                </View>
                <Text className="text-center text-sm font-semibold text-fg">
                  Scanner requires a dev build
                </Text>
                <Text className="text-center text-xs text-fg-muted">
                  The camera scanner is unavailable in Expo Go. You can still enter a GRN code
                  manually below.
                </Text>
              </View>

              {/* Manual entry */}
              <View className="w-full gap-3">
                <Text className="text-sm font-medium text-fg">Enter GRN code manually</Text>
                <TextInput
                  value={manualCode}
                  onChangeText={setManualCode}
                  placeholder="e.g. GRN-2025-001234"
                  placeholderTextColor="#7A8A82"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="h-12 rounded-md border border-border bg-bg-elevated px-3 text-base text-fg"
                />
                <Pressable
                  onPress={handleManualSubmit}
                  className="w-full rounded-xl bg-primary py-4 items-center"
                >
                  <Text className="text-base font-semibold text-white">Continue</Text>
                </Pressable>
              </View>
            </View>
          ) : hasPermission === null ? (
            /* Permission loading */
            <View className="flex-1 items-center justify-center gap-3">
              <ActivityIndicator size="large" color="#0D783C" />
              <Text className="text-sm text-fg-muted">Requesting camera permission…</Text>
            </View>
          ) : hasPermission === false ? (
            /* Permission denied */
            <View className="flex-1 items-center justify-center px-6 gap-4">
              <View className="size-16 items-center justify-center rounded-full bg-red-50">
                <QrCode size={28} color="#DC2626" />
              </View>
              <Text className="text-center text-base font-semibold text-fg">
                Camera permission denied
              </Text>
              <Text className="text-center text-sm text-fg-muted">
                Please allow camera access in your device Settings to scan barcodes.
              </Text>
              <Pressable
                onPress={() =>
                  void (async () => {
                    const { status } = await mod.BarCodeScanner.requestPermissionsAsync();
                    setHasPermission(status === 'granted');
                  })()
                }
                className="rounded-xl bg-primary px-6 py-3"
              >
                <Text className="text-sm font-semibold text-white">Retry</Text>
              </Pressable>
            </View>
          ) : (
            /* Full-screen scanner */
            <View className="flex-1">
              <mod.BarCodeScanner
                style={{ flex: 1 }}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              >
                {/* Scanning frame overlay */}
                <View className="flex-1 items-center justify-center">
                  {/* Dark surrounds */}
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                    }}
                  />
                  {/* Clear window (cut out effect via negative margin trick) */}
                  <View
                    style={{
                      width: 280,
                      height: 280,
                      backgroundColor: 'transparent',
                      zIndex: 1,
                    }}
                  >
                    {/* White border */}
                    <View
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.4)',
                        borderRadius: 8,
                      }}
                    />
                    {/* Corner accents */}
                    <CornerAccent top left />
                    <CornerAccent top right />
                    <CornerAccent bottom left />
                    <CornerAccent bottom right />
                  </View>

                  {/* Hint text */}
                  <View
                    style={{ position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 2 }}
                    className="items-center"
                  >
                    <Text
                      style={{ color: '#FFFFFF', fontSize: 13, textAlign: 'center' }}
                    >
                      Position QR code in the frame
                    </Text>
                  </View>
                </View>
              </mod.BarCodeScanner>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
