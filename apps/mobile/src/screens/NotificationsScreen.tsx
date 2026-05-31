/**
 * Notifications — 100% spec parity with design handoff.
 *
 * Spec source: docs/.../design_handoff_nesso/app/screens_settings.jsx — NotificationsScreen
 *   - PageTop "Notifications" + back header + "Mark all read" action (right)
 *   - Groups Today / Earlier
 *   - Rows: icon (by kind), title, subtitle/body, relative time, unread dot
 * Data: api.listNotifications, api.markNotificationRead, api.markAllRead. Expo Go safe.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  CheckCircle2,
  CloudRain,
  Wheat,
  RefreshCw,
  AlertTriangle,
  Bell,
  type LucideIcon,
} from 'lucide-react-native';
import { api, type NotificationRow } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import { useTheme, type ThemeTokens } from '@/theme';

type Nav = { goBack: () => void };

const UNREAD_STATUSES: ReadonlyArray<NotificationRow['status']> = [
  'queued',
  'sent',
  'delivered',
];

function metaFor(kind: NotificationRow['kind'], C: ThemeTokens): { Icon: LucideIcon; color: string } {
  switch (kind) {
    case 'approval':
      return { Icon: CheckCircle2, color: C.primary };
    case 'weather':
      return { Icon: CloudRain, color: C.info };
    case 'activityReminder':
      return { Icon: Wheat, color: C.warning };
    case 'sync':
      return { Icon: RefreshCw, color: C.secondaryD };
    default:
      return { Icon: AlertTriangle, color: C.danger };
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay}d`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function NotificationsScreen() {
  const C = useTheme().c;
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listNotifications({ pageSize: 100 });
      setItems(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const onMarkAll = useCallback(async () => {
    try {
      await api.markAllRead();
      setItems((prev) =>
        prev.map((n) =>
          UNREAD_STATUSES.includes(n.status) ? { ...n, status: 'read' } : n,
        ),
      );
    } catch {
      // best-effort; refresh will reconcile
    }
  }, []);

  const groups = useMemo(() => {
    const today: NotificationRow[] = [];
    const earlier: NotificationRow[] = [];
    for (const n of items) {
      (isToday(n.createdAt) ? today : earlier).push(n);
    }
    return [
      { label: 'Today', items: today },
      { label: 'Earlier', items: earlier },
    ].filter((g) => g.items.length > 0);
  }, [items]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: C.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 6 }}>
          <ChevronLeft size={24} color={C.primary} />
        </Pressable>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: C.fg }}>Notifications</Text>
        <Pressable onPress={onMarkAll} style={{ padding: 4, paddingRight: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.primary }}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {error ? (
          <View
            style={{
              marginTop: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(180,35,24,0.3)',
              backgroundColor: 'rgba(180,35,24,0.06)',
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 14, color: C.danger }}>{error}</Text>
          </View>
        ) : null}

        {!error && isLoading ? <View style={{ paddingTop: 12 }}><ListSkeleton /></View> : null}

        {!error && !isLoading
          ? groups.map((g) => (
          <View key={g.label} style={{ marginTop: 14 }}>
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: '700',
                letterSpacing: 0.9,
                color: C.fgSubtle,
                paddingHorizontal: 4,
                paddingBottom: 8,
              }}
            >
              {g.label.toUpperCase()}
            </Text>
            <View style={{ gap: 9 }}>
              {g.items.map((n) => {
                const { Icon, color } = metaFor(n.kind, C);
                const unread = UNREAD_STATUSES.includes(n.status);
                return (
                  <View
                    key={n._id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 12,
                      backgroundColor: C.bgElevated,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: C.border,
                      padding: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        backgroundColor: `${color}24`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={19} color={color} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '600', color: C.fg }}>
                        {n.title}
                      </Text>
                      <Text style={{ fontSize: 13, color: C.fgMuted, marginTop: 1 }}>{n.body}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ fontSize: 11, color: C.fgSubtle, fontFamily: 'monospace' }}>
                        {relativeTime(n.createdAt)}
                      </Text>
                      {unread ? (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: C.primary,
                          }}
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
            ))
          : null}

        {!error && !isLoading && groups.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            hint="New approvals, weather alerts and reminders will appear here."
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
