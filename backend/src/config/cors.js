import cors from "cors";
import config from "./config.js";

/**
 * Remove trailing slash from origins so that:
 * https://example.com/
 * and
 * https://example.com
 * are treated as the same origin.
 */
const normalizeOrigin = (origin) => origin?.replace(/\/$/, "");

/**
 * Allowed origins
 * Production uses the deployed frontend.
 * Development also allows localhost.
 */
const allowedOrigins = [
  normalizeOrigin(config.cors.origin),

  ...(config.app.env !== "production"
    ? [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
      ].map(normalizeOrigin)
    : [])
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow Postman, server-to-server requests, health checks
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    console.log("🌐 Incoming Origin:", normalizedOrigin);
    console.log("✅ Allowed Origins:", allowedOrigins);

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`❌ CORS blocked: ${normalizedOrigin}`);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept"
  ],

  exposedHeaders: [
    "Content-Range",
    "X-Content-Range"
  ],

  optionsSuccessStatus: 200,

  maxAge: 86400
};

const corsMiddleware = cors(corsOptions);

export { corsMiddleware, corsOptions };