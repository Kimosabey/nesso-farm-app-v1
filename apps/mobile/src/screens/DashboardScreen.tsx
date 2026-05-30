import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  RefreshControl,
  type ViewStyle,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import {
  Users,
  MapPin,
  Sprout,
  Clock,
  Activity,
  ScanLine,
  Wheat,
  Package,
  Droplet,
  FileText,
  Bell,
  RefreshCw,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FarmerStats, MeResponse, Farmer } from '@/api/client';
import { api } from '@/api/client';
import { sync, type SyncStatus } from '@/sync/SyncManager';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { MainTabParamList } from '@/navigation/MainTabs';
import type { RootStackParamList } from '../../App';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const C = {
  primary: '#0D783C',
  secondary: '#518E6D',
  secondaryD: '#3C6B51',
  secondaryBg: '#EAF6EE',
  accent: '#F1D412',
  info: '#0E7490',
  warning: '#9A8407',
  danger: '#B42318',
  bg: '#FAFDFA',
  bgElevated: '#FFFFFF',
  fg: '#0F1A14',
  fgMuted: '#4A5A52',
  fgSubtle: '#7A8A82',
  border: '#DDE6E0',
} as const;

const shadowSm: ViewStyle = {
  shadowColor: '#0F1A14',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

/** Mix a hex color at `pct`% over white — replicates color-mix(in oklab, color 14%, bg-elevated). */
function tint(hex: string, pct: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = pct / 100;
  const mix = (c: number) => Math.round(c * f + 255 * (1 - f));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// ---------------------------------------------------------------------------
// Animated count-up hook (0 → target over `duration` ms)
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    setValue(0);
    const ticks = Math.max(1, Math.round(duration / 16));
    let current = 0;
    timerRef.current = setInterval(() => {
      current += 1;
      const progress = Math.min(current / ticks, 1);
      setValue(Math.round(target * progress));
      if (current >= ticks) {
        if (timerRef.current) clearInterval(timerRef.current);
        setValue(target);
      }
    }, 16);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [target, duration]);

  return value;
}

