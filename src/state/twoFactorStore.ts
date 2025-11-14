import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

// Generate a random secret for 2FA
const generateSecret = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // Base32 characters
  let secret = "";
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
};

// Generate TOTP code (Time-based One-Time Password)
const generateTOTP = async (secret: string): Promise<string> => {
  const time = Math.floor(Date.now() / 1000);
  const timeHex = Math.floor(time / 30).toString(16).padStart(16, "0");

  // Simple TOTP implementation for demo
  // In production, use a proper TOTP library
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    secret + timeHex
  );

  const code = parseInt(hash.substring(0, 6), 16) % 1000000;
  return code.toString().padStart(6, "0");
};

// Verify TOTP code with time window
const verifyTOTP = async (secret: string, code: string): Promise<boolean> => {
  // Check current time window and ±1 window (30 seconds each)
  for (let i = -1; i <= 1; i++) {
    const time = Math.floor(Date.now() / 1000) + i * 30;
    const timeHex = Math.floor(time / 30).toString(16).padStart(16, "0");

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      secret + timeHex
    );

    const expectedCode = parseInt(hash.substring(0, 6), 16) % 1000000;
    const expectedCodeStr = expectedCode.toString().padStart(6, "0");

    if (expectedCodeStr === code) {
      return true;
    }
  }

  return false;
};

interface TwoFactorData {
  userId: string;
  secret: string;
  enabled: boolean;
  backupCodes: string[];
}

interface TwoFactorState {
  userTwoFactorData: Record<string, TwoFactorData>;

  // Enable 2FA for a user
  enableTwoFactor: (userId: string) => { secret: string; qrData: string };

  // Verify and activate 2FA
  activateTwoFactor: (userId: string, code: string) => Promise<boolean>;

  // Disable 2FA
  disableTwoFactor: (userId: string) => void;

  // Verify 2FA code during login
  verifyCode: (userId: string, code: string) => Promise<boolean>;

  // Check if 2FA is enabled for user
  isTwoFactorEnabled: (userId: string) => boolean;

  // Get backup codes
  getBackupCodes: (userId: string) => string[];

  // Use backup code
  useBackupCode: (userId: string, code: string) => boolean;

  // Regenerate backup codes
  regenerateBackupCodes: (userId: string) => string[];
}

// Generate backup codes
const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += Math.floor(Math.random() * 10);
    }
    codes.push(code);
  }
  return codes;
};

export const useTwoFactorStore = create<TwoFactorState>()(
  persist(
    (set, get) => ({
      userTwoFactorData: {},

      enableTwoFactor: (userId: string) => {
        const secret = generateSecret();
        const backupCodes = generateBackupCodes();

        // Generate QR code data (otpauth URI)
        const qrData = `otpauth://totp/LaFantanaWHS:${userId}?secret=${secret}&issuer=LaFantanaWHS`;

        // Store with enabled: false until verified
        set((state) => ({
          userTwoFactorData: {
            ...state.userTwoFactorData,
            [userId]: {
              userId,
              secret,
              enabled: false,
              backupCodes,
            },
          },
        }));

        return { secret, qrData };
      },

      activateTwoFactor: async (userId: string, code: string) => {
        const data = get().userTwoFactorData[userId];
        if (!data) return false;

        const isValid = await verifyTOTP(data.secret, code);

        if (isValid) {
          set((state) => ({
            userTwoFactorData: {
              ...state.userTwoFactorData,
              [userId]: {
                ...data,
                enabled: true,
              },
            },
          }));
          return true;
        }

        return false;
      },

      disableTwoFactor: (userId: string) => {
        set((state) => {
          const newData = { ...state.userTwoFactorData };
          delete newData[userId];
          return { userTwoFactorData: newData };
        });
      },

      verifyCode: async (userId: string, code: string) => {
        const data = get().userTwoFactorData[userId];
        if (!data || !data.enabled) return false;

        return await verifyTOTP(data.secret, code);
      },

      isTwoFactorEnabled: (userId: string) => {
        const data = get().userTwoFactorData[userId];
        return data?.enabled || false;
      },

      getBackupCodes: (userId: string) => {
        const data = get().userTwoFactorData[userId];
        return data?.backupCodes || [];
      },

      useBackupCode: (userId: string, code: string) => {
        const data = get().userTwoFactorData[userId];
        if (!data || !data.enabled) return false;

        const codeIndex = data.backupCodes.indexOf(code);
        if (codeIndex === -1) return false;

        // Remove used backup code
        set((state) => ({
          userTwoFactorData: {
            ...state.userTwoFactorData,
            [userId]: {
              ...data,
              backupCodes: data.backupCodes.filter((_, i) => i !== codeIndex),
            },
          },
        }));

        return true;
      },

      regenerateBackupCodes: (userId: string) => {
        const data = get().userTwoFactorData[userId];
        if (!data) return [];

        const newBackupCodes = generateBackupCodes();

        set((state) => ({
          userTwoFactorData: {
            ...state.userTwoFactorData,
            [userId]: {
              ...data,
              backupCodes: newBackupCodes,
            },
          },
        }));

        return newBackupCodes;
      },
    }),
    {
      name: "two-factor-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
