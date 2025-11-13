/**
 * Detailed Sync Test - Tests complete bidirectional sync flow
 * This simulates the complete workflow between mobile app and web portal
 */

const API_URL = "http://localhost:3000";

interface ServiceTicket {
  id: string;
  deviceCode: string;
  technicianId: string;
  technicianName: string;
  status: "in_progress" | "completed";
  startTime: Date | string;
  endTime?: Date | string;
  operations: any[];
  spareParts: any[];
  durationMinutes?: number;
}

// Simulate mobile app local data
let mobileTickets: ServiceTicket[] = [
  {
    id: "mob-ticket-1",
    deviceCode: "DEV-MOB-001",
    technicianId: "tech-1",
    technicianName: "Marko Marković",
    status: "completed",
    startTime: new Date("2025-11-13T10:00:00"),
    endTime: new Date("2025-11-13T11:30:00"),
    durationMinutes: 90,
    operations: [
      { id: "op-1", code: "OP-001", name: "Čišćenje rezervoara" },
      { id: "op-2", code: "OP-002", name: "Zamena filtera" },
    ],
    spareParts: [
      { id: "sp-1", code: "RD-001", name: "Filter uložak", quantity: 2 },
    ],
  },
  {
    id: "mob-ticket-2",
    deviceCode: "DEV-MOB-002",
    technicianId: "tech-1",
    technicianName: "Marko Marković",
    status: "in_progress",
    startTime: new Date("2025-11-13T12:00:00"),
    operations: [],
    spareParts: [],
  },
];

// Simulate web portal data (ticket opened on portal)
const portalTicket: ServiceTicket = {
  id: "portal-ticket-1",
  deviceCode: "DEV-PORTAL-001",
  technicianId: "tech-1",
  technicianName: "Marko Marković",
  status: "in_progress",
  startTime: new Date("2025-11-13T09:00:00"),
  operations: [
    { id: "op-3", code: "OP-003", name: "Provera slavina" },
  ],
  spareParts: [],
};

console.log("🚀 Detailed Sync Test - Simulating Complete Workflow");
console.log("=" .repeat(60));

async function step1_uploadMobileToPortal() {
  console.log("\n📤 STEP 1: Upload mobile tickets to portal");
  console.log("-".repeat(60));
  console.log(`Mobile app has ${mobileTickets.length} tickets locally`);

  try {
    const response = await fetch(`${API_URL}/api/sync/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets: mobileTickets }),
    });

    const result = await response.json();
    console.log("✅ Upload successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return false;
  }
}

async function step2_addPortalTicket() {
  console.log("\n🌐 STEP 2: Add ticket on portal (simulating admin opening ticket)");
  console.log("-".repeat(60));
  console.log("Portal ticket:", portalTicket);

  try {
    // First get existing tickets
    const getResponse = await fetch(`${API_URL}/api/sync/tickets`, {
      method: "GET",
    });
    const getData = await getResponse.json();
    const existingTickets = getData.data.tickets || [];

    // Add portal ticket to existing
    const updatedTickets = [...existingTickets, portalTicket];

    // Upload back to portal
    const postResponse = await fetch(`${API_URL}/api/sync/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets: updatedTickets }),
    });

    const result = await postResponse.json();
    console.log("✅ Portal ticket added:", result);
    return true;
  } catch (error) {
    console.error("❌ Failed to add portal ticket:", error);
    return false;
  }
}

async function step3_downloadFromPortal() {
  console.log("\n📥 STEP 3: Download tickets from portal (mobile app fetch)");
  console.log("-".repeat(60));

  try {
    const response = await fetch(`${API_URL}/api/sync/tickets`, {
      method: "GET",
    });

    const result = await response.json();
    const portalTickets = result.data.tickets || [];

    console.log(`✅ Downloaded ${portalTickets.length} tickets from portal`);

    // Show what we got
    portalTickets.forEach((ticket: ServiceTicket, index: number) => {
      console.log(`   ${index + 1}. ${ticket.id} - ${ticket.deviceCode} (${ticket.status})`);
    });

    return portalTickets;
  } catch (error) {
    console.error("❌ Download failed:", error);
    return [];
  }
}

