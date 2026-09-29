require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getHealthSnapshot, getRecentActivities } = require("./garminClient");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (!process.env.GARMIN_EMAIL || !process.env.GARMIN_PASSWORD) {
  console.error("Missing GARMIN_EMAIL / GARMIN_PASSWORD env vars - see .env.example");
  process.exit(1);
}
if (!process.env.API_KEY) {
  console.error("Missing API_KEY env var - see .env.example");
  process.exit(1);
}

app.use(
  cors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : false,
  }),
);

app.use((req, res, next) => {
  if (req.path === "/health") return next();
  if (req.header("X-Api-Key") !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/health-snapshot", async (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : isoToday();
  try {
    const snapshot = await getHealthSnapshot(date);
    res.json(snapshot);
  } catch (err) {
    res.status(502).json({ error: err.message || "Garmin request failed" });
  }
});

app.get("/api/activities", async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  try {
    const activities = await getRecentActivities(limit);
    res.json(activities);
  } catch (err) {
    res.status(502).json({ error: err.message || "Garmin request failed" });
  }
});

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

app.listen(PORT, () => {
  console.log(`VeganGains Garmin server listening on :${PORT}`);
});
