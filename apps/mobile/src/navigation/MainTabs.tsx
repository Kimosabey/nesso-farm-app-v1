import { Pressable, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { FarmersScreen } from '@/screens/FarmersScreen';
import { RegisterFarmerScreen } from '@/screens/RegisterFarmerScreen';
import { FarmsPlaceholderScreen } from '@/screens/FarmsPlaceholderScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Farmers: undefined;
  Register: undefined;
  Farms: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home-outline',
  Farmers: 'people-outline',
  Register: 'add',
  Farms: 'map-outline',
  Settings: 'settings-outline',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0D783C',
        tabBarInactiveTintColor: '#7A8A82',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: undefined, // uses system sans
        },
        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: undefined, // resolved via className below
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.08)',
        },
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
      <Tab.Screen name="Farms" component={FarmsPlaceholderScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
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
        marginBottom: 16,
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