// ---------------------------------------------------------------------------
// Sparkline — normalized polyline inside a w×h box
// ---------------------------------------------------------------------------
function Sparkline({
  data,
  color,
  w = 52,
  h = 22,
}: {
  data: number[];
  color: string;
  w?: number;
  h?: number;
}) {
  if (data.length < 2) return <View style={{ width: w, height: h }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 2;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((d - min) / span) * (h - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <Svg width={w} height={h}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Avatar — initials in a tinted circle
// ---------------------------------------------------------------------------
function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length === 0
      ? '?'
      : ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() ||
        (parts[0]?.[0] ?? '?').toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(13,120,60,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: C.primary, fontWeight: '700', fontSize: 18 }}>{initials}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------
function KpiCard({
  label,
  value,
  delta,
  icon,
  color,
  spark,
}: {
  label: string;
  value: number;
  delta: number;
  icon: React.ReactNode;
  color: string;
  spark: number[];
}) {
  const displayed = useCountUp(value, 800);
  const text = value >= 100 ? displayed.toLocaleString() : String(displayed);
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: C.bgElevated,
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: C.border,
        },
        shadowSm,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: tint(color, 14),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <Sparkline data={spark} color={color} w={52} h={22} />
      </View>
      <Text
        style={{
          fontSize: 30,
          fontWeight: '700',
          color: C.fg,
          letterSpacing: -0.6,
          marginTop: 12,
          fontVariant: ['tabular-nums'],
        }}
      >
        {text}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <Text style={{ fontSize: 13, color: C.fgMuted, fontWeight: '500' }}>{label}</Text>
        <Text
          style={{ fontSize: 11.5, fontWeight: '700', color: delta > 0 ? C.primary : C.danger }}
        >
          {delta > 0 ? '↑' : '↓'}
          {Math.abs(delta)}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Quick action tile
// ---------------------------------------------------------------------------
function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          backgroundColor: C.bgElevated,
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 8,
          alignItems: 'center',
          gap: 8,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        shadowSm,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          backgroundColor: tint(color, 14),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 11.5, fontWeight: '600', color: C.fg, textAlign: 'center', lineHeight: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Jump-to pill
// ---------------------------------------------------------------------------
function JumpPill({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: C.border,
        backgroundColor: C.bgElevated,
      }}
    >
      {icon}
      <Text style={{ fontSize: 13, fontWeight: '600', color: C.fgMuted }}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Feed row
// ---------------------------------------------------------------------------
interface FeedItem {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  time: string;
}

function FeedRow({ item, first }: { item: FeedItem; first: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: C.border,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: tint(item.color, 14),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.fg }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12.5, color: C.fgMuted }} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Text style={{ fontSize: 11.5, color: C.fgSubtle, fontVariant: ['tabular-nums'] }}>
        {item.time}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------
function SectionHeader({
  title,
  action,
  onAction,
  paddingTop,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  paddingTop: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingTop,
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={{ fontSize: 12.5, color: C.primary, fontWeight: '600' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Static placeholder feed (used when no real farmers available)
const PLACEHOLDER_FEED: FeedItem[] = [
  {
    icon: <Users size={18} color={C.primary} strokeWidth={2} />,
    color: C.primary,
    title: 'Registered Lakshmi Gowda',
    subtitle: 'Channarayapatna · KYC pending',
    time: '12m',
  },
  {
    icon: <Activity size={18} color={C.secondaryD} strokeWidth={2} />,
    color: C.secondaryD,
    title: 'Logged spraying activity',
    subtitle: 'Farm FRM-2839 · ₹1,240',
    time: '1h',
  },
  {
    icon: <MapPin size={18} color={C.info} strokeWidth={2} />,
    color: C.info,
    title: 'Mapped a 2.4 ha farm',
    subtitle: 'Belur · 6 vertices',
    time: '3h',
  },
  {
    icon: <Sprout size={18} color={C.primary} strokeWidth={2} />,
    color: C.primary,
    title: 'Harvest plan approved',
    subtitle: 'Tuberose · 320 kg expected',
    time: '5h',
  },
];

const FORECAST: Array<[string, string, number]> = [
  ['Mon', '☀️', 28],
  ['Tue', '☁️', 26],
  ['Wed', '🌧️', 24],
  ['Thu', '☁️', 27],
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function DashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<FarmerStats | null>(null);
  const [recentFarmers, setRecentFarmers] = useState<Farmer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, s, r] = await Promise.all([
        api.me(),
        api.farmerStats(),
        api.listFarmers({ pageSize: 4 }),
      ]);
      setMe(m);
      setStats(s);
      setRecentFarmers(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void load();
    const unsub = sync.subscribe((e) => {
      if (e.type === 'status') setSyncStatus(e.status);
      else if (e.type === 'drained' && e.ok > 0) void load();
    });
    return unsub;
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
      await sync.kick();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  // Stack navigation helper
  const stackNav = () =>
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  // Header derived strings
  const fullName =
    me && me.firstName
      ? `${me.firstName}${me.lastName ? ` ${me.lastName}` : ''}`.trim()
      : 'Welcome';
  const greeting = (() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  })();

  // Sync chip content
  const syncQueued = syncStatus ? syncStatus.pending + syncStatus.failed : 0;
  const syncLabel = !syncStatus
    ? 'All synced · just now'
    : syncStatus.draining
      ? 'Syncing…'
      : syncQueued > 0
        ? `${syncQueued} queued`
        : 'All synced · just now';

  // Feed: real farmers, else placeholder
  const feed: FeedItem[] =
    recentFarmers.length > 0
      ? recentFarmers.map((f) => ({
          icon: <Users size={18} color={C.primary} strokeWidth={2} />,
          color: C.primary,
          title: `Registered ${f.firstName}${f.lastName ? ` ${f.lastName}` : ''}`.trim(),
          subtitle: `${f.address?.village ?? 'Unknown'} · ${f.approvalStatus}`,
          time: 'just now',
        }))
      : PLACEHOLDER_FEED;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <OfflineBanner status={syncStatus} />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* ---------------------------------------------------------------- */}
        {/* 1. DashHeader                                                     */}
        {/* ---------------------------------------------------------------- */}
        <View
          style={{
            paddingTop: 54,
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Pressable onPress={() => navigation.navigate('Settings')} accessibilityLabel="Profile & settings">
            <Avatar name={fullName === 'Welcome' ? 'NA' : fullName} size={46} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 12, color: C.fgMuted, fontWeight: '500' }}>{greeting}</Text>
              {me?.role ? (
                <View
                  style={{
                    backgroundColor: C.secondaryBg,
                    paddingVertical: 2,
                    paddingHorizontal: 8,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: C.secondaryD }}>
                    {me.role}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={{ fontSize: 20, fontWeight: '700', color: C.fg, letterSpacing: -0.2, marginTop: 1 }}
              numberOfLines={1}
            >
              {fullName}
            </Text>
          </View>
          {/* Theme toggle */}
          <Pressable
            accessibilityLabel="Toggle theme"
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
            <Text style={{ fontSize: 18 }}>🌙</Text>
          </Pressable>
          {/* Bell */}
          <Pressable
            accessibilityLabel="Notifications"
            onPress={() => stackNav()?.navigate('Notifications')}
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
            <Bell size={19} color={C.fg} />
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 9,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: C.danger,
                borderWidth: 2,
                borderColor: C.bgElevated,
              }}
            />
          </Pressable>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* 2. Sync chip                                                      */}
        {/* ---------------------------------------------------------------- */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: 7,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 999,
              backgroundColor: C.secondaryBg,
            }}
          >
            <RefreshCw size={14} color={C.secondaryD} strokeWidth={2.2} />
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: C.secondaryD }}>{syncLabel}</Text>
          </View>
        </View>

        {error ? (
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tint(C.danger, 30),
              backgroundColor: tint(C.danger, 10),
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontSize: 13, color: C.danger }}>{error}</Text>
          </View>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* 3. Weather card (gradient simulated with overlay) → Weather       */}
        {/* ---------------------------------------------------------------- */}
        <Pressable
          onPress={() => stackNav()?.navigate('Weather')}
          style={{
            marginHorizontal: 20,
            borderRadius: 22,
            padding: 20,
            overflow: 'hidden',
            backgroundColor: C.primary,
          }}
        >
          {/* lighter secondary overlay (top-left → simulate 135deg gradient) */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: C.secondary,
              opacity: 0.5,
            }}
          />
          {/* yellow glow blob top-right */}
          <View
            style={{
              position: 'absolute',
              top: -30,
              right: -20,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: 'rgba(241,212,18,0.25)',
            }}
          />
          {/* top row */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <View>
              <Text style={{ fontSize: 13, color: '#fff', opacity: 0.9, fontWeight: '500' }}>
                📍 Hassan, Karnataka
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                <Text style={{ fontSize: 42, fontWeight: '700', color: '#fff', letterSpacing: -0.8 }}>
                  27°
                </Text>
                <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9 }}>Partly cloudy</Text>
              </View>
            </View>
            <Text style={{ fontSize: 40 }}>☁️</Text>
          </View>
          {/* advisory chip */}
          <View
            style={{
              marginTop: 14,
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: 'rgba(255,255,255,0.16)',
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 13, color: '#fff', fontWeight: '500' }}>
              ✓ Good window for spraying till 4 PM
            </Text>
          </View>
          {/* 4-day forecast */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            {FORECAST.map(([day, emoji, temp]) => (
              <View key={day} style={{ alignItems: 'center', gap: 5 }}>
                <Text style={{ fontSize: 11.5, color: '#fff', opacity: 0.85 }}>{day}</Text>
                <Text style={{ fontSize: 18 }}>{emoji}</Text>
                <Text
                  style={{ fontSize: 13, fontWeight: '600', color: '#fff', fontVariant: ['tabular-nums'] }}
                >
                  {temp}°
                </Text>
              </View>
            ))}
          </View>
        </Pressable>

        {/* ---------------------------------------------------------------- */}
        {/* 4. This season header                                             */}
        {/* ---------------------------------------------------------------- */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingTop: 22,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg }}>This season</Text>
          <Text style={{ fontSize: 12.5, color: C.primary, fontWeight: '600' }}>2025–26 ▾</Text>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* 5. KPI grid (2×2)                                                 */}
        {/* ---------------------------------------------------------------- */}
        <View style={{ paddingTop: 12, paddingHorizontal: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <KpiCard
              label="Farmers"
              value={stats?.total ?? 0}
              delta={12}
              icon={<Users size={18} color={C.primary} strokeWidth={2} />}
              color={C.primary}
              spark={[3, 5, 4, 6, 7, 8, 10]}
            />
            <KpiCard
              label="Farms mapped"
              value={942}
              delta={8}
              icon={<MapPin size={18} color={C.secondaryD} strokeWidth={2} />}
              color={C.secondaryD}
              spark={[2, 3, 3, 5, 6, 6, 8]}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <KpiCard
              label="Active crops"
              value={376}
              delta={5}
              icon={<Sprout size={18} color={C.info} strokeWidth={2} />}
              color={C.info}
              spark={[5, 4, 5, 6, 6, 7, 7]}
            />
            <KpiCard
              label="Pending"
              value={stats?.pending ?? 0}
              delta={-4}
              icon={<Clock size={18} color={C.warning} strokeWidth={2} />}
              color={C.warning}
              spark={[8, 7, 6, 7, 5, 4, 3]}
            />
          </View>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* 6. Quick actions                                                  */}
        {/* ---------------------------------------------------------------- */}
        <SectionHeader title="Quick actions" paddingTop={24} />
        <View style={{ flexDirection: 'row', gap: 10, paddingTop: 12, paddingHorizontal: 20 }}>
          <QuickAction
            icon={<Users size={22} color={C.primary} strokeWidth={1.9} />}
            label="Register"
            color={C.primary}
            onPress={() => navigation.navigate('Register')}
          />
          <QuickAction
            icon={<MapPin size={22} color={C.secondaryD} strokeWidth={1.9} />}
            label="Add farm"
            color={C.secondaryD}
            onPress={() => stackNav()?.navigate('AddFarm', {})}
          />
          <QuickAction
            icon={<Activity size={22} color={C.info} strokeWidth={1.9} />}
            label="Activity"
            color={C.info}
            onPress={() => stackNav()?.navigate('AddActivity', {})}
          />
          <QuickAction
            icon={<ScanLine size={22} color="#B6850A" strokeWidth={1.9} />}
            label="Scan GRN"
            color="#B6850A"
            onPress={() => stackNav()?.navigate('AcceptGRN')}
          />
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* 7. Jump to                                                        */}
        {/* ---------------------------------------------------------------- */}
        <SectionHeader title="Jump to" paddingTop={26} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 12, paddingHorizontal: 20 }}
        >
          <JumpPill
            icon={<Wheat size={16} color={C.primary} />}
            label="Harvest"
            onPress={() => stackNav()?.navigate('HarvestBoard')}
          />
          <JumpPill
            icon={<Activity size={16} color={C.primary} />}
            label="Activities"
            onPress={() => stackNav()?.navigate('Activities')}
          />
          <JumpPill
            icon={<Sprout size={16} color={C.primary} />}
            label="Pre-harvest"
            onPress={() => stackNav()?.navigate('PreHarvest')}
          />
          <JumpPill
            icon={<Package size={16} color={C.primary} />}
            label="Post-harvest"
            onPress={() => {}}
          />
          <JumpPill
            icon={<Droplet size={16} color={C.primary} />}
            label="Samples"
            onPress={() => {}}
          />
          <JumpPill
            icon={<FileText size={16} color={C.primary} />}
            label="Procurement"
            onPress={() => {}}
          />
        </ScrollView>

        {/* ---------------------------------------------------------------- */}
        {/* 8. Recent activity                                                */}
        {/* ---------------------------------------------------------------- */}
        <SectionHeader
          title="Recent activity"
          action="See all"
          onAction={() => navigation.navigate('Farmers')}
          paddingTop={26}
        />
        <View style={{ paddingTop: 12, paddingHorizontal: 20 }}>
          <View
            style={[
              {
                backgroundColor: C.bgElevated,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: C.border,
                overflow: 'hidden',
              },
              shadowSm,
            ]}
          >
            {feed.map((item, i) => (
              <FeedRow key={`${item.title}-${i}`} item={item} first={i === 0} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
