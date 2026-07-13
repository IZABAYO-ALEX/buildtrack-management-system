import cors from "cors";
import config from "./config.js";

/**
 * Allowed origins
 * Production uses the deployed frontend.
 * Development also allows localhost.
 */
const allowedOrigins = [
  config.cors.origin,

  ...(config.app.env !== "production"
    ? [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
      ]
    : [])
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow Postman, server-to-server requests, health checks
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`❌ CORS blocked: ${origin}`);

    callback(new Error("Not allowed by CORS"));
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