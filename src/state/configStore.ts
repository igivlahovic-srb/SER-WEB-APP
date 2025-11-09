import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OperationTemplate, SparePartTemplate } from "../types";
import { useSyncStore } from "./syncStore";

interface ConfigState {
  operations: OperationTemplate[];
  spareParts: SparePartTemplate[];
  lastConfigSync: Date | null;
  isLoading: boolean;
  setOperations: (operations: OperationTemplate[]) => void;
  setSpareParts: (spareParts: SparePartTemplate[]) => void;
  fetchConfig: () => Promise<boolean>;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      operations: [],
      spareParts: [],
      lastConfigSync: null,
      isLoading: false,

      setOperations: (operations) => set({ operations }),

      setSpareParts: (spareParts) => set({ spareParts }),

      fetchConfig: async () => {
        set({ isLoading: true });
        try {
          const apiUrl = useSyncStore.getState().apiUrl;

          // Fetch operations
          const opsResponse = await fetch(`${apiUrl}/api/config/operations`);
          const opsData = await opsResponse.json();

          if (!opsData.success) {
            set({ isLoading: false });
            return false;
          }

          // Fetch spare parts
          const partsResponse = await fetch(`${apiUrl}/api/config/spare-parts`);
          const partsData = await partsResponse.json();

          if (!partsData.success) {
            set({ isLoading: false });
            return false;
          }

          set({
            operations: opsData.data.operations || [],
            spareParts: partsData.data.spareParts || [],
            lastConfigSync: new Date(),
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error("Error fetching config:", error);
          set({ isLoading: false });
          return false;
        }
      },
    }),
    {
      name: "config-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
