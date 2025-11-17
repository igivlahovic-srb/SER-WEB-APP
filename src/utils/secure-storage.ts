// Secure Encrypted Storage for sensitive data
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SecureErrorHandler } from "../utils/security";

/**
 * Simple XOR-based encryption for React Native
 * NOTE: For production, consider using expo-secure-store or react-native-keychain
 * which use native hardware encryption (Keychain on iOS, Keystore on Android)
 */
class EncryptionHelper {
  private static readonly SECRET_KEY = "VIBECODE_SECURE_KEY_2025"; // In production, generate this dynamically

  /**
   * Simple XOR encryption - good enough for basic protection
   * For production: Use expo-secure-store which uses native hardware encryption
   */
  static encrypt(text: string): string {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  }

  /**
   * Decrypt XOR encrypted text
   */
  static decrypt(encrypted: string): string {
    try {
      const decoded = atob(encrypted); // Base64 decode
      let result = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch {
      return "";
    }
  }
}

/**
 * Secure Storage - Encrypted storage for sensitive data
 */
export class SecureStorage {
  private static readonly ENCRYPTED_PREFIX = "@encrypted_";

  /**
   * Store encrypted data
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = EncryptionHelper.encrypt(value);
      await AsyncStorage.setItem(this.ENCRYPTED_PREFIX + key, encrypted);
    } catch (error) {
      SecureErrorHandler.logError(error, "SecureStorage.setItem");
      throw new Error("Failed to store encrypted data");
    }
  }

  /**
   * Get and decrypt data
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const encrypted = await AsyncStorage.getItem(this.ENCRYPTED_PREFIX + key);
      if (!encrypted) {
        return null;
      }
      return EncryptionHelper.decrypt(encrypted);
    } catch (error) {
      SecureErrorHandler.logError(error, "SecureStorage.getItem");
      return null;
    }
  }

  /**
   * Store encrypted JSON object
   */
  static async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await this.setItem(key, jsonString);
    } catch (error) {
      SecureErrorHandler.logError(error, "SecureStorage.setObject");
      throw new Error("Failed to store encrypted object");
    }
  }

  /**
   * Get and decrypt JSON object
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.getItem(key);
      if (!jsonString) {
        return null;
      }
      return JSON.parse(jsonString) as T;
    } catch (error) {
      SecureErrorHandler.logError(error, "SecureStorage.getObject");
      return null;
    }
  }

  /**
   * Remove encrypted item
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ENCRYPTED_PREFIX + key);
    } catch (error) {
      SecureErrorHandler.logError(error, "SecureStorage.removeItem");
    }
  }

  /**
   * Remove multiple encrypted items
   */
  static async multiRemove(keys: string[]): Promise<void> {
    try {
      const prefixedKeys = keys.map((key) => this.ENCRYPTED_PREFIX + key);
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
      SecureErrorHandler.logError(error, "SecureStorage.multiRemove");
    }
  }

  /**
   * Clear all encrypted items
   */
  static async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const encryptedKeys = allKeys.filter((key) =>
        key.startsWith(this.ENCRYPTED_PREFIX)
      );
      await AsyncStorage.multiRemove(encryptedKeys);
    } catch (error) {
      SecureErrorHandler.logError(error, "SecureStorage.clear");
    }
  }
}

/**
 * Sensitive Data Manager - Manages sensitive user data
 */
export class SensitiveDataManager {
  /**
   * Store user password hash (encrypted)
   */
  static async storePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await SecureStorage.setItem(`password_${userId}`, passwordHash);
  }

  /**
   * Get user password hash
   */
  static async getPasswordHash(userId: string): Promise<string | null> {
    return await SecureStorage.getItem(`password_${userId}`);
  }

  /**
   * Store API key (encrypted)
   */
  static async storeAPIKey(service: string, apiKey: string): Promise<void> {
    await SecureStorage.setItem(`apikey_${service}`, apiKey);
  }

  /**
   * Get API key
   */
  static async getAPIKey(service: string): Promise<string | null> {
    return await SecureStorage.getItem(`apikey_${service}`);
  }

  /**
   * Store user credentials (encrypted)
   */
  static async storeCredentials(
    username: string,
    password: string
  ): Promise<void> {
    await SecureStorage.setObject("user_credentials", { username, password });
  }

  /**
   * Get user credentials
   */
  static async getCredentials(): Promise<{
    username: string;
    password: string;
  } | null> {
    return await SecureStorage.getObject("user_credentials");
  }

  /**
   * Clear all sensitive data
   */
  static async clearAll(): Promise<void> {
    await SecureStorage.clear();
  }

  /**
   * Store 2FA secret (encrypted)
   */
  static async store2FASecret(userId: string, secret: string): Promise<void> {
    await SecureStorage.setItem(`2fa_${userId}`, secret);
  }

  /**
   * Get 2FA secret
   */
  static async get2FASecret(userId: string): Promise<string | null> {
    return await SecureStorage.getItem(`2fa_${userId}`);
  }
}

/**
 * PRODUCTION RECOMMENDATION:
 *
 * For production apps, replace this implementation with:
 * - expo-secure-store (Expo apps) - Uses iOS Keychain and Android Keystore
 * - react-native-keychain (bare React Native) - Hardware-backed encryption
 *
 * These libraries provide:
 * - Hardware-backed encryption
 * - Biometric authentication integration
 * - OS-level security
 * - Protection against rooted/jailbroken devices
 *
 * Example usage with expo-secure-store:
 *
 * import * as SecureStore from 'expo-secure-store';
 *
 * await SecureStore.setItemAsync('secure_token', token);
 * const token = await SecureStore.getItemAsync('secure_token');
 */
