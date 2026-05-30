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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default sentry.wrap(App);
