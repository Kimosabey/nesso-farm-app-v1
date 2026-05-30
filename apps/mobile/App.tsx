import './global.css';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '@/screens/SplashScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { DebugScreen } from '@/screens/DebugScreen';
import { MainTabs } from '@/navigation/MainTabs';
import { FarmerProfileScreen } from '@/screens/FarmerProfileScreen';
import { LanguageScreen } from '@/screens/LanguageScreen';
import { ThemeScreen } from '@/screens/ThemeScreen';
import { AboutScreen } from '@/screens/AboutScreen';
import { AddFarmScreen } from '@/screens/AddFarmScreen';
import { AddActivityScreen } from '@/screens/AddActivityScreen';
import { AcceptGRNScreen } from '@/screens/AcceptGRNScreen';
import { FarmDetailsScreen } from '@/screens/FarmDetailsScreen';
import { AddCropScreen } from '@/screens/AddCropScreen';
import { WeatherScreen } from '@/screens/WeatherScreen';
import { HarvestBoardScreen } from '@/screens/HarvestBoardScreen';
import { ActivitiesScreen } from '@/screens/ActivitiesScreen';
import { PreHarvestScreen } from '@/screens/PreHarvestScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { PostHarvestScreen } from '@/screens/PostHarvestScreen';
import { BatchesScreen } from '@/screens/BatchesScreen';
import { InventoryScreen } from '@/screens/InventoryScreen';
import { ProcurementScreen } from '@/screens/ProcurementScreen';
import { SamplesScreen } from '@/screens/SamplesScreen';
import { AuditScreen } from '@/screens/AuditScreen';
import { LocationPickerScreen } from '@/screens/LocationPickerScreen';
import { OfflineMapsScreen } from '@/screens/OfflineMapsScreen';
import { SyncScreen } from '@/screens/SyncScreen';
import { OtpScreen } from '@/screens/OtpScreen';
import type { OtpConfirmation } from '@/firebase/auth';
import { sync } from '@/sync/SyncManager';
import { initSentry, sentry } from '@/sentry';

initSentry();

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  Debug: undefined;
  FarmerProfile: { farmerId: string };
  LanguageSettings: undefined;
  ThemeSettings: undefined;
  About: undefined;
  AddFarm: { farmerId?: string };
  AddActivity: { farmId?: string; farmerId?: string };
  AcceptGRN: undefined;
  FarmDetails: { farmId: string };
  AddCrop: { farmId?: string; farmerId?: string };
  Weather: undefined;
  HarvestBoard: undefined;
  Activities: undefined;
  PreHarvest: undefined;
  Notifications: undefined;
  PostHarvest: undefined;
  Batches: undefined;
  Inventory: undefined;
  Procurement: undefined;
  Samples: undefined;
  Audit: undefined;
  LocationPicker: { lat?: number; lng?: number };
  OfflineMaps: undefined;
  Sync: undefined;
  Otp: { phone: string; confirmation: OtpConfirmation };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  useEffect(() => {
    // Start the network watcher + outbox drainer once at app boot.
    const stop = sync.start();
    return stop;
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'fade' }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Debug" component={DebugScreen} />
          <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} />
          <Stack.Screen name="LanguageSettings" component={LanguageScreen} />
          <Stack.Screen name="ThemeSettings" component={ThemeScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="AddFarm" component={AddFarmScreen} />
          <Stack.Screen name="AddActivity" component={AddActivityScreen} />
          <Stack.Screen name="AcceptGRN" component={AcceptGRNScreen} />
          <Stack.Screen name="FarmDetails" component={FarmDetailsScreen} />
          <Stack.Screen name="AddCrop" component={AddCropScreen} />
          <Stack.Screen name="Weather" component={WeatherScreen} />
          <Stack.Screen name="HarvestBoard" component={HarvestBoardScreen} />
          <Stack.Screen name="Activities" component={ActivitiesScreen} />
          <Stack.Screen name="PreHarvest" component={PreHarvestScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="PostHarvest" component={PostHarvestScreen} />
          <Stack.Screen name="Batches" component={BatchesScreen} />
          <Stack.Screen name="Inventory" component={InventoryScreen} />
          <Stack.Screen name="Procurement" component={ProcurementScreen} />
          <Stack.Screen name="Samples" component={SamplesScreen} />
          <Stack.Screen name="Audit" component={AuditScreen} />
          <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
          <Stack.Screen name="OfflineMaps" component={OfflineMapsScreen} />
          <Stack.Screen name="Sync" component={SyncScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default sentry.wrap(App);
