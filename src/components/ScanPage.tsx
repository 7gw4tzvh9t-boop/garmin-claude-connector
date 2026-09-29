import { useCallback, useState } from "react";
import BarcodeScanner from "./BarcodeScanner";
import PhotoLabelCapture from "./PhotoLabelCapture";
import ProductLogForm from "./ProductLogForm";
import { fetchProductByBarcode } from "../lib/openFoodFacts";
import { addEntry, cacheProduct, getCachedProduct, todayIso } from "../lib/db";
import { scaleMacros } from "../lib/nutrition";
import type { DiaryEntry, Product } from "../types";

type Mode = "scan" | "looking-up" | "not-found" | "photo" | "manual" | "log";

const EMPTY_PRODUCT: Product = {
  name: "Manueller Eintrag",
  source: "manual",
  per100g: { kcal: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 },
};

export default function ScanPage({ onLogged }: { onLogged: () => void }) {
  const [mode, setMode] = useState<Mode>("scan");
  const [product, setProduct] = useState<Product | null>(null);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleDetected = useCallback(async (barcode: string) => {
    setLastBarcode(barcode);
    setMode("looking-up");
    setLookupError(null);
    try {
      const cached = await getCachedProduct(barcode);
      if (cached) {
        setProduct(cached);
        setMode("log");
        return;
      }
      const found = await fetchProductByBarcode(barcode);
      if (found) {
        await cacheProduct(found);
        setProduct(found);
        setMode("log");
      } else {
        setMode("not-found");
      }
    } catch {
      setLookupError(
        "Abfrage bei Open Food Facts fehlgeschlagen (keine Internetverbindung?).",
      );
      setMode("not-found");
    }
  }, []);

  async function handleSave(finalProduct: Product, grams: number) {
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: todayIso(),
      time: new Date().toTimeString().slice(0, 5),
      productName: finalProduct.name,
      barcode: finalProduct.barcode,
      grams,
      macros: scaleMacros(finalProduct.per100g, grams),
      source: finalProduct.source,
    };
    await addEntry(entry);
    if (finalProduct.barcode) await cacheProduct(finalProduct);
    onLogged();
    reset();
  }

  function reset() {
    setMode("scan");
    setProduct(null);
    setLastBarcode(null);
    setLookupError(null);
  }

  if (mode === "log" && product) {
    return (
      <ProductLogForm
        product={product}
        editableName={product.source !== "openfoodfacts"}
        onSave={handleSave}
        onCancel={reset}
      />
    );
  }

  if (mode === "photo") {
    return (
      <PhotoLabelCapture
        onDraftReady={(draft) => {
          setProduct({ ...draft, barcode: lastBarcode ?? undefined });
          setMode("log");
        }}
        onCancel={reset}
      />
    );
  }

  if (mode === "manual") {
    return (
      <ProductLogForm
        product={{ ...EMPTY_PRODUCT, barcode: lastBarcode ?? undefined }}
        editableName
        onSave={handleSave}
        onCancel={reset}
      />
    );
  }

  if (mode === "looking-up") {
    return (
      <div className="card">
        <p>Suche Barcode {lastBarcode} bei Open Food Facts…</p>
      </div>
    );
  }

  if (mode === "not-found") {
    return (
      <div className="card">
        <h2>Produkt nicht gefunden</h2>
        {lookupError && <p className="error-box">{lookupError}</p>}
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Barcode {lastBarcode} ist nicht in der Open-Food-Facts-Datenbank hinterlegt.
          Fotografiere stattdessen die Nährwerttabelle oder trage die Werte manuell ein.
        </p>
        <div className="row">
          <button className="btn" onClick={() => setMode("photo")}>
            Etikett fotografieren
          </button>
          <button className="btn secondary" onClick={() => setMode("manual")}>
            Manuell eingeben
          </button>
        </div>
        <button className="btn secondary" style={{ marginTop: "0.6rem" }} onClick={reset}>
          Erneut scannen
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Barcode scannen</h2>
      <BarcodeScanner onDetected={handleDetected} />
      <div className="row" style={{ marginTop: "0.8rem" }}>
        <button className="btn secondary" onClick={() => setMode("photo")}>
          Stattdessen Etikett fotografieren
        </button>
        <button className="btn secondary" onClick={() => setMode("manual")}>
          Manuell eingeben
        </button>
      </div>
    </div>
  );
}
