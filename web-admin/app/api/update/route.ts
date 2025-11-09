import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log("Starting application update...");

    // Pull latest changes from git
    console.log("Pulling latest changes from git...");
    await execAsync("git pull origin main");

    // Install dependencies
    console.log("Installing dependencies...");
    await execAsync("bun install");

    // Build the application
    console.log("Building application...");
    await execAsync("bun run build");

    // Note: The application restart needs to be handled by PM2 or systemd
    // We'll create a flag file that the process manager can monitor
    const fs = require("fs");
    fs.writeFileSync("/tmp/web-admin-restart-required", "1");

    console.log("Update completed successfully!");

    return NextResponse.json({
      success: true,
      message: "Ažuriranje uspešno! Aplikacija će se restartovati za nekoliko sekundi...",
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Greška pri ažuriranju aplikacije: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
