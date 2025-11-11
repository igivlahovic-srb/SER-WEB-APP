import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import webAdminAPI from "../api/web-admin-sync";

interface SyncState {
  apiUrl: string;
  autoSync: boolean;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  liveUpdateEnabled: boolean;
  liveUpdateInterval: number; // in seconds
  setApiUrl: (url: string) => void;
  setAutoSync: (enabled: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLiveUpdateEnabled: (enabled: boolean) => void;
  setLiveUpdateInterval: (interval: number) => void;
  testConnection: () => Promise<boolean>;
  getBackups: () => Promise<any[]>;
  createBackup: () => Promise<boolean>;
  restoreBackup: (filename: string) => Promise<boolean>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      apiUrl: "",
      autoSync: false,
      lastSyncTime: null,
      isSyncing: false,
      liveUpdateEnabled: false,
      liveUpdateInterval: 30, // 30 seconds default

      setApiUrl: (url: string) => {
        console.log("[SyncStore] Setting API URL to:", url);
        webAdminAPI.setApiUrl(url);
        set({ apiUrl: url });
      },

      setAutoSync: (enabled: boolean) => {
        console.log("[SyncStore] Setting auto sync to:", enabled);
        set({ autoSync: enabled });
      },

      setLastSyncTime: (time: Date) => {
        console.log("[SyncStore] Setting last sync time to:", time);
        set({ lastSyncTime: time });
      },

      setIsSyncing: (syncing: boolean) => {
        console.log("[SyncStore] Setting is syncing to:", syncing);
        set({ isSyncing: syncing });
      },

      setLiveUpdateEnabled: (enabled: boolean) => {
        console.log("[SyncStore] Setting live update enabled to:", enabled);
        set({ liveUpdateEnabled: enabled });
      },

      setLiveUpdateInterval: (interval: number) => {
        console.log("[SyncStore] Setting live update interval to:", interval);
        set({ liveUpdateInterval: interval });
      },

      testConnection: async () => {
        const currentUrl = get().apiUrl;
        console.log("[SyncStore] Testing connection to:", currentUrl);

        // Ensure webAdminAPI has the correct URL
        if (currentUrl) {
          webAdminAPI.setApiUrl(currentUrl);
        }

        const result = await webAdminAPI.testConnection();
        console.log("[SyncStore] Connection test result:", result);
        return result.success;
      },

      getBackups: async () => {
        const result = await webAdminAPI.getBackups();
        if (result.success && result.data?.backups) {
          return result.data.backups;
        }
        return [];
      },

      createBackup: async () => {
        const result = await webAdminAPI.createBackup();
        return result.success;
      },

      restoreBackup: async (filename: string) => {
        const result = await webAdminAPI.restoreBackup(filename);
        return result.success;
      },
    }),
    {
      name: "sync-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // After hydration, ensure webAdminAPI has the correct URL
        if (state?.apiUrl) {
          console.log("[SyncStore] Rehydrated with API URL:", state.apiUrl);
          webAdminAPI.setApiUrl(state.apiUrl);
        } else {
          console.log("[SyncStore] No API URL found after rehydration");
        }
      },
    }
  )
);
