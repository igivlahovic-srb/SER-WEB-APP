import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock users for demo - in production, this would call an API
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "Administrator",
    role: "super_user",
  },
  {
    id: "2",
    username: "marko",
    password: "marko123",
    name: "Marko Petrović",
    role: "technician",
  },
  {
    id: "3",
    username: "jovan",
    password: "jovan123",
    name: "Jovan Nikolić",
    role: "technician",
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
