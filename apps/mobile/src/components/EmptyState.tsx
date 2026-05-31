/**
 * EmptyState — centered empty-list placeholder with a tinted icon circle,
 * title, optional hint, and an optional primary pill action button.
 * Themed via useTheme().c.
 */
import { View, Text, Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, hint, actionLabel, onAction }: EmptyStateProps) {
  const C = useTheme().c;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 32 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(13,120,60,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={26} color={C.primary} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: C.fg, textAlign: 'center' }}>{title}</Text>
      {hint ? (
        <Text style={{ fontSize: 13, color: C.fgMuted, textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
          {hint}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            {
              marginTop: 18,
              backgroundColor: C.primary,
              borderRadius: 999,
              paddingHorizontal: 22,
              paddingVertical: 11,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Text style={{ color: C.onPrimary, fontSize: 14, fontWeight: '700' }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
