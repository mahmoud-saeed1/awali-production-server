/**
 * Vercel Serverless Entry Point
 *
 * Uses dynamic imports so initialization errors (missing env vars,
 * DB failures) are caught and returned as JSON 500 instead of silently
 * crashing. Connection is cached across warm invocations.
 */
import type { IncomingMessage, ServerResponse } from "http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _app: any = null;
let _initError: Error | null = null;
let _initPromise: Promise<void> | null = null;

async function initialize(): Promise<void> {
  _initError = null; // clear any previous error on retry

  // 1. Load Express app (validates env vars via Zod, registers all routes)
  const { app } = await import("../src/app");
  _app = app;

  // 2. Connect MongoDB with serverless-safe pool size
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

    // 3. Run idempotent seeds on first cold start
    const { runAutoSeed } = await import("../src/database/seeds/index");
    await runAutoSeed().catch((err: Error) =>
      console.error("[seed] Auto-seed error:", err?.message),
    );
  }
}

function getInitPromise(): Promise<void> {
  if (!_initPromise) {
    _initPromise = initialize().catch((err: Error) => {
      _initError = err;
      _initPromise = null; // reset so next request can retry
      console.error("[init] Fatal initialization error:", err?.message);
    });
  }
  return _initPromise;
}

// Kick off on cold start
getInitPromise();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  _app(req, res);
}
