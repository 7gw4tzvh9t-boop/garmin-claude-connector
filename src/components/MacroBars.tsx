import type { Macros, Targets } from "../types";

const ROWS: { key: keyof Macros; label: string; unit: string; color: string }[] = [
  { key: "kcal", label: "Kalorien", unit: "kcal", color: "var(--accent-2)" },
  { key: "protein", label: "Protein", unit: "g", color: "var(--protein)" },
  { key: "carbs", label: "Kohlenhydrate", unit: "g", color: "var(--carbs)" },
  { key: "fat", label: "Fett", unit: "g", color: "var(--fat)" },
  { key: "fiber", label: "Ballaststoffe", unit: "g", color: "var(--fiber)" },
];

export default function MacroBars({
  totals,
  targets,
}: {
  totals: Macros;
  targets: Targets;
}) {
  return (
    <div>
      {ROWS.map((row) => {
        const value = totals[row.key];
        const target = targets[row.key] || 1;
        const pct = Math.min(100, Math.round((value / target) * 100));
        return (
          <div className="progress" key={row.key}>
            <div className="progress-label">
              <span>{row.label}</span>
              <span className="muted">
                {Math.round(value * 10) / 10} / {Math.round(target)} {row.unit}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${pct}%`,
                  background: row.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
