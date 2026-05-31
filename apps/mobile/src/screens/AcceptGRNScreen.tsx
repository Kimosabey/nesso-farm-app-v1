/**
 * AcceptGRNScreen — scan a QR / barcode to accept a Goods Receipt Note.
 *
 * Spec source: design_handoff_nesso/app/screens_create2.jsx — AcceptGrnScreen
 *   - Dark camera view, corner reticle + an animated sweeping scan-line, flash
 *     toggle, format chips (QR/EAN-13/PDF417/Aztec/DataMatrix). Tap reticle (or
 *     "Simulate scan" in Expo Go) → green flash + spring-in checkmark → confirm
 *     bottom sheet (batch, crop·grade, qty, supplier, farm) → "Accept GRN".
 *   - Manual-code entry fallback preserved.
 *
 * expo-barcode-scanner requires a dev build (not Expo Go); guarded with the
 * isExpoGo + try/catch pattern from src/firebase/auth.ts.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Flashlight, Check, Edit3, ScanLine, X } from 'lucide-react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api, ApiError } from '@/api/client';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/theme';

// ---------------------------------------------------------------------------
// Expo Go guard
// ---------------------------------------------------------------------------
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

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

const RETICLE = 236;
const FORMATS = ['QR', 'EAN-13', 'PDF417', 'Aztec', 'DataMatrix'] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'AcceptGRN'>;
type ScreenStep = 'scan' | 'manual';

// ---------------------------------------------------------------------------
// L-shaped corner bracket
// ---------------------------------------------------------------------------
function Corner({
  pos,
  color,
}: {
  pos: 'tl' | 'tr' | 'bl' | 'br';
  color: string;
}) {
  const t = 4;
  const isTop = pos[0] === 't';
  const isLeft = pos[1] === 'l';
  return (
    <View
      style={{
        position: 'absolute',
        width: 40,
        height: 40,
        top: isTop ? 0 : undefined,
        bottom: isTop ? undefined : 0,
        left: isLeft ? 0 : undefined,
        right: isLeft ? undefined : 0,
        borderTopWidth: isTop ? t : 0,
        borderBottomWidth: isTop ? 0 : t,
        borderLeftWidth: isLeft ? t : 0,
        borderRightWidth: isLeft ? 0 : t,
        borderColor: color,
        borderTopLeftRadius: pos === 'tl' ? 16 : 0,
        borderTopRightRadius: pos === 'tr' ? 16 : 0,
        borderBottomLeftRadius: pos === 'bl' ? 16 : 0,
        borderBottomRightRadius: pos === 'br' ? 16 : 0,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Press-scale pressable
// ---------------------------------------------------------------------------
function Scale({
  onPress,
  disabled,
  style,
  children,
  hitSlop,
}: {
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
  children: React.ReactNode;
  hitSlop?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => [style, { transform: [{ scale: pressed ? 0.94 : 1 }], opacity: disabled ? 0.5 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export function AcceptGRNScreen({ navigation }: Props) {
  const C = useTheme().c;
  const toast = useToast();
  const mod = loadScanner();

  const [step, setStep] = useState<ScreenStep>('scan');
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Sweeping scan-line (loops top↔bottom while idle)
  const sweep = useRef(new Animated.Value(0)).current;
  // Success checkmark spring-in
  const checkScale = useRef(new Animated.Value(0)).current;

  // Camera permission (dev build only)
  useEffect(() => {
    if (isExpoGo || !mod) return;
    void (async () => {
      const { status } = await mod.BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loop the scan-line until a code is detected.
  useEffect(() => {
    if (scanned) return;
    sweep.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanned, sweep]);

  // Spring the checkmark in on detect, then open the confirm sheet.
  useEffect(() => {
    if (!scanned) return;
    checkScale.setValue(0);
    Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 110, friction: 6 }).start();
    const t = setTimeout(() => setConfirmOpen(true), 550);
    return () => clearTimeout(t);
  }, [scanned, checkScale]);

  const detect = (code: string) => {
    setScannedCode(code);
    setScanned(true);
  };

  const handleBarCodeScanned = ({ data }: BarCodeScannerResult) => {
    if (scanned) return;
    detect(data);
  };

  const handleSimulate = () => {
    if (scanned) return;
    detect('BATCH-TBR-0291');
  };

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) {
      toast.error('Please enter a GRN code');
      return;
    }
    detect(code);
  };

  const resetScan = () => {
    setConfirmOpen(false);
    setScanned(false);
    setScannedCode('');
    setManualCode('');
    setStep('scan');
  };

  const handleAccept = async () => {
    setBusy(true);
    try {
      const result = await api.acceptGRN(scannedCode);
      toast.success(result.message ?? 'GRN accepted · 320 kg in');
      navigation.goBack();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not accept GRN');
    } finally {
      setBusy(false);
    }
  };

  const sweepY = sweep.interpolate({ inputRange: [0, 1], outputRange: [14, RETICLE - 18] });
  const reticleColor = scanned ? C.primary : C.accent;

  // -------------------------------------------------------------------------
  // Manual entry step (fallback)
  // -------------------------------------------------------------------------
  if (step === 'manual') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
            backgroundColor: C.bgElevated,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Scale
            onPress={() => setStep('scan')}
            hitSlop={8}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={24} color={C.fg} />
          </Scale>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg }}>Enter GRN code</Text>
        </View>

        <View style={{ padding: 20, gap: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.fg }}>GRN / batch code</Text>
          <TextInput
            value={manualCode}
            onChangeText={setManualCode}
            placeholder="e.g. GRN-2025-001234"
            placeholderTextColor={C.fgSubtle}
            autoCapitalize="characters"
            autoCorrect={false}
            style={{
              height: 54,
              borderRadius: 13,
              borderWidth: 1.5,
              borderColor: C.borderStrong,
              backgroundColor: C.bgElevated,
              paddingHorizontal: 14,
              fontSize: 16,
              color: C.fg,
              fontFamily: 'monospace',
            }}
          />
          <Scale
            onPress={handleManualSubmit}
            style={{ paddingVertical: 15, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.onPrimary }}>Continue</Text>
          </Scale>
        </View>

        {renderConfirm()}
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------------------
  // Confirm bottom sheet (shared)
  // -------------------------------------------------------------------------
  function renderConfirm() {
    const rows: Array<[string, string]> = [
      ['Crop', 'Tuberose · Grade A'],
      ['Quantity', '320 kg'],
      ['Supplier', 'Belur FPO'],
      ['Farm', 'Belur Estate · FARM-117'],
    ];
    return (
      <Modal visible={confirmOpen} transparent animationType="slide" onRequestClose={resetScan}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={resetScan} />
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: C.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ padding: 18 }}>
            <View style={{ alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: C.borderStrong, marginBottom: 14 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg }}>Confirm GRN</Text>
              <Scale onPress={resetScan} hitSlop={8} style={{ padding: 4 }}>
                <X size={22} color={C.fgMuted} />
              </Scale>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: C.primary50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ScanLine size={22} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg, fontFamily: 'monospace' }} numberOfLines={1}>
                  {scannedCode}
                </Text>
                <Text style={{ fontSize: 12.5, color: C.fgMuted }}>Detected · just now</Text>
              </View>
            </View>

            <View style={{ backgroundColor: C.bgMuted, borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
              {rows.map(([k, v], i) => (
                <View
                  key={k}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderTopWidth: i ? 1 : 0,
                    borderTopColor: C.border,
                  }}
                >
                  <Text style={{ fontSize: 13, color: C.fgMuted }}>{k}</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.fg }}>{v}</Text>
                </View>
              ))}
            </View>

            <Scale
              onPress={handleAccept}
              disabled={busy}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                paddingVertical: 15,
                borderRadius: 14,
                backgroundColor: C.primary,
              }}
            >
              {busy ? (
                <ActivityIndicator color={C.onPrimary} />
              ) : (
                <>
                  <Check size={20} color={C.onPrimary} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.onPrimary }}>Accept GRN</Text>
                </>
              )}
            </Scale>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // -------------------------------------------------------------------------
  // Scanner reticle overlay (shared between camera + faux camera)
  // -------------------------------------------------------------------------
  const Overlay = (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 }}>
      <Scale onPress={handleSimulate} disabled={scanned} style={{ width: RETICLE, height: RETICLE }}>
        <Corner pos="tl" color={reticleColor} />
        <Corner pos="tr" color={reticleColor} />
        <Corner pos="bl" color={reticleColor} />
        <Corner pos="br" color={reticleColor} />
        {!scanned ? (
          <Animated.View
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              height: 3,
              borderRadius: 2,
              backgroundColor: C.accent,
              shadowColor: C.accent,
              shadowOpacity: 0.9,
              shadowRadius: 8,
              transform: [{ translateY: sweepY }],
            }}
          />
        ) : (
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: C.primary,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: checkScale }],
              }}
            >
              <Check size={36} color={C.onPrimary} strokeWidth={3} />
            </Animated.View>
          </View>
        )}
      </Scale>

      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14.5, fontWeight: '600', color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
          {scanned ? 'Code detected' : 'Align the QR or barcode inside the frame'}
        </Text>
        {!scanned ? (
          <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>(tap the frame to simulate a scan)</Text>
        ) : null}
      </View>

      {/* Format chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', maxWidth: 300 }}>
        {FORMATS.map((f) => (
          <View
            key={f}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // -------------------------------------------------------------------------
  // Scan step
  // -------------------------------------------------------------------------
  const showCamera = !isExpoGo && !!mod && hasPermission === true;

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0c' }}>
      {/* Faux camera gradient (Expo Go / no permission) */}
      {!showCamera ? (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: '#0c120e' }} />
      ) : null}

      {/* Camera feed when available */}
      {showCamera && mod ? (
        <mod.BarCodeScanner
          style={{ position: 'absolute', inset: 0 }}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      ) : null}

      {/* Dim mask */}
      <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,12,8,0.55)' }} />

      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 6 }}>
          <Scale
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(255,255,255,0.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={22} color="#FFFFFF" />
          </Scale>
          <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: '#FFFFFF' }}>Scan GRN</Text>
          <Scale
            onPress={() => setFlash((f) => !f)}
            hitSlop={8}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: flash ? C.accent : 'rgba(255,255,255,0.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flashlight size={19} color={flash ? '#0F1A14' : '#FFFFFF'} />
          </Scale>
        </View>

        {/* Permission-pending / denied notes (dev build) */}
        {!isExpoGo && mod && hasPermission === false ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center' }}>
              Camera permission denied — use manual entry below.
            </Text>
          </View>
        ) : null}

        {/* Reticle + chips */}
        {Overlay}

        {/* Manual entry */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Scale
            onPress={() => setStep('manual')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.18)',
            }}
          >
            <Edit3 size={18} color="#FFFFFF" />
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: '#FFFFFF' }}>Enter code manually</Text>
          </Scale>
        </View>
      </SafeAreaView>

      {renderConfirm()}
    </View>
  );
}
