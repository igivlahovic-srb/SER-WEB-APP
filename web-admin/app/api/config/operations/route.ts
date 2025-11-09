import { NextResponse } from "next/server";
import { dataStore } from "../../../../lib/dataStore";

export async function GET() {
  try {
    const operations = dataStore.getOperations();
    return NextResponse.json({
      success: true,
      data: { operations },
    });
  } catch (error) {
    console.error("Error fetching operations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch operations" },
      { status: 500 }
    );
  }
}
