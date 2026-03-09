/**
 * Vercel Serverless Entry Point
 *
 * Uses dynamic imports so initialization errors (e.g. missing env vars,
 * DB connection failures) are caught and returned as a proper JSON 500
 * instead of silently crashing the function.
 *
 * Connection is cached across warm invocations (standard serverless pattern).
 */

import type { IncomingMessage, ServerResponse } from "http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _app: any = null;
let _initError: Error | null = null;
let _initPromise: Promise<void> | null = null;

async function initialize(): Promise<void> {
  // ── 1. Load Express app (validates env vars, registers routes) ──────────
  const { app } = await import("../src/app");
  _app = app;

  // ── 2. Connect MongoDB (cached per serverless instance) ─────────────────
  const mongoose = (await import("mongoose")).default;

  if (mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI environment variable is not set");

    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "awali_dashboard",
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // ── 3. Run idempotent seeds on first cold start ───────────────────────
    const { runAutoSeed } = await import("../src/database/seeds/index");
    await runAutoSeed().catch((err: Error) =>
      console.error("[seed] Auto-seed error:", err?.message),
    );
  }
}

// Kick off initialization on cold start; cache the promise for warm starts
function getInitPromise(): Promise<void> {
  if (!_initPromise) {
    _initPromise = initialize().catch((err: Error) => {
      _initError = err;
      _initPromise = null; // reset so the next cold start can retry
      console.error("[init] Fatal initialization error:", err?.message);
    });
  }
  return _initPromise;
}

getInitPromise();

// ── Request handler ────────────────────────────────────────────────────────
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  // Wait for initialization to finish (handles async cold start)
  await getInitPromise();

  if (_initError || !_app) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "INIT_FAILED",
          message: _initError?.message ?? "Service failed to initialize",
        },
        meta: { timestamp: new Date().toISOString() },
      }),
    );
    return;
  }

  _app(req, res);
}

