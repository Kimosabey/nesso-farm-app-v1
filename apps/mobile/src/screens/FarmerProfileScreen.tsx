/**
 * Farmer Profile — spec parity with design handoff (SCREENS.md → Farmer Profile).
 *
 *   - Header: large initials avatar (primary tint, 72px), name, mono farmerId,
 *     group/FPO chip, KYC/approval status pill. Back button.
 *   - Stats row: Farms / Total area (acres) / Active crops / Practice — real data.
 *   - Tabs (underline active, primary): Farms / Crops / Activities / Documents.
 *       Farms      → api.listFarms({ farmerId })   → cards; CTA → AddFarm
 *       Crops      → api.listCrops({ farmerId })   → cards
 *       Activities → api.listActivities({ farmerId }) → rows
 *       Documents  → EmptyState placeholder (per spec)
 *   - Sticky bottom bar (only when approvalStatus === 'pending'):
 *       Reject (outline danger) / Approve (primary) → api.approveFarmer.
 *
 * Theming via useTheme().c (dark/light). Animated via react-native (Expo Go safe).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  MapPin,
  Wheat,
  Activity as ActivityIcon,
  FileText,
  Sprout,
  CheckCircle2,
  Calendar,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { api, type Farmer, type Farm, type Crop, type ActivityRow } from '@/api/client';
import { useTheme, type ThemeTokens } from '@/theme';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmerProfile'>;

const TABS = ['Farms', 'Crops', 'Activities', 'Documents'] as const;
type Tab = (typeof TABS)[number];

function initials(first?: string, last?: string): string {
  const a = first?.[0] ?? '';
  const b = last?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

const GROUP_LABEL: Record<Farmer['groupAssociation'], string> = {
  INDEPENDENT: 'Independent',
  FLOWER_AGENT: 'Flower Agent',
  FPO: 'FPO',
};

// ---------------------------------------------------------------------------
// Small press-scale wrapper (Expo Go safe — react-native Animated only).
// ---------------------------------------------------------------------------
function Pressable95({
  onPress,
  disabled,
  children,
  style,
}: {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: object | object[];
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style as object]}>{children}</Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export function FarmerProfileScreen({ route, navigation }: Props) {
  const C = useTheme().c;
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { farmerId } = route.params;

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Farms');
  const [working, setWorking] = useState(false);

  // Shared data for header stats — fetched once alongside the farmer.
  const [farms, setFarms] = useState<Farm[] | null>(null);
  const [crops, setCrops] = useState<Crop[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, fm, cr] = await Promise.all([
        api.farmerById(farmerId),
        api.listFarms({ farmerId, pageSize: 100 }),
        api.listCrops({ farmerId, pageSize: 100 }),
      ]);
      setFarmer(f);
      setFarms(fm.data);
      setCrops(cr.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load farmer');
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalArea = useMemo(
    () => (farms ?? []).reduce((sum, f) => sum + (f.farmArea ?? 0), 0),
    [farms],
  );

  const decide = useCallback(
    async (approved: boolean) => {
      if (working) return;
      setWorking(true);
      try {
        await api.approveFarmer(farmerId, approved);
        toast.success(approved ? 'Farmer approved' : 'Farmer rejected');
        navigation.goBack();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Action failed');
        setWorking(false);
      }
    },
    [farmerId, navigation, toast, working],
  );

  const showStickyBar = !loading && farmer?.approvalStatus === 'pending';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}
      <View style={{ backgroundColor: C.primary, paddingHorizontal: 16, paddingBottom: 22, paddingTop: 6 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={{ alignSelf: 'flex-start', padding: 4, marginBottom: 8 }}
        >
          <ChevronLeft size={26} color={C.onPrimary} />
        </Pressable>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator color={C.onPrimary} />
          </View>
        ) : farmer ? (
          <View style={{ alignItems: 'center', gap: 8 }}>
            {/* Avatar */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: C.onPrimary, fontWeight: '700', fontSize: 26 }}>
                {initials(farmer.firstName, farmer.lastName)}
              </Text>
            </View>

            {/* Name */}
            <Text
              style={{ color: C.onPrimary, fontSize: 22, fontWeight: '700', textAlign: 'center' }}
            >
              {farmer.firstName} {farmer.lastName ?? ''}
            </Text>

            {/* Farmer ID (mono) */}
            <Text
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontFamily: 'monospace',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              {farmer.farmerId}
            </Text>

            {/* Chips: group/FPO + KYC/approval */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: C.onPrimary, fontSize: 11.5, fontWeight: '700' }}>
                  {GROUP_LABEL[farmer.groupAssociation]}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {farmer.approvalStatus === 'approved' ? (
                  <CheckCircle2 size={12} color={C.onPrimary} />
                ) : null}
                <Text style={{ color: C.onPrimary, fontSize: 11.5, fontWeight: '700' }}>
                  KYC{' '}
                  {farmer.approvalStatus[0].toUpperCase() + farmer.approvalStatus.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* Stats row                                                         */}
      {/* ---------------------------------------------------------------- */}
      {!loading && farmer ? (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: C.bgElevated,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
          }}
        >
          <Stat C={C} label="Farms" value={farms ? String(farms.length) : '—'} />
          <Stat C={C} label="Area (ac)" value={farms ? totalArea.toFixed(1) : '—'} divider />
          <Stat C={C} label="Crops" value={crops ? String(crops.length) : '—'} divider />
          <Stat
            C={C}
            label="Practice"
            value={shortPractice(farmer.productionPractice)}
            divider
          />
        </View>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Tab bar (underline active)                                        */}
      {/* ---------------------------------------------------------------- */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: C.border,
          backgroundColor: C.bgElevated,
        }}
      >
        {TABS.map((tab) => {
          const on = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{ flex: 1, paddingVertical: 13, alignItems: 'center' }}
            >
              <Text
                style={{ fontSize: 13.5, fontWeight: on ? '700' : '500', color: on ? C.primary : C.fgSubtle }}
              >
                {tab}
              </Text>
              {on ? (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 18,
                    right: 18,
                    height: 2.5,
                    backgroundColor: C.primary,
                    borderRadius: 2,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* Tab content                                                       */}
      {/* ---------------------------------------------------------------- */}
      {error ? (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.danger,
            backgroundColor: C.dangerBg,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 14, color: C.danger }}>{error}</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ paddingBottom: showStickyBar ? 96 : 32 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Farms' ? (
          <FarmsTab C={C} farmerId={farmerId} navigation={navigation} />
        ) : activeTab === 'Crops' ? (
          <CropsTab C={C} farmerId={farmerId} />
        ) : activeTab === 'Activities' ? (
          <ActivitiesTab C={C} farmerId={farmerId} />
        ) : (
          <EmptyState
            icon={FileText}
            title="No documents uploaded"
            hint="KYC and certification documents will appear here once uploaded."
          />
        )}
      </ScrollView>

      {/* ---------------------------------------------------------------- */}
      {/* Sticky bottom bar (pending only)                                  */}
      {/* ---------------------------------------------------------------- */}
      {showStickyBar ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            backgroundColor: C.bgElevated,
            borderTopWidth: 1,
            borderTopColor: C.border,
          }}
        >
          <Pressable95
            onPress={() => void decide(false)}
            disabled={working}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: C.danger,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: working ? 0.6 : 1,
            }}
          >
            <Text style={{ color: C.danger, fontSize: 15, fontWeight: '700' }}>Reject</Text>
          </Pressable95>
          <Pressable95
            onPress={() => void decide(true)}
            disabled={working}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: working ? 0.6 : 1,
            }}
          >
            {working ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <Text style={{ color: C.onPrimary, fontSize: 15, fontWeight: '700' }}>Approve</Text>
            )}
          </Pressable95>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Stat cell
