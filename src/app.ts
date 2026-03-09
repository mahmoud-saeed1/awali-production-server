import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

import { env, corsConfig } from "./config";
import { errorHandler } from "./shared/middlewares/error.middleware";
import {
  globalLimiter,
  requestId,
} from "./shared/middlewares/rateLimit.middleware";
import { logger } from "./shared/utils/logger";

// Route imports
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";
import { roleRoutes } from "./modules/roles/role.routes";
import { buildingTypeRoutes } from "./modules/building-types/building-type.routes";
import { unitTypeRoutes } from "./modules/unit-types/unit-type.routes";
import { featureRoutes } from "./modules/features/feature.routes";
import { unitRoutes } from "./modules/units/unit.routes";
import { clientRoutes } from "./modules/clients/client.routes";
import { dealRoutes } from "./modules/deals/deal.routes";
import { taskRoutes } from "./modules/tasks/task.routes";
import { activityRoutes } from "./modules/activities/activity.routes";
import { communicationRoutes } from "./modules/communications/communication.routes";
import { documentRoutes } from "./modules/documents/document.routes";
import { interestRoutes } from "./modules/interest-tracking/interest.routes";
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { auditLogRoutes } from "./modules/audit-logs/audit-log.routes";

const app = express();
const apiPrefix = `${env.API_PREFIX}/${env.API_VERSION}`;

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors(corsConfig));
// Note: express-mongo-sanitize middleware disabled in Express 5 (req.query is read-only).
// Body sanitization is handled below after body parsers.

// ─── Request Processing ──────────────────────────────────────────
app.use(requestId);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
// Sanitize request body against NoSQL injection (Express 5: req.query is read-only)
app.use((req, _res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  next();
});

// ─── Rate Limiting ───────────────────────────────────────────────
app.use(globalLimiter);

// ─── Logging ─────────────────────────────────────────────────────
const morganFormat = env.NODE_ENV === "development" ? "dev" : "combined";
app.use(
  morgan(morganFormat, {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);

// ─── Health Check ────────────────────────────────────────────────
app.get(`${apiPrefix}/health`, (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: "1.0.0",
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────────
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/roles`, roleRoutes);
app.use(`${apiPrefix}/building-types`, buildingTypeRoutes);
app.use(`${apiPrefix}/unit-types`, unitTypeRoutes);
app.use(`${apiPrefix}/features`, featureRoutes);
app.use(`${apiPrefix}/units`, unitRoutes);
app.use(`${apiPrefix}/clients`, clientRoutes);
app.use(`${apiPrefix}/deals`, dealRoutes);
app.use(`${apiPrefix}/tasks`, taskRoutes);
app.use(`${apiPrefix}/activities`, activityRoutes);
app.use(`${apiPrefix}/communications`, communicationRoutes);
app.use(`${apiPrefix}/documents`, documentRoutes);
app.use(`${apiPrefix}/interest`, interestRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/audit-logs`, auditLogRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint does not exist",
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// ─── Global Error Handler ────────────────────────────────────────
app.use(errorHandler);

export { app };
