import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./src/navigation/RootNavigator";
import { useEffect } from "react";
import { checkForUpdatesOnStart } from "./src/services/auto-update";
import { liveSyncService } from "./src/services/live-sync";
import { useSyncStore } from "./src/state/syncStore";
import { useAuthStore } from "./src/state/authStore";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project.
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

// La Fantana WHS v2.2.0 - Live Sync: Real-time bidirectional sync with web portal (5-second polling)
export default function App() {
  useEffect(() => {
    // Check for updates on app start
    checkForUpdatesOnStart();

    // Start live sync service when app starts
    const syncStore = useSyncStore.getState();
    const authStore = useAuthStore.getState();

    // Only start live sync if:
    // 1. Portal URL is configured
    // 2. User is authenticated
    // 3. Live update is enabled (will be true by default after Settings screen update)
    const startLiveSync = () => {
      if (syncStore.apiUrl && syncStore.apiUrl !== "http://localhost:3000" && authStore.isAuthenticated) {
        console.log("[App] Starting live sync service...");
        liveSyncService.start({
          enabled: true,
          pollIntervalMs: 5000, // 5 seconds as requested
          autoReconnect: true, // Keep trying even if portal is offline
        });
      }
    };

    // Initial start
    startLiveSync();

    // Cleanup: stop live sync when app unmounts
    return () => {
      console.log("[App] Stopping live sync service...");
      liveSyncService.stop();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
