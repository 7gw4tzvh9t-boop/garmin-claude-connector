import { useEffect, useState } from "react";
import {
  activityCaloriesForDate,
  fetchHealthSnapshot,
  fetchRecentActivities,
  getGarminConfig,
  readBodyBatteryLevel,
  readRespirationAvg,
  readRestingHeartRate,
  readSleepHours,
  readTrainingReadinessScore,
  saveGarminConfig,
} from "../lib/garmin";
import { todayIso } from "../lib/db";
import type { GarminActivity, GarminConfig, GarminHealthSnapshot } from "../types";

export default function TrainingPage({
  onConfigChanged,
}: {
  onConfigChanged: (config: GarminConfig | null) => void;
}) {
  const [config, setConfig] = useState<GarminConfig | null>(() => getGarminConfig());
  const [form, setForm] = useState<GarminConfig>(
    config ?? { baseUrl: "", apiKey: "", useForTargets: true },
  );
  const [snapshot, setSnapshot] = useState<GarminHealthSnapshot | null>(null);
  const [activities, setActivities] = useState<GarminActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    load(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  async function load(cfg: GarminConfig) {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([
        fetchHealthSnapshot(cfg, todayIso()),
        fetchRecentActivities(cfg, 10),
      ]);
      setSnapshot(s);
      setActivities(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verbindung zum Garmin-Server fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!form.baseUrl || !form.apiKey) return;
    saveGarminConfig(form);
    setConfig(form);
    onConfigChanged(form);
  }

  function handleDisconnect() {
    setConfig(null);
    setSnapshot(null);
    setActivities([]);
    localStorage.removeItem("vegangains-garmin-config");
    onConfigChanged(null);
  }

  if (!config) {
    return (
      <div className="card">
        <h2>Garmin verbinden</h2>
        <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
          Dafür muss der kleine Garmin-Server (siehe <code>server/README.md</code>) laufen und
          erreichbar sein. Trage hier seine URL und den API-Key ein, den du dort festgelegt hast.
        </p>
        <label>Server-URL</label>
        <input
          placeholder="https://dein-server.onrender.com"
          value={form.baseUrl}
          onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
        />
        <label>API-Key</label>
        <input
          type="password"
          value={form.apiKey}
          onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
        />
        <button className="btn" style={{ marginTop: "1rem" }} onClick={handleSave}>
          Verbinden
        </button>
      </div>
    );
  }

  const readiness = snapshot ? readTrainingReadinessScore(snapshot) : null;
  const bodyBattery = snapshot ? readBodyBatteryLevel(snapshot) : null;
  const restingHr = snapshot ? readRestingHeartRate(snapshot) : null;
  const respiration = snapshot ? readRespirationAvg(snapshot) : null;
  const sleepHours = snapshot ? readSleepHours(snapshot) : null;
  const todaysCalories = activityCaloriesForDate(activities, todayIso());

  return (
    <>
      <div className="card">
        <h2>Heute · Garmin</h2>
        {loading && <p className="muted">Lade…</p>}
        {error && <p className="error-box">{error}</p>}
        {snapshot && !loading && (
          <div className="row" style={{ flexWrap: "wrap", gap: "0.6rem" }}>
            <Stat label="Trainingsbereitschaft" value={readiness !== null ? `${readiness}` : "–"} />
            <Stat label="Body Battery" value={bodyBattery !== null ? `${bodyBattery}` : "–"} />
            <Stat label="Ruhepuls" value={restingHr !== null ? `${restingHr} bpm` : "–"} />
            <Stat label="Atemfrequenz" value={respiration !== null ? `${respiration}/min` : "–"} />
            <Stat label="Schlaf" value={sleepHours !== null ? `${sleepHours} h` : "–"} />
            <Stat label="Aktiv verbrannt" value={`${todaysCalories} kcal`} />
          </div>
        )}
        <button className="btn secondary" style={{ marginTop: "0.8rem" }} onClick={() => load(config)}>
          Aktualisieren
        </button>
      </div>

      <div className="card">
        <h2>Letzte Aktivitäten</h2>
        {activities.length === 0 && <p className="muted">Keine Aktivitäten gefunden.</p>}
        {activities.map((a) => (
          <div className="entry" key={a.activityId}>
            <div>
              <div>{a.activityName || a.activityType?.typeKey || "Aktivität"}</div>
              <div className="meta">{a.startTimeLocal?.slice(0, 16).replace("T", " ")}</div>
            </div>
            <div className="meta">
              {a.calories ? `${Math.round(a.calories)} kcal` : ""}
              {a.averageHR ? ` · ⌀ ${Math.round(a.averageHR)} bpm` : ""}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Einstellungen</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={form.useForTargets}
            onChange={(e) => {
              const updated = { ...form, useForTargets: e.target.checked };
              setForm(updated);
              saveGarminConfig(updated);
              setConfig(updated);
              onConfigChanged(updated);
            }}
          />
          Kalorienziel automatisch an heutiges Training anpassen
        </label>
        <p className="muted" style={{ fontSize: "0.8rem" }}>
          Wenn aktiv, ersetzt das heutige Garmin-Kalorienplus deinen pauschalen Aktivitätslevel
          für den Tagesbedarf (in den Zielen).
        </p>
        <button className="btn danger" onClick={handleDisconnect}>
          Garmin trennen
        </button>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ flex: "1 1 45%", background: "var(--surface-2)", margin: 0 }}>
      <h3 style={{ margin: "0 0 0.2rem" }}>{label}</h3>
      <p style={{ margin: 0, fontSize: "1.1rem" }}>{value}</p>
    </div>
  );
}
