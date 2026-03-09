/**
 * Vercel Serverless Entry Point - Minimal test
 * Testing basic Vercel routing before full app initialization
 */
import type { IncomingMessage, ServerResponse } from "http";

export default function handler(
  _req: IncomingMessage,
  res: ServerResponse,
): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ success: true, message: "Vercel routing works!" }));
}
