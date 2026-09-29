import type { Macros } from "../types";

export interface FoodItem {
  id: string;
  name: string;
  per100g: Macros;
  /** true for the foods used to correct the protein total toward the target. */
  proteinDense?: boolean;
}

// Approximate values per 100 g (edible portion, cooked where relevant).
export const VEGAN_FOODS: Record<string, FoodItem> = {
  oats: { id: "oats", name: "Haferflocken", per100g: { kcal: 371, carbs: 58, protein: 13, fat: 7, fiber: 10 } },
  soyMilk: { id: "soyMilk", name: "Sojamilch (ungesüßt)", per100g: { kcal: 33, carbs: 1, protein: 3.3, fat: 1.8, fiber: 0.6 } },
  banana: { id: "banana", name: "Banane", per100g: { kcal: 89, carbs: 23, protein: 1.1, fat: 0.3, fiber: 2.6 } },
  peanutButter: { id: "peanutButter", name: "Erdnussbutter", per100g: { kcal: 588, carbs: 20, protein: 25, fat: 50, fiber: 6 } },
  chiaSeeds: { id: "chiaSeeds", name: "Chiasamen", per100g: { kcal: 486, carbs: 42, protein: 17, fat: 31, fiber: 34 } },
  tofu: { id: "tofu", name: "Tofu (fest)", per100g: { kcal: 144, carbs: 3, protein: 15, fat: 8, fiber: 2 }, proteinDense: true },
  tempeh: { id: "tempeh", name: "Tempeh", per100g: { kcal: 190, carbs: 9, protein: 20, fat: 11, fiber: 5 }, proteinDense: true },
  seitan: { id: "seitan", name: "Seitan", per100g: { kcal: 370, carbs: 14, protein: 75, fat: 1.9, fiber: 0.6 }, proteinDense: true },
  lentils: { id: "lentils", name: "Linsen (gekocht)", per100g: { kcal: 116, carbs: 20, protein: 9, fat: 0.4, fiber: 8 }, proteinDense: true },
  chickpeas: { id: "chickpeas", name: "Kichererbsen (gekocht)", per100g: { kcal: 164, carbs: 27, protein: 9, fat: 2.6, fiber: 8 } },
  blackBeans: { id: "blackBeans", name: "Schwarze Bohnen (gekocht)", per100g: { kcal: 132, carbs: 24, protein: 9, fat: 0.5, fiber: 8.7 } },
  quinoa: { id: "quinoa", name: "Quinoa (gekocht)", per100g: { kcal: 120, carbs: 21, protein: 4.4, fat: 1.9, fiber: 2.8 } },
  brownRice: { id: "brownRice", name: "Vollkornreis (gekocht)", per100g: { kcal: 123, carbs: 26, protein: 2.7, fat: 1, fiber: 1.8 } },
  wholeWheatPasta: { id: "wholeWheatPasta", name: "Vollkornnudeln (gekocht)", per100g: { kcal: 124, carbs: 25, protein: 5.3, fat: 1.1, fiber: 3.5 } },
  potatoes: { id: "potatoes", name: "Kartoffeln (gekocht)", per100g: { kcal: 87, carbs: 20, protein: 1.9, fat: 0.1, fiber: 1.8 } },
  broccoli: { id: "broccoli", name: "Brokkoli (gedämpft)", per100g: { kcal: 35, carbs: 7, protein: 2.4, fat: 0.4, fiber: 3.3 } },
  spinach: { id: "spinach", name: "Spinat", per100g: { kcal: 23, carbs: 3.6, protein: 2.9, fat: 0.4, fiber: 2.2 } },
  almonds: { id: "almonds", name: "Mandeln", per100g: { kcal: 579, carbs: 22, protein: 21, fat: 50, fiber: 12.5 } },
  walnuts: { id: "walnuts", name: "Walnüsse", per100g: { kcal: 654, carbs: 14, protein: 15, fat: 65, fiber: 6.7 } },
  oliveOil: { id: "oliveOil", name: "Olivenöl", per100g: { kcal: 884, carbs: 0, protein: 0, fat: 100, fiber: 0 } },
  avocado: { id: "avocado", name: "Avocado", per100g: { kcal: 160, carbs: 8.5, protein: 2, fat: 15, fiber: 6.7 } },
  edamame: { id: "edamame", name: "Edamame (gekocht)", per100g: { kcal: 121, carbs: 10, protein: 12, fat: 5, fiber: 5 }, proteinDense: true },
  peaProtein: { id: "peaProtein", name: "Veganes Proteinpulver (Erbse/Reis)", per100g: { kcal: 380, carbs: 5, protein: 80, fat: 6, fiber: 3 }, proteinDense: true },
  soyYogurt: { id: "soyYogurt", name: "Sojajoghurt (natur)", per100g: { kcal: 60, carbs: 3, protein: 4, fat: 3, fiber: 0.8 } },
  mixedBerries: { id: "mixedBerries", name: "Beeren (TK, gemischt)", per100g: { kcal: 45, carbs: 9, protein: 0.8, fat: 0.4, fiber: 3.5 } },
  wholegrainBread: { id: "wholegrainBread", name: "Vollkornbrot", per100g: { kcal: 250, carbs: 41, protein: 9, fat: 3.5, fiber: 7 } },
  hummus: { id: "hummus", name: "Hummus", per100g: { kcal: 220, carbs: 15, protein: 8, fat: 15, fiber: 6 } },
  dates: { id: "dates", name: "Datteln", per100g: { kcal: 277, carbs: 75, protein: 1.8, fat: 0.2, fiber: 6.7 } },
};
