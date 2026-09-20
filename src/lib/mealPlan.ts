import { VEGAN_FOODS, type FoodItem } from "../data/veganFoods";
import type { Macros, Targets } from "../types";

interface TemplateItem {
  foodId: string;
  grams: number;
}

interface MealTemplate {
  name: string;
  items: TemplateItem[];
}

export interface PlannedItem {
  food: FoodItem;
  grams: number;
  macros: Macros;
}

export interface PlannedMeal {
  name: string;
  items: PlannedItem[];
  totals: Macros;
}

export interface MealPlanDay {
  meals: PlannedMeal[];
  totals: Macros;
  targets: Targets;
  recommendations: string[];
}

// A ~2800 kcal reference day; generateMealPlan() scales every item to the
// user's actual targets and then nudges protein-dense items to close the
// remaining protein gap.
const TEMPLATES: MealTemplate[] = [
  {
    name: "Frühstück – Porridge-Bowl",
    items: [
      { foodId: "oats", grams: 80 },
      { foodId: "soyMilk", grams: 250 },
      { foodId: "banana", grams: 120 },
      { foodId: "peanutButter", grams: 20 },
      { foodId: "chiaSeeds", grams: 15 },
    ],
  },
  {
    name: "Snack – Protein-Shake",
    items: [
      { foodId: "peaProtein", grams: 30 },
      { foodId: "soyMilk", grams: 200 },
      { foodId: "mixedBerries", grams: 100 },
    ],
  },
  {
    name: "Mittagessen – Tofu-Reis-Bowl",
    items: [
      { foodId: "tofu", grams: 150 },
      { foodId: "brownRice", grams: 200 },
      { foodId: "broccoli", grams: 150 },
      { foodId: "oliveOil", grams: 10 },
      { foodId: "hummus", grams: 30 },
    ],
  },
  {
    name: "Snack – Joghurt & Nüsse",
    items: [
      { foodId: "soyYogurt", grams: 150 },
      { foodId: "almonds", grams: 30 },
      { foodId: "dates", grams: 40 },
    ],
  },
  {
    name: "Abendessen – Linsen-Quinoa-Teller",
    items: [
      { foodId: "lentils", grams: 200 },
      { foodId: "quinoa", grams: 150 },
      { foodId: "spinach", grams: 100 },
      { foodId: "avocado", grams: 80 },
      { foodId: "walnuts", grams: 15 },
    ],
  },
];

function macrosForGrams(food: FoodItem, grams: number): Macros {
  const factor = grams / 100;
  return {
    kcal: food.per100g.kcal * factor,
    carbs: food.per100g.carbs * factor,
    protein: food.per100g.protein * factor,
    fat: food.per100g.fat * factor,
    fiber: food.per100g.fiber * factor,
  };
}

function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      carbs: acc.carbs + m.carbs,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
      fiber: acc.fiber + m.fiber,
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 },
  );
}

function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    carbs: Math.round(m.carbs * 10) / 10,
    protein: Math.round(m.protein * 10) / 10,
    fat: Math.round(m.fat * 10) / 10,
    fiber: Math.round(m.fiber * 10) / 10,
  };
}

function buildRecommendations(targets: Targets, weightKg?: number): string[] {
  const tips = [
    "Eiweißquellen kombinieren: Hülsenfrüchte + Getreide (z.B. Linsen mit Reis) ergeben ein vollständiges Aminosäureprofil.",
    "Vitamin B12 supplementieren – bei rein pflanzlicher Ernährung unverzichtbar, da keine verlässliche natürliche Quelle existiert.",
    "Auf Eisen und Zink achten: Hülsenfrüchte, Vollkorn, Kürbiskerne – dazu Vitamin C (z.B. Paprika, Zitrusfrüchte) für bessere Eisenaufnahme.",
    "Algenöl (EPA/DHA) als pflanzliche Omega-3-Quelle in Betracht ziehen, ergänzend zu Lein-, Chia- und Walnüssen (ALA).",
    "Kreatin-Monohydrat (3-5 g/Tag) ist für Veganer besonders wirksam, da die Speicher durch fehlendes Fleisch niedriger starten.",
    "Proteinverteilung: 3-5 Mahlzeiten mit je 25-40 g Protein fördern die Muskelproteinsynthese besser als 1-2 große Portionen.",
    "Ausreichend trinken: als Richtwert ca. 30-40 ml Wasser pro kg Körpergewicht, an Trainingstagen mehr.",
    "Krafttraining mit progressiver Belastungssteigerung bleibt der Haupttreiber für Muskelaufbau – die Ernährung liefert nur den Baustoff.",
    "7-9 Stunden Schlaf einplanen: Regeneration und Muskelaufbau finden zu großen Teilen im Schlaf statt.",
  ];

  if (weightKg) {
    tips.unshift(
      `Ziel: ca. ${targets.protein} g Protein/Tag (~${(targets.protein / weightKg).toFixed(1)} g/kg Körpergewicht) für effektiven Muskelaufbau.`,
    );
  }

  return tips;
}

export function generateMealPlan(targets: Targets, weightKg?: number): MealPlanDay {
  const baselineMeals = TEMPLATES.map((template) => {
    const items = template.items.map((item) => ({
      food: VEGAN_FOODS[item.foodId],
      grams: item.grams,
    }));
    return { name: template.name, items };
  });

  const baselineKcal = sumMacros(
    baselineMeals.flatMap((m) => m.items.map((i) => macrosForGrams(i.food, i.grams))),
  ).kcal;

  const kcalScale = targets.kcal / baselineKcal;

  let scaledMeals = baselineMeals.map((meal) => ({
    name: meal.name,
    items: meal.items.map((i) => ({
      food: i.food,
      grams: Math.max(5, Math.round((i.grams * kcalScale) / 5) * 5),
    })),
  }));

  // Nudge protein-dense items so the day's protein total lands closer to
  // the target without meaningfully distorting the rest of the plan.
  const flatItems = () => scaledMeals.flatMap((m) => m.items);
  const currentProtein = sumMacros(
    flatItems().map((i) => macrosForGrams(i.food, i.grams)),
  ).protein;

  const denseProtein = sumMacros(
    flatItems()
      .filter((i) => i.food.proteinDense)
      .map((i) => macrosForGrams(i.food, i.grams)),
  ).protein;

  if (denseProtein > 0) {
    const desiredDenseProtein = denseProtein + (targets.protein - currentProtein);
    const proteinScale = Math.min(
      2.5,
      Math.max(0.5, desiredDenseProtein / denseProtein),
    );
    scaledMeals = scaledMeals.map((meal) => ({
      name: meal.name,
      items: meal.items.map((i) =>
        i.food.proteinDense
          ? { food: i.food, grams: Math.max(5, Math.round((i.grams * proteinScale) / 5) * 5) }
          : i,
      ),
    }));
  }

  const meals: PlannedMeal[] = scaledMeals.map((meal) => {
    const items: PlannedItem[] = meal.items.map((i) => ({
      food: i.food,
      grams: i.grams,
      macros: roundMacros(macrosForGrams(i.food, i.grams)),
    }));
    return { name: meal.name, items, totals: roundMacros(sumMacros(items.map((i) => i.macros))) };
  });

  const totals = roundMacros(sumMacros(meals.map((m) => m.totals)));

  return {
    meals,
    totals,
    targets,
    recommendations: buildRecommendations(targets, weightKg),
  };
}
