/**
 * Vercel Serverless Entry Point
 *
 * This file is the entry point for Vercel serverless functions.
 * It imports the Express app and ensures the MongoDB connection is
 * established before handling requests. The connection is cached
 * across warm invocations to avoid reconnecting on every request.
 */

import mongoose from "mongoose";
import { app } from "../src/app";
import { connectDatabase } from "../src/config";
import { runAutoSeed } from "../src/database/seeds/index";

let seeded = false;

// Establish DB connection on cold start and cache it for warm starts
if (mongoose.connection.readyState === 0) {
  connectDatabase()
    .then(async () => {
      if (!seeded) {
        seeded = true;
        await runAutoSeed().catch(console.error);
      }
    })
    .catch(console.error);
}

export default app;
