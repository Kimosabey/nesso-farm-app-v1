import './global.css';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '@/screens/SplashScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { MainTabs } from '@/navigation/MainTabs';
import { sync } from '@/sync/SyncManager';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
