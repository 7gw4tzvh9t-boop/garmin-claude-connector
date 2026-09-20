import { useMemo, useState } from "react";
import type { Product } from "../types";
import { scaleMacros } from "../lib/nutrition";

export default function ProductLogForm({
  product,
  editableName = false,
  onSave,
  onCancel,
}: {
  product: Product;
  editableName?: boolean;
  onSave: (product: Product, grams: number) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [grams, setGrams] = useState(100);
  const [per100g, setPer100g] = useState(product.per100g);

  const preview = useMemo(() => scaleMacros(per100g, grams || 0), [per100g, grams]);

  function setField(field: keyof typeof per100g, value: string) {
    const n = parseFloat(value.replace(",", "."));
    setPer100g((prev) => ({ ...prev, [field]: Number.isFinite(n) ? n : 0 }));
  }

  return (
    <div className="card">
      <h2>{product.brand ? `${name} · ${product.brand}` : name}</h2>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt=""
          style={{ maxHeight: 90, borderRadius: 8, marginBottom: "0.6rem" }}
        />
      )}

      {editableName && (
        <>
          <label>Produktname</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </>
      )}

      <h3>Nährwerte pro 100 g {product.source === "ocr" && "(aus Foto erkannt – bitte prüfen)"}</h3>
      <div className="row">
        <div>
          <label>Kalorien (kcal)</label>
          <input
            type="number"
            value={per100g.kcal}
            onChange={(e) => setField("kcal", e.target.value)}
          />
        </div>
        <div>
          <label>Protein (g)</label>
          <input
            type="number"
            value={per100g.protein}
            onChange={(e) => setField("protein", e.target.value)}
          />
        </div>
      </div>
      <div className="row">
        <div>
          <label>Kohlenhydrate (g)</label>
          <input
            type="number"
            value={per100g.carbs}
            onChange={(e) => setField("carbs", e.target.value)}
          />
        </div>
        <div>
          <label>Fett (g)</label>
          <input
            type="number"
            value={per100g.fat}
            onChange={(e) => setField("fat", e.target.value)}
          />
        </div>
      </div>
      <label>Ballaststoffe (g)</label>
      <input
        type="number"
        value={per100g.fiber}
        onChange={(e) => setField("fiber", e.target.value)}
      />

      <label>Verzehrte Menge (g)</label>
      <input
        type="number"
        value={grams}
        onChange={(e) => setGrams(parseFloat(e.target.value) || 0)}
      />

      <div className="card" style={{ marginTop: "0.8rem", background: "var(--surface-2)" }}>
        <h3>Für {grams || 0} g</h3>
        <p style={{ margin: 0 }}>
          {preview.kcal} kcal · {preview.protein} g Protein · {preview.carbs} g KH ·{" "}
          {preview.fat} g Fett · {preview.fiber} g Ballaststoffe
        </p>
      </div>

      <div className="row" style={{ marginTop: "0.8rem" }}>
        <button className="btn secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button
          className="btn"
          disabled={!grams}
          onClick={() =>
            onSave({ ...product, name, per100g }, grams)
          }
        >
          Zum Tagebuch hinzufügen
        </button>
      </div>
    </div>
  );
}
