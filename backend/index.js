require("dotenv").config();
const express        = require("express");
const cors           = require("cors");
const rateLimit      = require("express-rate-limit");
const claudeRoutes   = require("./routes/claude");
const focusedRoutes  = require("./routes/focused");
const scenarioRoutes = require("./routes/scenarios");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json());

app.use(cors({
  origin:  process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
}));

const limiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             30,
  message:         { error: "Too many requests. Please wait a few minutes and try again." },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use("/api/", limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api", claudeRoutes);
app.use("/api", focusedRoutes);
app.use("/api", scenarioRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✦ PM Gym backend running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  WARNING: ANTHROPIC_API_KEY is not set in your .env file");
  }
});