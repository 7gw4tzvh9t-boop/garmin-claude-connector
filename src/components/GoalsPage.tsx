import { useState } from "react";
import { saveProfile } from "../lib/db";
import { ACTIVITY_LABELS, GOAL_LABELS, calculateTargets } from "../lib/nutrition";
import type { ActivityLevel, Goal, Sex, UserProfile } from "../types";

export const DEFAULT_PROFILE: UserProfile = {
  id: "me",
  weightKg: 75,
  heightCm: 178,
  age: 28,
  sex: "male",
  activityLevel: "moderate",
  goal: "bulk",
};

export default function GoalsPage({
  profile,
  onSaved,
}: {
  profile: UserProfile | null;
  onSaved: (profile: UserProfile) => void;
}) {
  const [form, setForm] = useState<UserProfile>(profile ?? DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  const targets = calculateTargets(form);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    await saveProfile(form);
    onSaved(form);
    setSaved(true);
  }

  return (
    <>
      <div className="card">
        <h2>Deine Ziele</h2>
        <div className="row">
          <div>
            <label>Gewicht (kg)</label>
            <input
              type="number"
              value={form.weightKg}
              onChange={(e) => update("weightKg", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>Größe (cm)</label>
            <input
              type="number"
              value={form.heightCm}
              onChange={(e) => update("heightCm", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Alter</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => update("age", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>Geschlecht</label>
            <select value={form.sex} onChange={(e) => update("sex", e.target.value as Sex)}>
              <option value="male">Männlich</option>
              <option value="female">Weiblich</option>
            </select>
          </div>
        </div>

        <label>Aktivitätslevel</label>
        <select
          value={form.activityLevel}
          onChange={(e) => update("activityLevel", e.target.value as ActivityLevel)}
        >
          {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <label>Ziel</label>
        <select value={form.goal} onChange={(e) => update("goal", e.target.value as Goal)}>
          {Object.entries(GOAL_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <button className="btn" style={{ marginTop: "1rem" }} onClick={handleSave}>
          {saved ? "Gespeichert ✓" : "Speichern"}
        </button>
      </div>

      <div className="card">
        <h2>Berechnete Tagesziele</h2>
        <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
          Basierend auf Mifflin-St-Jeor-Formel, deinem Aktivitätslevel und einer
          proteinbetonten veganen Ernährung für Muskelaufbau.
        </p>
        <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
          <li>{targets.kcal} kcal</li>
          <li>{targets.protein} g Protein</li>
          <li>{targets.carbs} g Kohlenhydrate</li>
          <li>{targets.fat} g Fett</li>
          <li>{targets.fiber} g Ballaststoffe</li>
        </ul>
      </div>
    </>
  );
}
