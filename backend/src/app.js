import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize } from "./config/database.js";
import logger from "./utils/logger.js";
import { corsMiddleware } from "./config/cors.js";



// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dailyReportRoutes from "./routes/dailyReportRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

/* -------------------------------------------------------------------------- */
/*                                SECURITY                                    */
/* -------------------------------------------------------------------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* -------------------------------------------------------------------------- */
/*                                   CORS                                     */
/* -------------------------------------------------------------------------- */
app.use(corsMiddleware);
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* -------------------------------------------------------------------------- */
/*                               RATE LIMITING                                */
/* -------------------------------------------------------------------------- */

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

/* -------------------------------------------------------------------------- */
/*                               MIDDLEWARE                                   */
/* -------------------------------------------------------------------------- */

app.use(morgan("dev"));

app.use(compression());

app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

/* -------------------------------------------------------------------------- */
/*                               STATIC FILES                                 */
/* -------------------------------------------------------------------------- */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

/* -------------------------------------------------------------------------- */
/*                                  ROUTES                                    */
/* -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "BuildTrack API",
    version: "1.0.0",
    status: "Running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      success: true,
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/workers", workerRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/materials", materialRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/audits", auditRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/daily-reports", dailyReportRoutes);
app.use("/api/v1/requests", requestRoutes);

/* -------------------------------------------------------------------------- */
/*                              404 HANDLER                                   */
/* -------------------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* -------------------------------------------------------------------------- */
/*                            ERROR HANDLER                                   */
/* -------------------------------------------------------------------------- */

app.use((err, req, res, next) => {
  logger.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -------------------------------------------------------------------------- */
/*                             START SERVER                                   */
/* -------------------------------------------------------------------------- */

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected");

    await import("./models/index.js");

    await sequelize.sync({ alter: false });
    logger.info("✅ Database synchronized");

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 BuildTrack API running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();

export default app;