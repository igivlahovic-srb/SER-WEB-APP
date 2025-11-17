/**
 * Live Synchronization Service
 *
 * Enables real-time sync between mobile app and web portal with:
 * - 5-second polling when connected
 * - Offline-first approach (app works without portal)
 * - Auto-reconnect when portal becomes available
 * - No disruption to app functionality
 */

import webAdminAPI from "../api/web-admin-sync";
import { useAuthStore } from "../state/authStore";
import { useServiceStore } from "../state/serviceStore";
import { useSyncStore } from "../state/syncStore";

export interface LiveSyncConfig {
  enabled: boolean;
  pollIntervalMs: number;
  autoReconnect: boolean;
}

export class LiveSyncService {
  private pollInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;
  private isSyncing: boolean = false;
  private consecutiveFailures: number = 0;
  private maxConsecutiveFailures: number = 3;

  private config: LiveSyncConfig = {
    enabled: false,
    pollIntervalMs: 5000, // 5 seconds
    autoReconnect: true,
  };

  constructor() {
    // Initialize with default config
  }

  /**
   * Start live sync with optional custom config
   */
  public start(config?: Partial<LiveSyncConfig>): void {
    if (this.isPolling) {
      console.log("Live sync already running");
      return;
    }

    // Merge with custom config
    this.config = {
      ...this.config,
      ...config,
      enabled: true,
    };

    console.log("Starting live sync service...", this.config);
    this.isPolling = true;
    this.consecutiveFailures = 0;

    // Initial sync
    this.performSync();

    // Start polling interval
    this.pollInterval = setInterval(() => {
      this.performSync();
    }, this.config.pollIntervalMs);
  }

