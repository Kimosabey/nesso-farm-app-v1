/**
 * Bottom tab bar — 100% spec parity with design handoff (ui.jsx TabBar).
 *
 * Spec: 4 tabs (Home · Farmers · Verify · Farms) with a 64px gap in the
 * center where a floating circular FAB (Register farmer) sits, lifted
 * above the bar (top: -26). Glass background, safe-area bottom padding,
 * pulsing FAB. Settings is reached via the Dashboard avatar (not a tab).
 */
import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { Home, Users, ShieldCheck, MapPin, Plus } from 'lucide-react-native';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { FarmersScreen } from '@/screens/FarmersScreen';
import { RegisterFarmerScreen } from '@/screens/RegisterFarmerScreen';
import { VerifyScreen } from '@/screens/VerifyScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { FarmsPlaceholderScreen } from '@/screens/FarmsPlaceholderScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Farmers: undefined;
  Verify: undefined;
  Farms: undefined;
  Register: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const C = {
  primary: '#0D783C',
  primary2: '#207647',
  primary50: '#EAF6EE',
  fgSubtle: '#7A8A82',
  bg: '#FAFDFA',
  bgElevated: '#FFFFFF',
  border: '#DDE6E0',
};

// Visible tabs (left pair + right pair). Register sits in the center as a FAB.
const VISIBLE: { name: keyof MainTabParamList; label: string; Icon: typeof Home }[] = [
  { name: 'Dashboard', label: 'Home', Icon: Home },
  { name: 'Farmers', label: 'Farmers', Icon: Users },
  { name: 'Verify', label: 'Verify', Icon: ShieldCheck },
  { name: 'Farms', label: 'Farms', Icon: MapPin },
];

function PulsingFab({ onPress }: { onPress: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 1100, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View style={{ position: 'absolute', left: '50%', top: -26, marginLeft: -31, zIndex: 30 }}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable
          onPress={onPress}
          accessibilityLabel="Register farmer"
          accessibilityRole="button"
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            borderWidth: 4,
            borderColor: C.bg,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.primary,
            shadowOpacity: 0.4,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;

  const renderTab = (cfg: (typeof VISIBLE)[number]) => {
    const on = activeName === cfg.name;
    const { Icon } = cfg;
    return (
      <Pressable
        key={cfg.name}
        onPress={() => navigation.navigate(cfg.name)}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          paddingVertical: 8,
        }}
      >
        <Icon
          size={23}
          color={on ? C.primary : C.fgSubtle}
          strokeWidth={on ? 2.2 : 1.7}
          fill={on ? C.primary50 : 'transparent'}
        />
        <Text
          style={{
            fontSize: 10.5,
            fontWeight: on ? '700' : '500',
            color: on ? C.primary : C.fgSubtle,
          }}
        >
          {cfg.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        backgroundColor: C.bgElevated,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingBottom: Math.max(insets.bottom, 10),
        // glass-ish elevation
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 6 }}>
        {renderTab(VISIBLE[0]!)}
        {renderTab(VISIBLE[1]!)}
        {/* center gap for the FAB */}
        <View style={{ width: 64, flexShrink: 0 }} />
        {renderTab(VISIBLE[2]!)}
        {renderTab(VISIBLE[3]!)}
      </View>
      <PulsingFab onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Farmers" component={FarmersScreen} />
      <Tab.Screen name="Verify" component={VerifyScreen} />
      <Tab.Screen name="Farms" component={FarmsPlaceholderScreen} />
      {/* Register is reached via the center FAB; not shown as a labelled tab */}
      <Tab.Screen name="Register" component={RegisterFarmerScreen} />
      {/* Settings is reached via the Dashboard avatar; not shown in the bar */}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
