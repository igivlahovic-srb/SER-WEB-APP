import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  allUsers: Array<User & { password: string }>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: User & { password: string }) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
}

// Mock users for demo - in production, this would call an API
const INITIAL_USERS: Array<User & { password: string }> = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "Administrator",
    role: "super_user",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    username: "marko",
    password: "marko123",
    name: "Marko Petrović",
    role: "technician",
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    username: "jovan",
    password: "jovan123",
    name: "Jovan Nikolić",
    role: "technician",
    isActive: true,
    createdAt: new Date("2024-02-01"),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      allUsers: INITIAL_USERS,
      login: async (username: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = get().allUsers.find(
          (u) => u.username === username && u.password === password && u.isActive
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
      addUser: (user) => {
        set((state) => ({
          allUsers: [...state.allUsers, user],
        }));
      },
      updateUser: (id, updates) => {
        set((state) => ({
          allUsers: state.allUsers.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },
      deleteUser: (id) => {
        set((state) => ({
          allUsers: state.allUsers.filter((u) => u.id !== id),
        }));
      },
      toggleUserActive: (id) => {
        set((state) => ({
          allUsers: state.allUsers.map((u) =>
            u.id === id ? { ...u, isActive: !u.isActive } : u
          ),
        }));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