  /**
   * Stop live sync
   */
  public stop(): void {
    if (!this.isPolling) {
      return;
    }

    console.log("Stopping live sync service...");
    this.isPolling = false;
    this.config.enabled = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Check if sync is currently running
   */
  public isRunning(): boolean {
    return this.isPolling;
  }

  /**
   * Get current configuration
   */
  public getConfig(): LiveSyncConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (will restart if running)
   */
  public updateConfig(newConfig: Partial<LiveSyncConfig>): void {
    const wasRunning = this.isPolling;

    if (wasRunning) {
      this.stop();
    }

    this.config = {
      ...this.config,
      ...newConfig,
    };

    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }

  /**
   * Perform a single sync cycle
   */
  private async performSync(): Promise<void> {
    // Skip if already syncing
    if (this.isSyncing) {
      return;
    }

    // Skip if disabled
    if (!this.config.enabled) {
      return;
    }

    this.isSyncing = true;

    try {
      // Get stores
      const authStore = useAuthStore.getState();
      const serviceStore = useServiceStore.getState();
      const syncStore = useSyncStore.getState();

      // Check if portal is configured
      const portalUrl = syncStore.apiUrl;
      if (!portalUrl || portalUrl === "http://localhost:3000") {
        // Portal not configured, skip silently
        this.isSyncing = false;
        return;
      }

      // Update API URL
      webAdminAPI.setApiUrl(portalUrl);

      // Test connection first
      const connectionTest = await webAdminAPI.testConnection();

      if (!connectionTest.success) {
        // Portal not available - this is OK, app continues working
        this.handleSyncFailure();
        this.isSyncing = false;
        return;
      }

      // Connection successful - reset failure counter
      this.consecutiveFailures = 0;

      // BIDIRECTIONAL SYNC:
      // 1. Push local changes to portal
      await this.pushLocalChanges();

      // 2. Pull remote changes from portal
      await this.pullRemoteChanges();

      // Update last sync time
      syncStore.setLastSyncTime(new Date());

    } catch (error) {
      console.error("Live sync error:", error);
      this.handleSyncFailure();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Push local changes to portal
   */
  private async pushLocalChanges(): Promise<void> {
    const authStore = useAuthStore.getState();
    const serviceStore = useServiceStore.getState();

    // Get all users (if super admin)
    const users = authStore.user?.role === "super_user"
      ? authStore.allUsers
      : [authStore.user].filter(Boolean);

    // Get all tickets
    const tickets = serviceStore.tickets;

    // Push to portal
    if (users.length > 0) {
      await webAdminAPI.syncUsers(users);
    }

    if (tickets.length > 0) {
      await webAdminAPI.syncTickets(tickets);
    }
  }

  /**
   * Pull remote changes from portal
   */
  private async pullRemoteChanges(): Promise<void> {
    const authStore = useAuthStore.getState();
    const serviceStore = useServiceStore.getState();

    // Fetch data from portal
    const result = await webAdminAPI.fetchAllData();

    if (!result.success || !result.data) {
      return;
    }

    // Update users (only for super admin)
    if (authStore.user?.role === "super_user" && result.data.users) {
      const remoteUsers = result.data.users.users || [];

      // Merge users - prefer remote version if timestamps differ
      const localUsers = authStore.allUsers;
      const mergedUsers = this.mergeUsers(localUsers, remoteUsers);

      // Update auth store with merged users (need to update all users in store)
      const state = useAuthStore.getState();
      state.allUsers.splice(0, state.allUsers.length, ...mergedUsers);
    }

    // Update tickets
    if (result.data.tickets) {
      const remoteTickets = result.data.tickets.tickets || [];

      // Merge tickets - prefer remote version for conflicts
      const localTickets = serviceStore.tickets;
      const mergedTickets = this.mergeTickets(localTickets, remoteTickets);

      // Update service store with merged tickets (need to update tickets in store)
      const state = useServiceStore.getState();
      state.tickets.splice(0, state.tickets.length, ...mergedTickets);
    }
  }

  /**
   * Merge local and remote users (prefer newer)
   */
  private mergeUsers(local: any[], remote: any[]): any[] {
    const merged = new Map();

    // Add all local users
    local.forEach(user => {
      merged.set(user.id, user);
    });

    // Merge with remote users (remote wins if newer)
    remote.forEach(remoteUser => {
      const localUser = merged.get(remoteUser.id);

      if (!localUser) {
        // New user from remote
        merged.set(remoteUser.id, remoteUser);
      } else {
        // Compare timestamps if available
        const localTime = localUser.updatedAt ? new Date(localUser.updatedAt).getTime() : 0;
        const remoteTime = remoteUser.updatedAt ? new Date(remoteUser.updatedAt).getTime() : 0;

        // Use remote if newer or if no timestamps
        if (remoteTime >= localTime) {
          merged.set(remoteUser.id, remoteUser);
        }
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Merge local and remote tickets (prefer newer)
   */
  private mergeTickets(local: any[], remote: any[]): any[] {
    const merged = new Map();

    // Add all local tickets
    local.forEach(ticket => {
      merged.set(ticket.id, ticket);
    });

    // Merge with remote tickets (remote wins if newer)
    remote.forEach(remoteTicket => {
      const localTicket = merged.get(remoteTicket.id);

      if (!localTicket) {
        // New ticket from remote
        merged.set(remoteTicket.id, remoteTicket);
      } else {
        // Compare timestamps
        const localTime = localTicket.updatedAt ? new Date(localTicket.updatedAt).getTime() : 0;
        const remoteTime = remoteTicket.updatedAt ? new Date(remoteTicket.updatedAt).getTime() : 0;

        // Use remote if newer
        if (remoteTime >= localTime) {
          merged.set(remoteTicket.id, remoteTicket);
        }
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Handle sync failure
   */
  private handleSyncFailure(): void {
    this.consecutiveFailures++;

    // If too many failures and auto-reconnect is disabled, stop polling
    if (this.consecutiveFailures >= this.maxConsecutiveFailures && !this.config.autoReconnect) {
      console.log("Too many consecutive failures, stopping live sync");
      this.stop();
    }

    // Otherwise, keep trying (offline-first approach)
  }

  /**
   * Force a sync now (manual trigger)
   */
  public async syncNow(): Promise<boolean> {
    if (this.isSyncing) {
      console.log("Sync already in progress");
      return false;
    }

    try {
      await this.performSync();
      return true;
    } catch (error) {
      console.error("Manual sync failed:", error);
      return false;
    }
  }
}

// Singleton instance
export const liveSyncService = new LiveSyncService();

export default liveSyncService;
