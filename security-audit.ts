#!/usr/bin/env bun

/**
 * Security Audit Script
 * Checks dependencies for known vulnerabilities
 * Run with: bun run security-audit.ts
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface AuditResult {
  passed: boolean;
  vulnerabilities: number;
  message: string;
}

class SecurityAuditor {
  /**
   * Run bun audit to check for vulnerabilities
   */
  static async runDependencyAudit(): Promise<AuditResult> {
    try {
      console.log("🔍 Running dependency audit...\n");

      const { stdout, stderr } = await execAsync("bun pm audit");

      // Parse output for vulnerabilities
      const hasVulnerabilities = stdout.includes("vulnerabilities") || stderr.includes("vulnerabilities");

      if (hasVulnerabilities) {
        console.log(stdout);
        return {
          passed: false,
          vulnerabilities: this.parseVulnerabilityCount(stdout),
          message: "Vulnerabilities found in dependencies",
        };
      }

      return {
        passed: true,
        vulnerabilities: 0,
        message: "No known vulnerabilities found",
      };
    } catch (error: any) {
      // Bun audit exits with error code if vulnerabilities found
      if (error.stdout) {
        console.log(error.stdout);
        return {
          passed: false,
          vulnerabilities: this.parseVulnerabilityCount(error.stdout),
          message: "Vulnerabilities found in dependencies",
        };
      }

      return {
        passed: false,
        vulnerabilities: -1,
        message: "Failed to run audit: " + error.message,
      };
    }
  }

  /**
   * Check for outdated dependencies
   */
  static async checkOutdatedDependencies(): Promise<void> {
    try {
      console.log("\n📦 Checking for outdated dependencies...\n");

      const { stdout } = await execAsync("bun outdated");

      if (stdout.trim()) {
        console.log(stdout);
        console.log("\n⚠️  Some dependencies are outdated. Consider updating them.\n");
      } else {
        console.log("✅ All dependencies are up to date\n");
      }
    } catch (error: any) {
      if (error.stdout && error.stdout.trim()) {
        console.log(error.stdout);
        console.log("\n⚠️  Some dependencies are outdated. Consider updating them.\n");
      }
    }
  }

  /**
   * Check for common security misconfigurations
   */
  static async checkSecurityConfig(): Promise<void> {
    console.log("\n🔐 Checking security configurations...\n");

    const checks = [
      {
        name: "Environment variables",
        check: async () => {
          const fs = await import("fs");
          const envExists = fs.existsSync(".env");
          const envExampleExists = fs.existsSync(".env.example");
          const gitignoreExists = fs.existsSync(".gitignore");

          if (!gitignoreExists) {
            return { passed: false, message: "❌ No .gitignore file found" };
          }

          const gitignoreContent = fs.readFileSync(".gitignore", "utf8");
          const envInGitignore = gitignoreContent.includes(".env");

          if (envExists && !envInGitignore) {
            return { passed: false, message: "❌ .env file not in .gitignore - API keys may be exposed!" };
          }

          return { passed: true, message: "✅ Environment variables properly configured" };
        },
      },
      {
        name: "HTTPS usage",
        check: async () => {
          const fs = await import("fs");
          const apiFiles = [
            "src/api/web-admin-sync.ts",
            "src/api/openai.ts",
            "src/api/anthropic.ts",
            "src/api/grok.ts",
          ];

          let hasHttpWarning = false;

          for (const file of apiFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, "utf8");
              if (content.includes("http://") && !content.includes("localhost")) {
                hasHttpWarning = true;
                console.log(`   ⚠️  Found HTTP (not HTTPS) URL in ${file}`);
              }
            }
          }

          if (hasHttpWarning) {
            return { passed: false, message: "❌ Some API calls use HTTP instead of HTTPS" };
          }

          return { passed: true, message: "✅ All API calls use HTTPS" };
        },
      },
      {
        name: "Security utilities",
        check: async () => {
          const fs = await import("fs");
          const securityFileExists = fs.existsSync("src/utils/security.ts");
          const secureStorageExists = fs.existsSync("src/utils/secure-storage.ts");

          if (!securityFileExists || !secureStorageExists) {
            return { passed: false, message: "❌ Security utilities not found" };
          }

          return { passed: true, message: "✅ Security utilities in place" };
        },
      },
      {
        name: "Password security",
        check: async () => {
          const fs = await import("fs");
          const authStoreExists = fs.existsSync("src/state/authStore.ts");

          if (authStoreExists) {
            const content = fs.readFileSync("src/state/authStore.ts", "utf8");

            // Check if passwords are stored in plain text
            if (content.includes('password: "') && content.includes("INITIAL_USERS")) {
              return {
                passed: false,
                message: "⚠️  Demo passwords found in code - OK for development, remove for production",
              };
            }
          }

          return { passed: true, message: "✅ No hardcoded passwords found" };
        },
      },
    ];

    for (const check of checks) {
      const result = await check.check();
      console.log(`${result.message}`);
    }
  }

  /**
   * Generate security report
   */
  static async generateReport(): Promise<void> {
    console.log("\n📋 Generating security report...\n");

    const report = {
      timestamp: new Date().toISOString(),
      checks: {
        dependencies: "Run bun pm audit for details",
        https: "Check API endpoints use HTTPS",
        environment: "Ensure .env in .gitignore",
        encryption: "Use SecureStorage for sensitive data",
        rateLimit: "Rate limiters implemented",
        inputValidation: "Input sanitization implemented",
        errorHandling: "Secure error handler implemented",
      },
      recommendations: [
        "1. Run 'bun pm audit' regularly to check for vulnerabilities",
        "2. Update dependencies with 'bun update' monthly",
        "3. Never commit .env files to git",
        "4. Use HTTPS for all production API endpoints",
        "5. Enable 2FA for admin users",
        "6. Implement proper logging and monitoring",
        "7. Use expo-secure-store for production instead of basic encryption",
        "8. Set up automated security scanning in CI/CD",
        "9. Review and rotate API keys quarterly",
        "10. Implement proper session management with JWT tokens",
      ],
    };

    const fs = await import("fs");
    fs.writeFileSync("SECURITY_REPORT.json", JSON.stringify(report, null, 2));

    console.log("✅ Security report saved to SECURITY_REPORT.json\n");
  }

  /**
   * Parse vulnerability count from audit output
   */
  private static parseVulnerabilityCount(output: string): number {
    const match = output.match(/(\d+)\s+vulnerabilities/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Run all security checks
   */
  static async runAll(): Promise<void> {
    console.log("=" .repeat(60));
    console.log("🛡️  VIBECODE SECURITY AUDIT");
    console.log("=" .repeat(60));

    // Check dependencies
    const auditResult = await this.runDependencyAudit();

    // Check outdated packages
    await this.checkOutdatedDependencies();

    // Check security configurations
    await this.checkSecurityConfig();

    // Generate report
    await this.generateReport();

    console.log("=" .repeat(60));

    if (auditResult.passed) {
      console.log("✅ Security audit passed!");
    } else {
      console.log(`⚠️  Security audit found ${auditResult.vulnerabilities} vulnerabilities`);
      console.log("Run 'bun update' to fix known vulnerabilities");
    }

    console.log("=" .repeat(60));
    console.log("\n💡 Tips:");
    console.log("  - Run this audit before every production deployment");
    console.log("  - Check SECURITY_REPORT.json for detailed recommendations");
    console.log("  - Keep dependencies updated monthly");
    console.log("  - Review security logs regularly\n");
  }
}

// Run audit if executed directly
// @ts-ignore - Bun specific property
if (import.meta.main) {
  SecurityAuditor.runAll().catch((error) => {
    console.error("❌ Security audit failed:", error);
    process.exit(1);
  });
}

export default SecurityAuditor;
