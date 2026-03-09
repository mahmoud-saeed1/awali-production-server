/**
 * Vercel Serverless Entry Point
 *
 * Resilient serverless-safe Express handler.
 * Uses a cached mongoose connection to avoid reconnecting on warm starts.
 * Never calls process.exit() — errors are logged and the function stays alive.
 */

import mongoose from "mongoose";
import { app } from "../src/app";
import { runAutoSeed } from "../src/database/seeds/index";

// Cache the connection promise across warm invocations
let connectionPromise: Promise<void> | null = null;

async function connectDB(): Promise<void> {
  // Already connected — reuse existing connection
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "awali_dashboard",
    maxPoolSize: 5, // lower pool size for serverless
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  // Seed once per cold start
  await runAutoSeed().catch((err) =>
    console.error("[seed] Auto-seed failed:", err?.message),
  );
}

// Trigger DB connection on module load (cold start)
// Reset the cached promise on failure so the next request can retry
if (!connectionPromise) {
  connectionPromise = connectDB().catch((error) => {
    console.error("[db] MongoDB connection failed:", error?.message);
    connectionPromise = null; // allow retry on next cold start
  });
}

export default app;
