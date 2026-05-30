import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, MapPin, Wheat, Activity, FileText } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { api, type Farmer } from '@/api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmerProfile'>;

const TABS = ['Overview', 'Farms', 'Crops', 'Activities', 'Documents'] as const;
type Tab = (typeof TABS)[number];

export function FarmerProfileScreen({ route, navigation }: Props) {
  const { farmerId } = route.params;
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.farmerById(farmerId);
      setFarmer(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load farmer');
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const initials = farmer
    ? (
        (farmer.firstName[0] ?? '').toUpperCase() +
        (farmer.lastName?.[0] ?? '').toUpperCase()
      ).trim() || '?'
    : '?';

  const approvalTone =
    farmer?.approvalStatus === 'approved'
      ? { bg: 'bg-success/20', text: 'text-success', border: 'border-success/40' }
      : farmer?.approvalStatus === 'rejected'
        ? { bg: 'bg-danger/20', text: 'text-danger', border: 'border-danger/40' }
        : { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/40' };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <View className="bg-primary px-4 pb-5 pt-2">
        {/* Back button */}
        <Pressable onPress={() => navigation.goBack()} className="mb-3 self-start p-1">
          <ChevronLeft size={24} color="#fff" />
        </Pressable>

        {loading ? (
          <View className="items-center py-4">
            <ActivityIndicator color="#fff" />
          </View>
        ) : farmer ? (
          <View className="items-center gap-2">
            {/* Avatar */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 22 }}>{initials}</Text>
            </View>

            {/* Name */}
            <Text
              className="font-display text-white"
              style={{ fontSize: 22, fontWeight: '700', textAlign: 'center' }}
            >
              {farmer.firstName} {farmer.lastName ?? ''}
            </Text>

            {/* Farmer ID */}
            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Courier',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              {farmer.farmerId}
            </Text>

            {/* Status badges */}
            <View className="flex-row gap-2">
              <View
                className={`rounded-full border px-3 py-0.5 ${approvalTone.border} ${approvalTone.bg}`}
              >
                <Text className={`text-xs font-medium ${approvalTone.text}`}>
                  {farmer.approvalStatus}
                </Text>
              </View>
              {farmer.groupAssociation ? (
                <View className="rounded-full border border-white/30 bg-white/10 px-3 py-0.5">
                  <Text className="text-xs font-medium text-white/90">
                    {farmer.groupAssociation}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Tab bar                                                              */}
      {/* ------------------------------------------------------------------ */}
      <View className="flex-row border-b border-border bg-bg-elevated">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="px-4 py-3"
                style={{ position: 'relative' }}
              >
                <Text
                  className={`text-sm font-medium ${active ? 'text-primary' : 'text-fg-subtle'}`}
                >
                  {tab}
                </Text>
                {active ? (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 16,
                      right: 16,
                      height: 2,
                      backgroundColor: '#0D783C',
                      borderRadius: 1,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Tab content                                                          */}
      {/* ------------------------------------------------------------------ */}
      {error ? (
        <View className="mx-4 mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0D783C" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {activeTab === 'Overview' && farmer ? (
            <OverviewTab farmer={farmer} />
          ) : activeTab === 'Farms' ? (
            <EmptyTab icon={<MapPin size={40} color="rgba(13,120,60,0.4)" />} label="farms" />
          ) : activeTab === 'Crops' ? (
            <EmptyTab icon={<Wheat size={40} color="rgba(13,120,60,0.4)" />} label="crops" />
          ) : activeTab === 'Activities' ? (
            <EmptyTab
              icon={<Activity size={40} color="rgba(13,120,60,0.4)" />}
              label="activities"
            />
          ) : activeTab === 'Documents' ? (
            <EmptyTab
              icon={<FileText size={40} color="rgba(13,120,60,0.4)" />}
              label="documents"
            />
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------
function OverviewTab({ farmer }: { farmer: Farmer }) {
  const rows: Array<{ label: string; value: string | undefined }> = [
    { label: 'Mobile', value: farmer.mobileNumber },
    { label: 'State', value: farmer.address?.state },
    { label: 'District', value: farmer.address?.district },
    { label: 'Village', value: farmer.address?.village },
    { label: 'Pincode', value: farmer.address?.pincode },
    { label: 'Practice', value: farmer.productionPractice },
    { label: 'Agent', value: farmer.isFlowerAgent ? 'Yes' : 'No' },
    { label: 'Group', value: farmer.groupAssociation },
  ];

  return (
    <View className="px-4 pt-2">
      {rows.map(({ label, value }) => (
        <View
          key={label}
          className="flex-row items-center border-b border-border py-3"
        >
          <Text className="w-24 text-sm text-fg-subtle">{label}</Text>
          <Text className="flex-1 text-sm font-medium text-fg">{value ?? '—'}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Empty state for stub tabs
// ---------------------------------------------------------------------------
function EmptyTab({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="mt-16 items-center gap-3">
      {icon}
      <Text className="text-sm text-fg-subtle">No {label} yet</Text>
    </View>
  );
}
