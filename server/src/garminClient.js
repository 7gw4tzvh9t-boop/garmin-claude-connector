const fs = require("fs");
const path = require("path");
const { GarminConnect } = require("garmin-connect");

const TOKEN_DIR = path.join(__dirname, "..", ".garmin-tokens");

// Undocumented Garmin Connect endpoints (no official public API for these).
// Same host/paths used by the well-known Python "garminconnect" / "garth"
// libraries this package is inspired by. Garmin can change these without
// notice - every call site wraps failures so one broken metric never takes
// the rest of the snapshot down with it.
const API_BASE = "https://connectapi.garmin.com";

let client = null;
let readyPromise = null;

function getClient() {
  if (!client) {
    client = new GarminConnect({
      username: process.env.GARMIN_EMAIL,
      password: process.env.GARMIN_PASSWORD,
    });
  }
  return client;
}

async function ensureLoggedIn() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const c = getClient();
      try {
        if (fs.existsSync(TOKEN_DIR)) {
          c.loadTokenByFile(TOKEN_DIR);
          await c.getUserProfile(); // cheap call to confirm the token still works
        } else {
          throw new Error("no cached token");
        }
      } catch {
        await c.login();
        fs.mkdirSync(TOKEN_DIR, { recursive: true });
        c.saveTokenToFile(TOKEN_DIR);
      }
      return c;
    })().catch((err) => {
      readyPromise = null; // allow the next request to retry the login
      throw err;
    });
  }
  return readyPromise;
}

async function safe(fn) {
  try {
    return await fn();
  } catch (err) {
    return { error: err.message || "unknown error" };
  }
}

async function getTrainingReadiness(client, dateStr) {
  const [reading] = await client.get(
    `${API_BASE}/metrics-service/metrics/trainingreadiness/${dateStr}`,
  );
  return reading ?? null;
}

async function getTrainingStatus(client, dateStr) {
  return client.get(
    `${API_BASE}/metrics-service/metrics/trainingstatus/aggregated/${dateStr}`,
  );
}

async function getBodyBattery(client, dateStr) {
  const [reading] = await client.get(
    `${API_BASE}/wellness-service/wellness/bodyBattery/reports/daily?startDate=${dateStr}&endDate=${dateStr}`,
  );
  return reading ?? null;
}

async function getRespiration(client, dateStr) {
  return client.get(
    `${API_BASE}/wellness-service/wellness/daily/respiration/${dateStr}`,
  );
}

async function getStress(client, dateStr) {
  return client.get(`${API_BASE}/wellness-service/wellness/dailyStress/${dateStr}`);
}

async function getHealthSnapshot(dateStr) {
  const c = await ensureLoggedIn();
  const date = new Date(dateStr);

  const [heartRate, sleep, steps, trainingReadiness, trainingStatus, bodyBattery, respiration, stress] =
    await Promise.all([
      safe(() => c.getHeartRate(date)),
      safe(() => c.getSleepData(date)),
      safe(() => c.getSteps(date)),
      safe(() => getTrainingReadiness(c, dateStr)),
      safe(() => getTrainingStatus(c, dateStr)),
      safe(() => getBodyBattery(c, dateStr)),
      safe(() => getRespiration(c, dateStr)),
      safe(() => getStress(c, dateStr)),
    ]);

  return {
    date: dateStr,
    heartRate,
    sleep,
    steps,
    trainingReadiness,
    trainingStatus,
    bodyBattery,
    respiration,
    stress,
  };
}

async function getRecentActivities(limit) {
  const c = await ensureLoggedIn();
  return c.getActivities(0, limit);
}

module.exports = { getHealthSnapshot, getRecentActivities };
