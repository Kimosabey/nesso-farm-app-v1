/**
 * Modern toast system — themed, animated, non-blocking (replaces Alert.alert).
 *
 * Spec source: design_handoff_nesso/app/ui.jsx — Toast (bottom slide-up, fg
 * background, coloured icon circle, auto-dismiss). Mirrors that look with the
 * live theme + haptic feedback per variant.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Farmer approved');
 *   toast.error('Could not save');
 *   toast.info('Saved offline — will sync');
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, Info, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

type ToastKind = 'success' | 'error' | 'info' | 'loading';
interface ToastState {
  id: number;
  msg: string;
  kind: ToastKind;
}
interface ToastApi {
  show: (msg: string, kind?: ToastKind) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  loading: (msg: string) => void;
}

const ToastContext = createContext<ToastApi>({
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  loading: () => {},
});

const DURATION = 2800;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { c: C } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 80, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (msg: string, kind: ToastKind = 'success') => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      idRef.current += 1;
      setToast({ id: idRef.current, msg, kind });

      // Haptic per variant (best-effort; ignored on web).
      if (Platform.OS !== 'web') {
        const style =
          kind === 'error'
            ? Haptics.NotificationFeedbackType.Error
            : kind === 'success'
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Warning;
        void Haptics.notificationAsync(style).catch(() => {});
      }

      translateY.setValue(80);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 16, stiffness: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();

      if (kind !== 'loading') {
        hideTimer.current = setTimeout(dismiss, DURATION);
      }
    },
    [dismiss, opacity, translateY],
  );

  const api = useRef<ToastApi>({
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
    loading: (m) => show(m, 'loading'),
  });
  // keep closures fresh
  api.current = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
    loading: (m) => show(m, 'loading'),
  };

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const iconColor =
    toast?.kind === 'error' ? C.danger : toast?.kind === 'info' ? C.info : C.primary;
  const Icon =
    toast?.kind === 'error'
      ? X
      : toast?.kind === 'info'
        ? Info
        : toast?.kind === 'loading'
          ? RefreshCw
          : Check;

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 90,
            opacity,
            transform: [{ translateY }],
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={dismiss}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
              maxWidth: 460,
              backgroundColor: C.fg,
              borderRadius: 14,
              paddingVertical: 13,
              paddingHorizontal: 16,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: iconColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={14} color="#FFFFFF" strokeWidth={2.6} />
            </View>
            <Text style={{ color: C.bg, fontSize: 14, fontWeight: '500', flexShrink: 1 }}>
              {toast.msg}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
