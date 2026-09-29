import { useEffect, useState } from "react";
import { deleteEntry, getEntriesForDate, todayIso } from "../lib/db";
import MacroBars from "./MacroBars";
import type { DiaryEntry, Macros, Targets } from "../types";

const SOURCE_LABEL: Record<DiaryEntry["source"], string> = {
  openfoodfacts: "Barcode",
  ocr: "Foto",
  manual: "Manuell",
};

function sumMacros(entries: DiaryEntry[]): Macros {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.macros.kcal,
      carbs: acc.carbs + e.macros.carbs,
      protein: acc.protein + e.macros.protein,
      fat: acc.fat + e.macros.fat,
      fiber: acc.fiber + e.macros.fiber,
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 },
  );
}

export default function DiaryPage({
  targets,
  refreshSignal,
}: {
  targets: Targets;
  refreshSignal: number;
}) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const date = todayIso();

  useEffect(() => {
    getEntriesForDate(date).then(setEntries);
  }, [date, refreshSignal]);

  async function handleDelete(id: string) {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const totals = sumMacros(entries);

  return (
    <>
      <div className="card">
        <h2>Heute · {date}</h2>
        <MacroBars totals={totals} targets={targets} />
      </div>

      <div className="card">
        <h2>Einträge</h2>
        {entries.length === 0 && <p className="muted">Noch nichts erfasst – scanne einen Barcode.</p>}
        {entries
          .slice()
          .sort((a, b) => b.time.localeCompare(a.time))
          .map((entry) => (
            <div className="entry" key={entry.id}>
              <div>
                <div>{entry.productName}</div>
                <div className="meta">
                  <span className="pill">{SOURCE_LABEL[entry.source]}</span>
                  {entry.time} · {entry.grams} g · {Math.round(entry.macros.kcal)} kcal
                </div>
              </div>
              <button className="btn danger" style={{ width: "auto", padding: "0.4rem 0.7rem" }} onClick={() => handleDelete(entry.id)}>
                ✕
              </button>
            </div>
          ))}
      </div>
    </>
  );
}
