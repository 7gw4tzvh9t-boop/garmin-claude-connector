import { useRef, useState } from "react";
import { runLabelOcr } from "../lib/ocr";
import type { Product } from "../types";

export default function PhotoLabelCapture({
  onDraftReady,
  onCancel,
}: {
  onDraftReady: (product: Product) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const { values, rawText } = await runLabelOcr(file, setProgress);
      if (Object.keys(values).length === 0) {
        setError(
          "Es konnten keine Nährwerte erkannt werden. Bitte Foto der Nährwerttabelle (nicht der Zutatenliste) machen oder manuell eingeben.",
        );
      }
      onDraftReady({
        name: guessNameFromText(rawText) ?? "Foto-Erfassung",
        source: "ocr",
        per100g: {
          kcal: values.kcal ?? 0,
          carbs: values.carbs ?? 0,
          protein: values.protein ?? 0,
          fat: values.fat ?? 0,
          fiber: values.fiber ?? 0,
        },
      });
    } catch {
      setError("Fototext konnte nicht analysiert werden. Bitte erneut versuchen oder manuell eingeben.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="card">
      <h2>Nährwerttabelle fotografieren</h2>
      <p className="muted" style={{ fontSize: "0.85rem" }}>
        Foto der Nährwerttabelle auf der Verpackung machen. Die Werte werden automatisch
        vorausgefüllt – bitte danach kurz prüfen, da Texterkennung Fehler machen kann.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {progress === null ? (
        <button className="btn" onClick={() => inputRef.current?.click()}>
          Foto aufnehmen
        </button>
      ) : (
        <p>Analysiere Foto… {Math.round(progress * 100)}%</p>
      )}

      {error && <p className="error-box">{error}</p>}

      <button className="btn secondary" style={{ marginTop: "0.6rem" }} onClick={onCancel}>
        Abbrechen
      </button>
    </div>
  );
}

function guessNameFromText(text: string): string | undefined {
  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 2 && /[a-zA-ZäöüÄÖÜß]/.test(l));
  return firstLine?.slice(0, 60);
}
