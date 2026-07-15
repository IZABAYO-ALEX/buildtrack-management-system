// src/config/cors.js
import cors from "cors";
import config from "./config.js";

// Normalize origin (remove trailing slash)
const normalizeOrigin = (origin) => origin?.replace(/\/$/, "");

// Get all allowed origins
const getAllowedOrigins = () => {
  const origins = new Set();
  
  // Add main CORS origin from config
  if (config.cors.origin) {
    origins.add(normalizeOrigin(config.cors.origin));
  }
  
  // Add common Vercel deployment URLs
  const vercelUrls = [
    "https://buildtrack-management-system.vercel.app",
    "https://buildtrack-management-system.vercel.app/",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174"
  ];
  
  vercelUrls.forEach(url => origins.add(normalizeOrigin(url)));
  
  // Add production URLs
  if (process.env.NODE_ENV === 'production') {
    origins.add("https://buildtrack-management-system.onrender.com");
  }
  
  // Filter out undefined/null values
  return Array.from(origins).filter(Boolean);
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const allowedOrigins = getAllowedOrigins();

    // Log for debugging
    console.log('🌐 Incoming Origin:', normalizedOrigin);
    console.log('✅ Allowed Origins:', allowedOrigins);

    // Check if origin is allowed
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // For development, allow any localhost
    if (process.env.NODE_ENV !== 'production' && 
        (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1'))) {
      return callback(null, true);
    }

    console.warn(`❌ CORS blocked: ${normalizedOrigin}`);
    return callback(new Error('Not allowed by CORS'));
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
    "Accept",
    "X-Refresh-Token"
  ],

  exposedHeaders: [
    "Content-Range",
    "X-Content-Range",
    "X-Refresh-Token"
  ],

  optionsSuccessStatus: 200,

  maxAge: 86400,

  // Allow preflight requests
  preflightContinue: false
};

const corsMiddleware = cors(corsOptions);

export { corsMiddleware, corsOptions, getAllowedOrigins };