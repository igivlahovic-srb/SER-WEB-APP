import { NextResponse } from "next/server";
import { dataStore } from "../../../../lib/dataStore";

export async function GET() {
  try {
    const spareParts = dataStore.getSpareParts();
    return NextResponse.json({
      success: true,
      data: { spareParts },
    });
  } catch (error) {
    console.error("Error fetching spare parts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch spare parts" },
      { status: 500 }
    );
  }
}
