import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Application from "expo-application";

interface LoginHistory {
  userId: string;
  username: string;
  name: string;
  loginTime: Date;
}

interface DeviceState {
  deviceId: string | null;
  deviceName: string | null;
  loginHistory: LoginHistory[];
  initializeDevice: () => Promise<void>;
  recordLogin: (userId: string, username: string, name: string) => void;
  getUniqueUsersCount: () => number;
  getLoginCount: () => number;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      deviceId: null,
      deviceName: null,
      loginHistory: [],

      initializeDevice: async () => {
        try {
          // Get unique device identifier
          let deviceId = "unknown";
          try {
            const androidId = await Application.getAndroidId();
            deviceId = androidId || Device.modelName || "unknown";
          } catch {
            deviceId = Device.modelName || "unknown";
          }

          const deviceName = Device.deviceName || Device.modelName || "Unknown Device";

          set({
            deviceId,
            deviceName,
          });
        } catch (error) {
          console.error("Failed to initialize device:", error);
          set({
            deviceId: "unknown",
            deviceName: "Unknown Device",
          });
        }
      },

      recordLogin: (userId: string, username: string, name: string) => {
        set((state) => ({
          loginHistory: [
            ...state.loginHistory,
            {
              userId,
              username,
              name,
              loginTime: new Date(),
            },
          ],
        }));
      },

      getUniqueUsersCount: () => {
        const history = get().loginHistory;
        const uniqueUserIds = new Set(history.map((entry) => entry.userId));
        return uniqueUserIds.size;
      },

      getLoginCount: () => {
        return get().loginHistory.length;
      },
    }),
    {
      name: "device-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
