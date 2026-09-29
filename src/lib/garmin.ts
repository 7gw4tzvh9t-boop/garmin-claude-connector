import type { GarminActivity, GarminConfig, GarminHealthSnapshot } from "../types";

const STORAGE_KEY = "vegangains-garmin-config";

export function getGarminConfig(): GarminConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GarminConfig;
  } catch {
    return null;
  }
}

export function saveGarminConfig(config: GarminConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearGarminConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

async function garminFetch<T>(config: GarminConfig, path: string): Promise<T> {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: { "X-Api-Key": config.apiKey },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Garmin-Server antwortete mit ${res.status}`);
  }
  return res.json();
}

export async function fetchHealthSnapshot(
  config: GarminConfig,
  date: string,
): Promise<GarminHealthSnapshot> {
  return garminFetch(config, `/api/health-snapshot?date=${date}`);
}

export async function fetchRecentActivities(
  config: GarminConfig,
  limit = 10,
): Promise<GarminActivity[]> {
  return garminFetch(config, `/api/activities?limit=${limit}`);
}

/** Sums calories for activities that happened on the given ISO date (local). */
export function activityCaloriesForDate(
  activities: GarminActivity[],
  isoDate: string,
): number {
  return activities
    .filter((a) => a.startTimeLocal?.slice(0, 10) === isoDate)
    .reduce((sum, a) => sum + (a.calories ?? 0), 0);
}

// Best-effort field access: these come from an undocumented Garmin endpoint
// whose exact shape isn't publicly specified and can vary by account/region.
export function readTrainingReadinessScore(snapshot: GarminHealthSnapshot): number | null {
  const v = snapshot.trainingReadiness as
    | { score?: number; trainingReadinessScore?: number }
    | null
    | undefined;
  if (!v || typeof v !== "object") return null;
  return v.score ?? v.trainingReadinessScore ?? null;
}

export function readBodyBatteryLevel(snapshot: GarminHealthSnapshot): number | null {
  const v = snapshot.bodyBattery as
    | { charged?: number; bodyBatteryValuesArray?: [number, number][] }
    | null
    | undefined;
  if (!v || typeof v !== "object") return null;
  if (Array.isArray(v.bodyBatteryValuesArray) && v.bodyBatteryValuesArray.length > 0) {
    const last = v.bodyBatteryValuesArray[v.bodyBatteryValuesArray.length - 1];
    return last?.[1] ?? null;
  }
  return v.charged ?? null;
}

export function readRestingHeartRate(snapshot: GarminHealthSnapshot): number | null {
  const v = snapshot.heartRate as { restingHeartRate?: number } | null | undefined;
  return v?.restingHeartRate ?? null;
}

export function readRespirationAvg(snapshot: GarminHealthSnapshot): number | null {
  const v = snapshot.respiration as
    | { avgSleepRespirationValue?: number; avgWakingRespirationValue?: number }
    | null
    | undefined;
  return v?.avgWakingRespirationValue ?? v?.avgSleepRespirationValue ?? null;
}

export function readSleepHours(snapshot: GarminHealthSnapshot): number | null {
  const v = snapshot.sleep as
    | { dailySleepDTO?: { sleepTimeSeconds?: number } }
    | null
    | undefined;
  const seconds = v?.dailySleepDTO?.sleepTimeSeconds;
  return typeof seconds === "number" ? Math.round((seconds / 3600) * 10) / 10 : null;
}
