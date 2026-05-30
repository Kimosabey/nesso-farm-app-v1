import { Pressable, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { FarmersScreen } from '@/screens/FarmersScreen';
import { RegisterFarmerScreen } from '@/screens/RegisterFarmerScreen';
import { VerifyScreen } from '@/screens/VerifyScreen';
import { SyncScreen } from '@/screens/SyncScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Farmers: undefined;
  Register: undefined;
  Verify: undefined;
  Sync: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home-outline',
  Farmers: 'people-outline',
  Register: 'add',
  Verify: 'checkmark-circle-outline',
  Sync: 'sync-outline',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0D783C',
        tabBarInactiveTintColor: '#7A8A82',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 8 },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Register') {
            return <FabIcon color={color} focused={focused} />;
          }
          return <Ionicons name={ICONS[route.name]} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Farmers" component={FarmersScreen} />
      <Tab.Screen
        name="Register"
        component={RegisterFarmerScreen}
        options={{ tabBarLabel: '' }}
      />
      <Tab.Screen name="Verify" component={VerifyScreen} />
      <Tab.Screen name="Sync" component={SyncScreen} />
    </Tab.Navigator>
  );
}

function FabIcon({ color: _color, focused }: { color: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0D783C',
        borderWidth: 3,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16, // lift above the tab bar
        shadowColor: '#0D783C',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      <Ionicons name="add" size={28} color={focused ? '#F1D412' : '#fff'} />
    </View>
  );
}

/**
 * Replacement for default tabBarButton if we want to suppress the label
 * under the FAB. Currently we just set tabBarLabel="" above.
 */
export function _SilentTabButton(props: React.ComponentProps<typeof Pressable>) {
  return <Pressable {...props} />;
}
