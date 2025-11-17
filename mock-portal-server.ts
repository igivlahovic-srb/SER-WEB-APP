#!/usr/bin/env bun
/**
 * Mock Web Portal Server
 *
 * Emulira web admin portal API za testiranje mobilne aplikacije.
 * Pokreće se na portu 3000 i implementira sve potrebne endpoints.
 */

// @ts-ignore - Bun runtime
import { serve } from "bun";

// In-memory "database"
let users: any[] = [];
let tickets: any[] = [];
let spareParts: any[] = [
  { ItemId: "1", ItemCode: "FILTER-001", ItemName: "Filter za vodu", unit: "kom", isActive: true },
  { ItemId: "2", ItemCode: "VALVE-001", ItemName: "Ventil", unit: "kom", isActive: true },
  { ItemId: "3", ItemCode: "TUBE-001", ItemName: "Cev", unit: "m", isActive: true },
];

// Helper za CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper za JSON response
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// Request handler
const server = serve({
  port: 3000,
  hostname: "0.0.0.0", // Listen on all network interfaces
  fetch(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`[${new Date().toISOString()}] ${method} ${path}`);

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ========================================
    // Health Check
    // ========================================
    if (path === "/api/health" && method === "GET") {
      return jsonResponse({ status: "ok", message: "Mock portal is running" });
    }

    // ========================================
    // Sync Users
    // ========================================
    if (path === "/api/sync/users" && method === "POST") {
      return req.json().then((body: any) => {
        if (!body.users || !Array.isArray(body.users)) {
          return jsonResponse(
            { success: false, message: "Invalid users array" },
            400
          );
        }

        // Store users
        users = body.users;
        console.log(`[SYNC] Received ${users.length} users from mobile app`);

        return jsonResponse({
          success: true,
          message: `Synced ${users.length} users`,
          count: users.length,
        });
      });
    }

    if (path === "/api/sync/users" && method === "GET") {
      console.log(`[SYNC] Sending ${users.length} users to mobile app`);
      return jsonResponse({
        success: true,
        users: users,
      });
    }

    // ========================================
    // Sync Tickets
    // ========================================
    if (path === "/api/sync/tickets" && method === "POST") {
      return req.json().then((body: any) => {
        if (!body.tickets || !Array.isArray(body.tickets)) {
          return jsonResponse(
            { success: false, message: "Invalid tickets array" },
            400
          );
        }

        // Store tickets
        tickets = body.tickets;
        console.log(`[SYNC] Received ${tickets.length} tickets from mobile app`);

        return jsonResponse({
          success: true,
          message: `Synced ${tickets.length} tickets`,
          count: tickets.length,
        });
      });
    }

    if (path === "/api/sync/tickets" && method === "GET") {
      console.log(`[SYNC] Sending ${tickets.length} tickets to mobile app`);
      return jsonResponse({
        success: true,
        tickets: tickets,
      });
    }

    // ========================================
    // Spare Parts
    // ========================================
    if (path === "/api/spare-parts" && method === "GET") {
      console.log(`[API] Sending ${spareParts.length} spare parts`);
      return jsonResponse({
        success: true,
        spareParts: spareParts,
      });
    }

    // ========================================
    // Workday Management
    // ========================================
    if (path === "/api/workday/close" && method === "POST") {
      return req.json().then((body: any) => {
        console.log(`[WORKDAY] Closing workday for user ${body.userId}`);
        return jsonResponse({
          success: true,
          message: "Workday closed",
        });
      });
    }

    if (path === "/api/workday/open" && method === "POST") {
      return req.json().then((body: any) => {
        console.log(`[WORKDAY] Opening workday for user ${body.userId}, reason: ${body.reason}`);
        return jsonResponse({
          success: true,
          message: "Workday opened",
        });
      });
    }

    if (path === "/api/workday/open" && method === "GET") {
      return jsonResponse({
        success: true,
        log: [],
      });
    }

    // ========================================
    // Backup System
    // ========================================
    if (path === "/api/backup" && method === "GET") {
      return jsonResponse({
        success: true,
        backups: [],
      });
    }

    if (path === "/api/backup" && method === "POST") {
      return jsonResponse({
        success: true,
        message: "Backup created (mock)",
        filename: "backup-v2.2.0-mock.tar.gz",
      });
    }

    // ========================================
    // Root - Portal Info
    // ========================================
    if (path === "/" && method === "GET") {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mock Web Portal</title>
            <style>
              body {
                font-family: system-ui;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
                background: #f5f5f5;
              }
              .card {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-bottom: 20px;
              }
              h1 { color: #1e40af; margin-top: 0; }
              h2 { color: #3b82f6; }
              .status {
                display: inline-block;
                padding: 6px 12px;
                background: #10b981;
                color: white;
                border-radius: 6px;
                font-weight: bold;
              }
              .endpoint {
                background: #f1f5f9;
                padding: 12px;
                border-radius: 6px;
                margin: 8px 0;
                font-family: monospace;
              }
              .stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-top: 20px;
              }
              .stat {
                background: #eff6ff;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
              }
              .stat-value {
                font-size: 32px;
                font-weight: bold;
                color: #1e40af;
              }
              .stat-label {
                color: #64748b;
                margin-top: 8px;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🌐 Mock Web Portal</h1>
              <p><span class="status">RUNNING</span> Port 3000</p>
              <p>Ovaj server emulira web admin portal za testiranje mobilne aplikacije.</p>
            </div>

            <div class="card">
              <h2>📊 Statistika</h2>
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${users.length}</div>
                  <div class="stat-label">Korisnika</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${tickets.length}</div>
                  <div class="stat-label">Servisa</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${spareParts.length}</div>
                  <div class="stat-label">Rezervnih delova</div>
                </div>
              </div>
            </div>

            <div class="card">
              <h2>🔌 Dostupni Endpoints</h2>
              <div class="endpoint">GET  /api/health</div>
              <div class="endpoint">POST /api/sync/users</div>
              <div class="endpoint">GET  /api/sync/users</div>
              <div class="endpoint">POST /api/sync/tickets</div>
              <div class="endpoint">GET  /api/sync/tickets</div>
              <div class="endpoint">GET  /api/spare-parts</div>
              <div class="endpoint">POST /api/workday/close</div>
              <div class="endpoint">POST /api/workday/open</div>
              <div class="endpoint">GET  /api/workday/open</div>
              <div class="endpoint">GET  /api/backup</div>
              <div class="endpoint">POST /api/backup</div>
            </div>

            <div class="card">
              <h2>📱 Kako Povezati Mobilnu Aplikaciju</h2>
              <ol>
                <li>Otvorite mobilnu aplikaciju</li>
                <li>Prijavite se (admin/admin123)</li>
                <li>Idite na <strong>Profil → Settings</strong></li>
                <li>Unesite URL: <code>http://localhost:3000</code></li>
                <li>Kliknite "Testiraj konekciju"</li>
                <li>Live sync će se automatski aktivirati!</li>
              </ol>
            </div>
          </body>
        </html>
        `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // ========================================
    // 404 Not Found
    // ========================================
    return jsonResponse(
      { success: false, message: `Endpoint not found: ${path}` },
      404
    );
  },
});

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              MOCK WEB PORTAL SERVER                              ║
╚══════════════════════════════════════════════════════════════════╝

✅ Server running on: http://localhost:${server.port}

📊 Dashboard: http://localhost:${server.port}

🔌 API Endpoints:
   - GET  /api/health
   - POST /api/sync/users
   - GET  /api/sync/users
   - POST /api/sync/tickets
   - GET  /api/sync/tickets
   - GET  /api/spare-parts
   - POST /api/workday/close
   - POST /api/workday/open

📱 Za mobilnu aplikaciju:
   1. Otvorite Profil → Settings
   2. Unesite: http://localhost:${server.port}
   3. Testirajte konekciju
   4. Live sync počinje! (svakih 5 sekundi)

Press Ctrl+C to stop
`);
