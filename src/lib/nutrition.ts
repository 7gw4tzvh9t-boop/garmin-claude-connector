import type { ActivityLevel, Goal, Targets, UserProfile } from "../types";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sitzend, kaum Bewegung",
  light: "Leicht aktiv (1-3x Sport/Woche)",
  moderate: "Mäßig aktiv (3-5x Sport/Woche)",
  active: "Sehr aktiv (6-7x Sport/Woche)",
  very_active: "Extrem aktiv (körperliche Arbeit + Sport)",
};

export const GOAL_LABELS: Record<Goal, string> = {
  bulk: "Muskelaufbau (Kalorienüberschuss)",
  maintain: "Gewicht halten, Rekomposition",
  cut: "Definition (Kaloriendefizit, Muskeln erhalten)",
};

// Grams of protein per kg body weight. Vegan diets lean toward the upper
// end of the usual sports-nutrition ranges because plant proteins tend to
// have a slightly lower leucine content and digestibility.
const PROTEIN_PER_KG: Record<Goal, number> = {
  bulk: 2.0,
  maintain: 1.8,
  cut: 2.2,
};

const GOAL_KCAL_ADJUSTMENT: Record<Goal, number> = {
  bulk: 1.12,
  maintain: 1.0,
  cut: 0.8,
};

export function calculateBmr(profile: UserProfile): number {
  const { weightKg, heightCm, age, sex } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTdee(profile: UserProfile): number {
  return calculateBmr(profile) * ACTIVITY_FACTORS[profile.activityLevel];
}

/**
 * Derives daily macro targets for a vegan muscle-building diet:
 * protein is fixed per kg bodyweight, fat is ~25% of calories, fiber
 * follows the 14g/1000kcal guideline (min. 30g), carbs fill the rest.
 */
export function calculateTargets(profile: UserProfile): Targets {
  const tdee = calculateTdee(profile);
  const kcal = Math.round(tdee * GOAL_KCAL_ADJUSTMENT[profile.goal]);

  const protein = Math.round(profile.weightKg * PROTEIN_PER_KG[profile.goal]);
  const fat = Math.round((kcal * 0.25) / 9);
  const fiber = Math.max(30, Math.round((kcal / 1000) * 14));

  const kcalFromProteinAndFat = protein * 4 + fat * 9;
  const carbs = Math.max(0, Math.round((kcal - kcalFromProteinAndFat) / 4));

  return { kcal, carbs, protein, fat, fiber };
}

export function scaleMacros(
  per100g: { kcal: number; carbs: number; protein: number; fat: number; fiber: number },
  grams: number,
) {
  const factor = grams / 100;
  return {
    kcal: Math.round(per100g.kcal * factor),
    carbs: round1(per100g.carbs * factor),
    protein: round1(per100g.protein * factor),
    fat: round1(per100g.fat * factor),
    fiber: round1(per100g.fiber * factor),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
