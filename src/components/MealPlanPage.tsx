import { useMemo, useState } from "react";
import { generateMealPlan } from "../lib/mealPlan";
import type { Targets, UserProfile } from "../types";

export default function MealPlanPage({
  targets,
  profile,
}: {
  targets: Targets;
  profile: UserProfile | null;
}) {
  const [seed, setSeed] = useState(0);
  const plan = useMemo(
    () => generateMealPlan(targets, profile?.weightKg),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targets, profile?.weightKg, seed],
  );

  return (
    <>
      <div className="card">
        <h2>Veganer Ernährungsplan – Muskelaufbau</h2>
        <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
          Ein Beispieltag, skaliert auf deine Ziele ({targets.kcal} kcal ·{" "}
          {targets.protein} g Protein). Mengen gerne austauschen/anpassen – wichtig sind
          vor allem die Tagestotale.
        </p>
        <button className="btn secondary" onClick={() => setSeed((s) => s + 1)}>
          Neu berechnen
        </button>
      </div>

      {plan.meals.map((meal) => (
        <div className="card" key={meal.name}>
          <h2>{meal.name}</h2>
          {meal.items.map((item) => (
            <div className="entry" key={item.food.id}>
              <div>{item.food.name}</div>
              <div className="meta">{item.grams} g</div>
            </div>
          ))}
          <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.5rem", marginBottom: 0 }}>
            {meal.totals.kcal} kcal · {meal.totals.protein} g P · {meal.totals.carbs} g KH ·{" "}
            {meal.totals.fat} g F · {meal.totals.fiber} g Ballaststoffe
          </p>
        </div>
      ))}

      <div className="card">
        <h2>Tagessumme</h2>
        <p>
          {plan.totals.kcal} kcal · {plan.totals.protein} g Protein ·{" "}
          {plan.totals.carbs} g Kohlenhydrate · {plan.totals.fat} g Fett ·{" "}
          {plan.totals.fiber} g Ballaststoffe
        </p>
      </div>

      <div className="card">
        <h2>Empfehlungen für Muskelaufbau (vegan)</h2>
        <ul className="recommendation-list">
          {plan.recommendations.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
