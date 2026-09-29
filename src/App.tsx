import { useEffect, useState } from "react";
import DiaryPage from "./components/DiaryPage";
import ScanPage from "./components/ScanPage";
import GoalsPage, { DEFAULT_PROFILE } from "./components/GoalsPage";
import MealPlanPage from "./components/MealPlanPage";
import TrainingPage from "./components/TrainingPage";
import { getProfile, todayIso } from "./lib/db";
import { calculateTargets, calculateTargetsWithGarminBoost } from "./lib/nutrition";
import { activityCaloriesForDate, fetchRecentActivities, getGarminConfig } from "./lib/garmin";
import type { GarminConfig, UserProfile } from "./types";

type Tab = "diary" | "scan" | "plan" | "training" | "goals";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "diary", icon: "📔", label: "Tagebuch" },
  { id: "scan", icon: "📷", label: "Scannen" },
  { id: "plan", icon: "🥗", label: "Ernährung" },
  { id: "training", icon: "⌚", label: "Training" },
  { id: "goals", icon: "🎯", label: "Ziele" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("diary");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [garminConfig, setGarminConfig] = useState<GarminConfig | null>(() => getGarminConfig());
  const [activeCaloriesToday, setActiveCaloriesToday] = useState<number | null>(null);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p ?? null);
      setProfileLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!garminConfig?.useForTargets) {
      setActiveCaloriesToday(null);
      return;
    }
    let cancelled = false;
    fetchRecentActivities(garminConfig, 20)
      .then((activities) => {
        if (cancelled) return;
        setActiveCaloriesToday(activityCaloriesForDate(activities, todayIso()));
      })
      .catch(() => {
        if (!cancelled) setActiveCaloriesToday(null);
      });
    return () => {
      cancelled = true;
    };
  }, [garminConfig]);

  if (!profileLoaded) return null;

  const effectiveProfile = profile ?? DEFAULT_PROFILE;
  const targets =
    garminConfig?.useForTargets && activeCaloriesToday !== null
      ? calculateTargetsWithGarminBoost(effectiveProfile, activeCaloriesToday)
      : calculateTargets(effectiveProfile);

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
        {tab === "training" && <TrainingPage onConfigChanged={setGarminConfig} />}
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
