export interface Macros {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
}

export type ProductSource = "openfoodfacts" | "manual" | "ocr";

export interface Product {
  barcode?: string;
  name: string;
  brand?: string;
  /** Nutrition values per 100 g / 100 ml of the product. */
  per100g: Macros;
  source: ProductSource;
  imageUrl?: string;
}

export interface DiaryEntry {
  id: string;
  /** ISO date, e.g. 2026-09-20 */
  date: string;
  time: string;
  productName: string;
  barcode?: string;
  grams: number;
  /** Absolute macros for the logged portion (grams * per100g / 100). */
  macros: Macros;
  source: ProductSource;
}

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "bulk" | "maintain" | "cut";

export interface UserProfile {
  id: "me";
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface Targets extends Macros {}

export interface GarminConfig {
  baseUrl: string;
  apiKey: string;
  /** Use today's logged Garmin activity calories to refine the kcal/macro targets. */
  useForTargets: boolean;
}

export interface GarminActivity {
  activityId: number;
  activityName: string;
  startTimeLocal: string;
  activityType?: { typeKey?: string };
  duration?: number;
  calories?: number;
  averageHR?: number;
}

export interface GarminHealthSnapshot {
  date: string;
  heartRate: unknown;
  sleep: unknown;
  steps: unknown;
  trainingReadiness: unknown;
  trainingStatus: unknown;
  bodyBattery: unknown;
  respiration: unknown;
  stress: unknown;
}
