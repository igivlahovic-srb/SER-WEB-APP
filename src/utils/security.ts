// Security utilities for production-ready application

/**
 * Rate Limiter - Prevents DDoS attacks by limiting API calls
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   * @param identifier - Usually endpoint name or user ID
   * @returns true if request is allowed, false if rate limit exceeded
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];

    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  /**
   * Clear rate limit for identifier
   */
  clear(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

/**
 * Input Sanitizer - Prevents XSS and injection attacks
 */
export class InputSanitizer {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== "string") {
      return "";
    }

    return input
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .trim();
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== "string") {
      return "";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sanitized = email.toLowerCase().trim();

    return emailRegex.test(sanitized) ? sanitized : "";
  }

  /**
   * Sanitize phone number (remove non-digits)
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== "string") {
      return "";
    }

    return phone.replace(/[^\d+]/g, "");
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== "string") {
      return "";
    }

    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return "";
      }
      return parsed.toString();
    } catch {
      return "";
    }
  }

  /**
   * Sanitize object by recursively sanitizing all string values
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj } as any;

    for (const key in sanitized) {
      if (typeof sanitized[key] === "string") {
        sanitized[key] = this.sanitizeString(sanitized[key]);
      } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized as T;
  }
}

/**
 * Input Validator - Validates data before processing
 */
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (basic validation)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate password strength
   * - At least 8 characters
   * - Contains uppercase and lowercase
   * - Contains number
   */
  static isValidPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain a number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate string length
   */
  static isValidLength(
    str: string,
    min: number = 0,
    max: number = 1000
  ): boolean {
    return str.length >= min && str.length <= max;
  }

  /**
   * Validate required fields in object
   */
  static hasRequiredFields<T extends Record<string, any>>(
    obj: T,
    requiredFields: (keyof T)[]
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (!obj[field] || obj[field] === "") {
        missing.push(field as string);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

/**
 * Secure Error Handler - Prevents exposing internal details
 */
export class SecureErrorHandler {
  /**
   * Get user-friendly error message without exposing internal details
   */
  static getUserMessage(error: any): string {
    if (error instanceof Error) {
      // Map known errors to user-friendly messages
      if (error.message.includes("Network request failed")) {
        return "Cannot connect to server. Check your internet connection.";
      }
      if (error.message.includes("timeout")) {
        return "Request timed out. Please try again.";
      }
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        return "Your session has expired. Please login again.";
      }
      if (error.message.includes("403") || error.message.includes("Forbidden")) {
        return "You do not have permission to perform this action.";
      }
      if (error.message.includes("404")) {
        return "Requested resource not found.";
      }
      if (error.message.includes("500")) {
        return "Server error. Please try again later.";
      }
    }

    // Generic error message (never expose internal details)
    return "Something went wrong. Please try again.";
  }

  /**
   * Log error for debugging (only in development)
   */
  static logError(error: any, context?: string): void {
    // Only log in development
    if (__DEV__) {
      console.error(`[Security Error${context ? ` - ${context}` : ""}]:`, error);
    }
  }
}

/**
 * Token Manager - Secure token handling
 */
export class TokenManager {
  private static readonly TOKEN_KEY = "@secure_token";
  private static readonly REFRESH_KEY = "@refresh_token";

  /**
   * Check if token is expired or about to expire
   */
  static isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
    try {
      // Decode JWT token (basic parsing without verification)
      const parts = token.split(".");
      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const bufferMs = bufferMinutes * 60 * 1000;

      return now >= expiresAt - bufferMs;
    } catch {
      return true; // If we can't parse, consider it expired
    }
  }

  /**
   * Extract user ID from token
   */
  static extractUserId(token: string): string | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  }
}

/**
 * Request Logger - Track API requests for monitoring
 */
export class RequestLogger {
  private static logs: Array<{
    endpoint: string;
    method: string;
    timestamp: number;
    status?: number;
    duration?: number;
  }> = [];

  /**
   * Log API request
   */
  static logRequest(
    endpoint: string,
    method: string,
    status?: number,
    duration?: number
  ): void {
    this.logs.push({
      endpoint,
      method,
      timestamp: Date.now(),
      status,
      duration,
    });

    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  /**
   * Get recent logs
   */
  static getLogs(limit: number = 50): typeof RequestLogger.logs {
    return this.logs.slice(-limit);
  }

  /**
   * Get failed requests
   */
  static getFailedRequests(): typeof RequestLogger.logs {
    return this.logs.filter(
      (log) => log.status && (log.status >= 400 || log.status === 0)
    );
  }

  /**
   * Clear logs
   */
  static clearLogs(): void {
    this.logs = [];
  }
}

// Export rate limiter instances for different endpoints
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 login attempts per 5 minutes
export const syncRateLimiter = new RateLimiter(20, 60000); // 20 sync requests per minute
