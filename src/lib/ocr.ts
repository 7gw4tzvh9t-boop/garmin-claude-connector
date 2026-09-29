import type { Macros } from "../types";

export interface OcrDraft {
  rawText: string;
  values: Partial<Macros>;
}

function extractNumberNear(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const cleaned = match[1].replace(",", ".");
      const n = parseFloat(cleaned);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

/**
 * Best-effort parser for EU-style "Nährwerttabelle" text (per 100g/100ml).
 * OCR of printed nutrition tables is noisy, so every value is a draft the
 * user confirms/corrects in the form afterwards - this never auto-saves.
 */
export function parseNutritionText(rawText: string): Partial<Macros> {
  const text = rawText.replace(/\r/g, " ").replace(/\s+/g, " ");
  const num = /(\d+[.,]?\d*)/.source;

  const kcal = extractNumberNear(text, [
    new RegExp(`${num}\\s*kcal`, "i"),
    new RegExp(`kcal[^\\d]{0,10}${num}`, "i"),
  ]);

  const carbs = extractNumberNear(text, [
    new RegExp(`kohlenhydrate[^\\d]{0,15}${num}\\s*g`, "i"),
    new RegExp(`carbohydrate[s]?[^\\d]{0,15}${num}\\s*g`, "i"),
  ]);

  const protein = extractNumberNear(text, [
    new RegExp(`eiwei[ßs]{1,2}[^\\d]{0,15}${num}\\s*g`, "i"),
    new RegExp(`protein[^\\d]{0,15}${num}\\s*g`, "i"),
  ]);

  const fat = extractNumberNear(text, [
    new RegExp(`fett[^\\d]{0,15}${num}\\s*g`, "i"),
    new RegExp(`\\bfat[^\\d]{0,15}${num}\\s*g`, "i"),
  ]);

  const fiber = extractNumberNear(text, [
    new RegExp(`ballaststoffe[^\\d]{0,15}${num}\\s*g`, "i"),
    new RegExp(`fib(?:er|re)[^\\d]{0,15}${num}\\s*g`, "i"),
  ]);

  const values: Partial<Macros> = {};
  if (kcal !== undefined) values.kcal = kcal;
  if (carbs !== undefined) values.carbs = carbs;
  if (protein !== undefined) values.protein = protein;
  if (fat !== undefined) values.fat = fat;
  if (fiber !== undefined) values.fiber = fiber;
  return values;
}

export async function runLabelOcr(
  image: File | Blob,
  onProgress?: (progress: number) => void,
): Promise<OcrDraft> {
  // Loaded lazily: tesseract.js pulls in a sizeable wasm/worker bundle that
  // most sessions (barcode scans) never need.
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["deu", "eng"], undefined, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(m.progress);
      }
    },
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(image);
    return { rawText: text, values: parseNutritionText(text) };
  } finally {
    await worker.terminate();
  }
}