// ---------------------------------------------------------------------------
function Stat({
  C,
  label,
  value,
  divider,
}: {
  C: ThemeTokens;
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderLeftWidth: divider ? 1 : 0,
        borderLeftColor: C.border,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '700', color: C.fg }} numberOfLines={1}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: C.fgSubtle, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function shortPractice(p?: string): string {
  if (!p) return '—';
  if (p.length <= 8) return p;
  return p.slice(0, 7) + '…';
}

// ---------------------------------------------------------------------------
// Shared tab section chrome
// ---------------------------------------------------------------------------
function TabSkeleton({ C }: { C: ThemeTokens }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: C.bgElevated,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border,
            padding: 14,
            gap: 10,
          }}
        >
          <Skeleton w="55%" h={14} />
          <Skeleton w="80%" h={11} />
        </View>
      ))}
    </View>
  );
}

function Card({
  C,
  icon: Icon,
  iconColor,
  title,
  subtitle,
  trailing,
}: {
  C: ThemeTokens;
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable95
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        backgroundColor: C.bgElevated,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        padding: 13,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: C.primary50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={iconColor ?? C.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: C.fg }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ fontSize: 12.5, color: C.fgMuted, marginTop: 2 }} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {trailing}
    </Pressable95>
  );
}

// ---------------------------------------------------------------------------
// Farms tab
// ---------------------------------------------------------------------------
function FarmsTab({
  C,
  farmerId,
  navigation,
}: {
  C: ThemeTokens;
  farmerId: string;
  navigation: Props['navigation'];
}) {
  const [farms, setFarms] = useState<Farm[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setFarms(null);
    setError(null);
    api
      .listFarms({ farmerId, pageSize: 100 })
      .then((r) => active && setFarms(r.data))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Failed to load'));
    return () => {
      active = false;
    };
  }, [farmerId]);

  if (error)
    return <TabError C={C} msg={error} />;
  if (!farms) return <TabSkeleton C={C} />;
  if (farms.length === 0)
    return (
      <EmptyState
        icon={MapPin}
        title="No farms"
        hint="This farmer has no farms registered yet."
        actionLabel="Add farm"
        onAction={() => navigation.navigate('AddFarm', { farmerId })}
      />
    );

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
      {farms.map((f) => (
        <Card
          key={f._id}
          C={C}
          icon={MapPin}
          title={f.farmName}
          subtitle={`${f.address?.village ?? '—'} · ${(f.farmArea ?? 0).toFixed(1)} ac`}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Crops tab
// ---------------------------------------------------------------------------
function CropsTab({ C, farmerId }: { C: ThemeTokens; farmerId: string }) {
  const [crops, setCrops] = useState<Crop[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCrops(null);
    setError(null);
    api
      .listCrops({ farmerId, pageSize: 100 })
      .then((r) => active && setCrops(r.data))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Failed to load'));
    return () => {
      active = false;
    };
  }, [farmerId]);

  if (error) return <TabError C={C} msg={error} />;
  if (!crops) return <TabSkeleton C={C} />;
  if (crops.length === 0)
    return (
      <EmptyState
        icon={Wheat}
        title="No crops"
        hint="No crops have been mapped for this farmer yet."
      />
    );

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
      {crops.map((c) => (
        <Card
          key={c._id}
          C={C}
          icon={Sprout}
          iconColor={C.secondaryD}
          title={c.cropVariety ? `${c.cropName} · ${c.cropVariety}` : c.cropName}
          subtitle={`${c.cropType} · ${(c.acre ?? 0).toFixed(1)} ac · ${c.season}`}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Activities tab
// ---------------------------------------------------------------------------
function ActivitiesTab({ C, farmerId }: { C: ThemeTokens; farmerId: string }) {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setRows(null);
    setError(null);
    api
      .listActivities({ farmerId, pageSize: 100 })
      .then((r) => active && setRows(r.data))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Failed to load'));
    return () => {
      active = false;
    };
  }, [farmerId]);

  if (error) return <TabError C={C} msg={error} />;
  if (!rows) return <TabSkeleton C={C} />;
  if (rows.length === 0)
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No activities"
        hint="Field activities logged for this farmer will appear here."
      />
    );

  const statusColor = (s: ActivityRow['status']) =>
    s === 'Completed'
      ? C.primary
      : s === 'Overdue'
        ? C.danger
        : s === 'Cancelled'
          ? C.fgSubtle
          : C.warning;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
      {rows.map((a) => {
        const date = a.completedDate ?? a.scheduledOn ?? a.enteredDate;
        return (
          <Card
            key={a._id}
            C={C}
            icon={Calendar}
            title={a.activity}
            subtitle={date ? new Date(date).toLocaleDateString() : '—'}
            trailing={
              <View
                style={{
                  backgroundColor: C.bgMuted,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor(a.status) }}>
                  {a.status}
                </Text>
              </View>
            }
          />
        );
      })}
    </View>
  );
}

function TabError({ C, msg }: { C: ThemeTokens; msg: string }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: C.danger,
        backgroundColor: C.dangerBg,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontSize: 14, color: C.danger }}>{msg}</Text>
    </View>
  );
}
