import { cors } from "hono/cors";

import { appConfig } from "@repo/config";

const allowedOrigins = [
  appConfig.authServerUrl,
  "http://localhost:3000",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
];

export const corsMiddleware = cors({
  allowHeaders: ["Content-Type", "Authorization", "Cookie", "Idempotency-Key"],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  origin: (origin) => {
    if (!origin) {
      return allowedOrigins[0] ?? "*";
    }

    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? origin;
  },
});
