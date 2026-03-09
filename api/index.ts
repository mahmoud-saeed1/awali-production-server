/**
 * Vercel Serverless Entry Point
 *
 * The Express app is loaded synchronously at module-load time.
 * MongoDB connection is attempted async in the background — DB errors
 * only affect endpoints that need the DB, never the app itself.
 */

// Load the Express app immediately (validates env, registers all routes)
import { app } from "../src/app";

// Connect MongoDB in the background — non-blocking
import mongoose from "mongoose";
import { runAutoSeed } from "../src/database/seeds/index";

let _dbReady = false;

(async () => {
  if (mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_URI;
    if (!uri) { console.error("[db] MONGODB_URI not set"); return; }

    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "awali_dashboard",
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    _dbReady = true;
    await runAutoSeed().catch((err: Error) =>
      console.error("[seed] Auto-seed error:", err?.message),
    );
  }
})().catch((err: Error) =>
  console.error("[db] MongoDB connection error:", err?.message),
);

export default app;
