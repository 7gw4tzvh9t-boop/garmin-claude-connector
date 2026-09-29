import { useEffect, useState } from "react";
import DiaryPage from "./components/DiaryPage";
import ScanPage from "./components/ScanPage";
import GoalsPage, { DEFAULT_PROFILE } from "./components/GoalsPage";
import MealPlanPage from "./components/MealPlanPage";
import { getProfile } from "./lib/db";
import { calculateTargets } from "./lib/nutrition";
import type { UserProfile } from "./types";

type Tab = "diary" | "scan" | "plan" | "goals";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "diary", icon: "📔", label: "Tagebuch" },
  { id: "scan", icon: "📷", label: "Scannen" },
  { id: "plan", icon: "🥗", label: "Ernährung" },
  { id: "goals", icon: "🎯", label: "Ziele" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("diary");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p ?? null);
      setProfileLoaded(true);
    });
  }, []);

  if (!profileLoaded) return null;

  const targets = calculateTargets(profile ?? DEFAULT_PROFILE);

  return (
    <>
      <header className="app-header">
        <h1>🌱 VeganGains Tracker</h1>
        <p>Barcode &amp; Foto → Nährwerte → Muskelaufbau-Plan</p>
      </header>

      <main>
        {tab === "diary" && <DiaryPage targets={targets} refreshSignal={refreshSignal} />}
        {tab === "scan" && (
          <ScanPage
            onLogged={() => {
              setRefreshSignal((s) => s + 1);
              setTab("diary");
            }}
          />
        )}
        {tab === "plan" && <MealPlanPage targets={targets} profile={profile} />}
        {tab === "goals" && (
          <GoalsPage profile={profile} onSaved={(p) => setProfile(p)} />
        )}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            <span className="icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
