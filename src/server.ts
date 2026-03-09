import { app } from "./app";
import {
  env,
  connectDatabase,
  disconnectDatabase,
  r2Client,
  R2_BUCKET,
} from "./config";
import { logger } from "./shared/utils/logger";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { runAutoSeed } from "./database/seeds/index";

// ─── ANSI color tokens ────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

/**
 * Pad a string to a fixed visual width, ignoring ANSI escape codes.
 * Handles all ANSI CSI sequences (color, bold, etc.)
 */
function pr(str: string, len: number): string {
  const stripped = str.replace(/\x1b\[[\d;]*m/g, "");
  const pad = Math.max(0, len - stripped.length);
  return str + " ".repeat(pad);
}

// Box geometry: W chars of content between ║ and ║
// Col widths: label(22) + status(14) + detail(25) + padding(2) = 63
const W = 63;
const BORDER = "═".repeat(W);

function blankRow(): void {
  process.stdout.write(
    `${C.cyan}║${C.reset}${" ".repeat(W)}${C.cyan}║${C.reset}\n`,
  );
}

function divider(): void {
  process.stdout.write(`${C.cyan}╠${BORDER}╣${C.reset}\n`);
}

function tableRow(label: string, statusStr: string, detail: string): void {
  const l = pr(`  ${label}`, 22);
  const s = pr(statusStr, 14);
  const d = pr(detail, 25);
  process.stdout.write(
    `${C.cyan}║${C.reset}${l}${s}${d}  ${C.cyan}║${C.reset}\n`,
  );
}

// ─── Cloudflare R2 health check ───────────────────────────────────────────
async function checkR2(): Promise<{ ok: boolean; detail: string }> {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
    return { ok: false, detail: "Not configured" };
  }
  try {
    await r2Client.send(
      new HeadBucketCommand({ Bucket: R2_BUCKET || "awali-media" }),
    );
    return { ok: true, detail: R2_BUCKET || "awali-media" };
  } catch (err: unknown) {
    const httpStatus = (err as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode;
    if (httpStatus === 404) return { ok: false, detail: "Bucket not found" };
    if (httpStatus === 403) return { ok: false, detail: "Access denied" };
    return { ok: false, detail: "Connection failed" };
  }
}

// ─── Startup banner ───────────────────────────────────────────────────────
function printBanner(
  r2: { ok: boolean; detail: string },
  superAdminEmail: string,
  superAdminPassword: string,
): void {
  const version = `v${process.env["npm_package_version"] ?? "1.0.0"}`;

  const OK = `${C.green}[  OK  ]${C.reset}`;
  const r2Badge = r2.ok
    ? `${C.green}[  OK  ]${C.reset}`
    : `${C.yellow}[ WARN ]${C.reset}`;

  const envBadge =
    env.NODE_ENV === "production"
      ? `${C.green}[ PROD ]${C.reset}`
      : env.NODE_ENV === "staging"
        ? `${C.yellow}[ STG  ]${C.reset}`
        : `${C.yellow}[ DEV  ]${C.reset}`;

  process.stdout.write("\n");

  // ── Top border ──
  process.stdout.write(`${C.cyan}╔${BORDER}╗${C.reset}\n`);
  blankRow();

  // ── Title ──
  const titleLine = `${C.bold}${C.white}  AWALI DASHBOARD API  ${C.reset}${C.gray}${version}${C.reset}`;
  process.stdout.write(
    `${C.cyan}║${C.reset}${pr(titleLine, W)}${C.cyan}║${C.reset}\n`,
  );

  // ── Subtitle ──
  const subtitleLine = `${C.gray}  Real Estate CRM & Property Management Platform${C.reset}`;
  process.stdout.write(
    `${C.cyan}║${C.reset}${pr(subtitleLine, W)}${C.cyan}║${C.reset}\n`,
  );
  blankRow();

  // ── Section divider ──
  divider();

  // ── Column headers ──
  process.stdout.write(
    `${C.cyan}║${C.reset}` +
      `${pr(`  ${C.bold}${C.white}Service${C.reset}`, 22)}` +
      `${pr(`${C.bold}${C.white}Status${C.reset}`, 14)}` +
      `${pr(`${C.bold}${C.white}Details${C.reset}`, 25)}` +
      `  ${C.cyan}║${C.reset}\n`,
  );

  // ── Header separator ──
  process.stdout.write(
    `${C.cyan}║${C.reset}` +
      `${pr(`  ${C.gray}${"─".repeat(18)}${C.reset}`, 22)}` +
      `${pr(`${C.gray}${"─".repeat(11)}${C.reset}`, 14)}` +
      `${pr(`${C.gray}${"─".repeat(22)}${C.reset}`, 25)}` +
      `  ${C.cyan}║${C.reset}\n`,
  );

  // ── Data rows ──
  tableRow("MongoDB", OK, env.MONGODB_DB_NAME ?? "awali_dashboard");
  tableRow("Cloudflare R2", r2Badge, r2.detail);
  tableRow("HTTP Server", OK, `http://${env.HOST}:${env.PORT}`);
  tableRow(
    "API Base URL",
    `${C.blue}[READY ]${C.reset}`,
    env.BASE_URL ?? `/api/${env.API_VERSION}`,
  );
  tableRow("Environment", envBadge, env.NODE_ENV);

  blankRow();

  // ── Bottom border ──
  process.stdout.write(`${C.cyan}╚${BORDER}╝${C.reset}\n`);
  process.stdout.write("\n");

  // ── Super Admin credentials (shown outside the box) ──
  process.stdout.write(
    `  ${C.bold}${C.cyan}Super Admin Credentials${C.reset}\n`,
  );
  process.stdout.write(
    `  ${C.gray}──────────────────────────────────────${C.reset}\n`,
  );
  process.stdout.write(
    `  ${C.gray}Email   :${C.reset}  ${C.white}${C.bold}${superAdminEmail}${C.reset}\n`,
  );
  process.stdout.write(
    `  ${C.gray}Password:${C.reset}  ${C.white}${C.bold}${superAdminPassword}${C.reset}\n`,
  );
  process.stdout.write("\n");
}

// ─── Server Bootstrap ─────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Run idempotent seeds — creates super admin + default data on first boot
    const { superAdminEmail, superAdminPassword } = await runAutoSeed();

    // 3. Real Cloudflare R2 connectivity check
    const r2 = await checkR2();

    // 4. Start HTTP server
    const server = app.listen(env.PORT, env.HOST, () => {
      printBanner(r2, superAdminEmail, superAdminPassword);
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info("Graceful shutdown completed");
        process.exit(0);
      });
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 30_000);
    };

    process.on("SIGTERM", () => {
      void gracefulShutdown("SIGTERM");
    });
    process.on("SIGINT", () => {
      void gracefulShutdown("SIGINT");
    });

    process.on("unhandledRejection", (reason: unknown) => {
      logger.error("Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
