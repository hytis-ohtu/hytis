/**
 * Centralized environment variables and configuration.
 */
import "dotenv/config";

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/test_db";

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";

export const config = {
  port: parseInt(process.env.PORT || "3000"),
  nodeEnv: process.env.NODE_ENV || "production",

  sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-this",
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || "86400000"), // 24h

  redis: process.env.REDIS_URL || "",

  oidc: {
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    redirectUri: process.env.OIDC_REDIRECT_URI,
    issuer: process.env.OIDC_ISSUER,
  },

  frontendUrl: isProduction
    ? process.env.FRONTEND_URL
    : "http://localhost:5173",
} as const;
