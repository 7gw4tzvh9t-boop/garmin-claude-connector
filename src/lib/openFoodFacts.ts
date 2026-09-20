import type { Product } from "../types";

interface OffResponse {
  status: number;
  product?: {
    product_name?: string;
    product_name_de?: string;
    brands?: string;
    image_front_small_url?: string;
    nutriments?: Record<string, number | string | undefined>;
  };
}

function num(value: number | string | undefined): number {
  if (value === undefined) return 0;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Looks up a food product by EAN/UPC barcode via the free, keyless
 * Open Food Facts API. Returns null if the barcode is unknown there.
 */
export async function fetchProductByBarcode(
  barcode: string,
): Promise<Product | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    barcode,
  )}.json?fields=product_name,product_name_de,brands,image_front_small_url,nutriments`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open Food Facts Anfrage fehlgeschlagen (${res.status})`);

  const data: OffResponse = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments ?? {};
  const name = p.product_name_de || p.product_name;
  if (!name) return null;

  return {
    barcode,
    name,
    brand: p.brands,
    imageUrl: p.image_front_small_url,
    source: "openfoodfacts",
    per100g: {
      kcal: num(n["energy-kcal_100g"]),
      carbs: num(n["carbohydrates_100g"]),
      protein: num(n["proteins_100g"]),
      fat: num(n["fat_100g"]),
      fiber: num(n["fiber_100g"]),
    },
  };
}
