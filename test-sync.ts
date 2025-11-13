/**
 * Test script for syncing between mobile app and web admin portal
 * This script tests the bidirectional sync functionality
 */

const API_URL = "http://localhost:3000";

interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface ServiceTicket {
  id: string;
  deviceCode: string;
  userId: string;
  userName: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  operations: any[];
  spareParts: any[];
}

async function testConnection() {
  console.log("\n🔍 Testing connection to web portal...");
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    console.log("✅ Connection successful:", data);
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error);
    return false;
  }
}

async function testSyncUsers() {
  console.log("\n📤 Testing user sync (Upload)...");

  const testUsers: User[] = [
    {
      id: "test-1",
      username: "test-user",
      password: "test123",
      name: "Test User",
      role: "serviser",
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "test-2",
      username: "test-admin",
      password: "admin123",
      name: "Test Admin",
      role: "super_user",
      isActive: true,
      createdAt: new Date(),
    },
  ];

  try {
    const response = await fetch(`${API_URL}/api/sync/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users: testUsers }),
    });

    const data = await response.json();
    console.log("✅ Users synced:", data);
    return true;
  } catch (error) {
    console.error("❌ User sync failed:", error);
    return false;
  }
}

async function testFetchUsers() {
  console.log("\n📥 Testing user fetch (Download)...");

  try {
    const response = await fetch(`${API_URL}/api/sync/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("✅ Users fetched:", data);
    console.log("   Total users:", data.data?.users?.length || 0);
    return true;
  } catch (error) {
    console.error("❌ User fetch failed:", error);
    return false;
  }
}

async function testSyncTickets() {
  console.log("\n📤 Testing ticket sync (Upload)...");

  const testTickets: ServiceTicket[] = [
    {
      id: "ticket-1",
      deviceCode: "DEV-001",
      userId: "test-1",
      userName: "Test User",
      status: "completed",
      startTime: new Date(),
      endTime: new Date(),
      operations: [
        {
          id: "op-1",
          code: "OP-001",
          name: "Test operacija",
        },
      ],
      spareParts: [
        {
          id: "sp-1",
          code: "RD-001",
          name: "Test deo",
          quantity: 2,
        },
      ],
    },
  ];

  try {
    const response = await fetch(`${API_URL}/api/sync/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tickets: testTickets }),
    });

    const data = await response.json();
    console.log("✅ Tickets synced:", data);
    return true;
  } catch (error) {
    console.error("❌ Ticket sync failed:", error);
    return false;
  }
}

async function testFetchTickets() {
  console.log("\n📥 Testing ticket fetch (Download)...");

  try {
    const response = await fetch(`${API_URL}/api/sync/tickets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("✅ Tickets fetched:", data);
    console.log("   Total tickets:", data.data?.tickets?.length || 0);
    return true;
  } catch (error) {
    console.error("❌ Ticket fetch failed:", error);
    return false;
  }
}

async function testBidirectionalSync() {
  console.log("\n🔄 Testing bidirectional sync...");

  let passed = 0;
  let failed = 0;

  // 1. Connection test
  if (await testConnection()) {
    passed++;
  } else {
    failed++;
    console.log("\n❌ Cannot proceed without connection");
    return;
  }

  // 2. Upload users
  if (await testSyncUsers()) {
    passed++;
  } else {
    failed++;
  }

  // 3. Download users
  if (await testFetchUsers()) {
    passed++;
  } else {
    failed++;
  }

  // 4. Upload tickets
  if (await testSyncTickets()) {
    passed++;
  } else {
    failed++;
  }

  // 5. Download tickets
  if (await testFetchTickets()) {
    passed++;
  } else {
    failed++;
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Summary");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  console.log("=".repeat(50));
}

// Run tests
console.log("🚀 Starting sync tests...");
console.log("🌐 Web Portal URL:", API_URL);
testBidirectionalSync();
