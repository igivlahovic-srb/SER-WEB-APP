// Secure Authentication Service with Token Management
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TokenManager, SecureErrorHandler, authRateLimiter } from "../utils/security";

const TOKEN_KEY = "@secure_token";
const REFRESH_TOKEN_KEY = "@refresh_token";
const TOKEN_EXPIRY_KEY = "@token_expiry";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthService {
  private static refreshPromise: Promise<boolean> | null = null;

  /**
   * Store authentication tokens securely
   */
  static async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, tokens.accessToken],
        [REFRESH_TOKEN_KEY, tokens.refreshToken],
        [TOKEN_EXPIRY_KEY, tokens.expiresAt.toString()],
      ]);
    } catch (error) {
      SecureErrorHandler.logError(error, "storeTokens");
      throw new Error("Failed to store authentication tokens");
    }
  }

  /**
   * Get current access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        return null;
      }

      // Check if token is expired
      if (TokenManager.isTokenExpired(token, 5)) {
        // Token expired or about to expire, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return await AsyncStorage.getItem(TOKEN_KEY);
        }
        return null;
      }

      return token;
    } catch (error) {
      SecureErrorHandler.logError(error, "getAccessToken");
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      SecureErrorHandler.logError(error, "getRefreshToken");
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  /**
   * Internal method to perform token refresh
   */
  private static async _performRefresh(): Promise<boolean> {
    try {
      // Rate limiting check
      if (!authRateLimiter.isAllowed("tokenRefresh")) {
        SecureErrorHandler.logError(
          new Error("Too many token refresh attempts"),
          "refreshAccessToken"
        );
        return false;
      }

      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      // TODO: Replace with your actual API endpoint
      // For now, this is a placeholder that shows the structure
      const response = await fetch("YOUR_API_URL/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      if (data.accessToken && data.refreshToken) {
        await this.storeTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt || Date.now() + 3600000, // Default 1 hour
        });
        return true;
      }

      return false;
    } catch (error) {
      SecureErrorHandler.logError(error, "refreshAccessToken");
      // On refresh failure, clear all tokens
      await this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all authentication tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        TOKEN_EXPIRY_KEY,
      ]);
    } catch (error) {
      SecureErrorHandler.logError(error, "clearTokens");
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Create authenticated fetch request with automatic token refresh
   */
  static async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get 401, token might be invalid, try refresh once
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        const newToken = await this.getAccessToken();
        if (newToken) {
          headers.set("Authorization", `Bearer ${newToken}`);
          return await fetch(url, {
            ...options,
            headers,
          });
        }
      }
    }

    return response;
  }

  /**
   * Login with credentials
   */
  static async login(username: string, password: string): Promise<AuthTokens | null> {
    try {
      // Rate limiting check
      if (!authRateLimiter.isAllowed("login")) {
        throw new Error("Too many login attempts. Please wait before trying again.");
      }

      // TODO: Replace with your actual login endpoint
      const response = await fetch("YOUR_API_URL/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      if (data.accessToken && data.refreshToken) {
        const tokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt || Date.now() + 3600000,
        };

        await this.storeTokens(tokens);
        return tokens;
      }

      return null;
    } catch (error) {
      SecureErrorHandler.logError(error, "login");
      throw error;
    }
  }

  /**
   * Logout - clear all tokens
   */
  static async logout(): Promise<void> {
    await this.clearTokens();
  }
}