async function step4_intelligentMerge(portalTickets: ServiceTicket[]) {
  console.log("\n🔄 STEP 4: Intelligent merge (simulating mobile app logic)");
  console.log("-".repeat(60));

  const mergedTickets = [...mobileTickets];
  let addedCount = 0;
  let updatedCount = 0;

  portalTickets.forEach((portalTicket) => {
    const localIndex = mergedTickets.findIndex((t) => t.id === portalTicket.id);

    if (localIndex === -1) {
      // New ticket from portal - add it
      mergedTickets.push(portalTicket);
      addedCount++;
      console.log(`   ➕ Added from portal: ${portalTicket.id}`);
    } else {
      // Ticket exists - use most recent
      const localTicket = mergedTickets[localIndex];
      const portalUpdated = portalTicket.endTime
        ? new Date(portalTicket.endTime)
        : new Date(portalTicket.startTime);
      const localUpdated = localTicket.endTime
        ? new Date(localTicket.endTime)
        : new Date(localTicket.startTime);

      if (portalUpdated > localUpdated) {
        mergedTickets[localIndex] = portalTicket;
        updatedCount++;
        console.log(`   🔄 Updated from portal: ${portalTicket.id}`);
      } else {
        console.log(`   ✓ Kept local version: ${localTicket.id} (newer)`);
      }
    }
  });

  console.log(`\n📊 Merge results:`);
  console.log(`   Total tickets after merge: ${mergedTickets.length}`);
  console.log(`   Added from portal: ${addedCount}`);
  console.log(`   Updated from portal: ${updatedCount}`);
  console.log(`   Kept local: ${mobileTickets.length - updatedCount}`);

  // Update mobile tickets
  mobileTickets = mergedTickets;

  return true;
}

async function step5_verifyFinalState() {
  console.log("\n✅ STEP 5: Verify final state");
  console.log("-".repeat(60));

  // Get portal state
  const response = await fetch(`${API_URL}/api/sync/tickets`, {
    method: "GET",
  });
  const result = await response.json();
  const portalTickets = result.data.tickets || [];

  console.log("📱 Mobile app state:");
  console.log(`   Total tickets: ${mobileTickets.length}`);
  mobileTickets.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.id} - ${t.deviceCode} (${t.status})`);
  });

  console.log("\n🌐 Portal state:");
  console.log(`   Total tickets: ${portalTickets.length}`);
  portalTickets.forEach((t: ServiceTicket, i: number) => {
    console.log(`   ${i + 1}. ${t.id} - ${t.deviceCode} (${t.status})`);
  });

  // Check if they match
  const mobileIds = mobileTickets.map((t) => t.id).sort();
  const portalIds = portalTickets.map((t: ServiceTicket) => t.id).sort();

  const idsMatch = JSON.stringify(mobileIds) === JSON.stringify(portalIds);

  console.log("\n🔍 Verification:");
  if (idsMatch) {
    console.log("   ✅ Mobile and Portal are in sync!");
  } else {
    console.log("   ⚠️  Mobile and Portal have different tickets");
    console.log("   Mobile IDs:", mobileIds);
    console.log("   Portal IDs:", portalIds);
  }

  return idsMatch;
}

async function runCompleteTest() {
  console.log("\n🎬 Starting Complete Bidirectional Sync Test...\n");

  // Step 1: Upload mobile tickets to portal
  if (!(await step1_uploadMobileToPortal())) {
    console.error("\n❌ Test failed at step 1");
    return;
  }

  // Step 2: Add ticket on portal
  if (!(await step2_addPortalTicket())) {
    console.error("\n❌ Test failed at step 2");
    return;
  }

  // Step 3: Download from portal
  const portalTickets = await step3_downloadFromPortal();
  if (portalTickets.length === 0) {
    console.error("\n❌ Test failed at step 3");
    return;
  }

  // Step 4: Intelligent merge
  if (!(await step4_intelligentMerge(portalTickets))) {
    console.error("\n❌ Test failed at step 4");
    return;
  }

  // Step 5: Verify final state
  const inSync = await step5_verifyFinalState();

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  if (inSync) {
    console.log("✅ ALL TESTS PASSED - Bidirectional sync works perfectly!");
    console.log("   • Mobile tickets uploaded to portal");
    console.log("   • Portal ticket downloaded to mobile");
    console.log("   • Intelligent merge resolved conflicts");
    console.log("   • Both systems are in sync");
  } else {
    console.log("❌ TEST FAILED - Systems are not in sync");
  }
  console.log("=".repeat(60));
}

// Run the test
runCompleteTest();
