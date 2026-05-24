export interface FoodLookupResult {
  barcode: string;
  name: string;
  brand?: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "openfoodfacts";
}

interface OFFNutriments {
  "energy-kcal_serving"?: number;
  "energy-kcal_100g"?: number;
  energy_serving?: number;
  energy_100g?: number;
  proteins_serving?: number;
  proteins_100g?: number;
  carbohydrates_serving?: number;
  carbohydrates_100g?: number;
  fat_serving?: number;
  fat_100g?: number;
}

interface OFFProduct {
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OFFNutriments;
}

interface OFFResponse {
  status: number;
  product?: OFFProduct;
}

function num(...vals: Array<number | undefined>): number {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return v;
  }
  return 0;
}

export async function lookupBarcode(barcode: string): Promise<FoodLookupResult | null> {
  const trimmed = barcode.trim();
  if (!/^\d{6,14}$/.test(trimmed)) {
    throw new Error("That doesn't look like a valid barcode.");
  }

  let res: Response;
  try {
    res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(trimmed)}.json?fields=product_name,product_name_en,generic_name,brands,serving_size,nutriments`,
      { headers: { Accept: "application/json" } },
    );
  } catch {
    throw new Error("Couldn't reach the food database. Check your connection.");
  }

  if (!res.ok) {
    throw new Error(`Lookup failed (${res.status}). Try again.`);
  }

  const data = (await res.json()) as OFFResponse;
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments ?? {};
  const hasServing =
    typeof n["energy-kcal_serving"] === "number" ||
    typeof n.proteins_serving === "number" ||
    typeof n.carbohydrates_serving === "number" ||
    typeof n.fat_serving === "number";

  // Energy may be in kJ if kcal not present — convert.
  const kcalFromServing =
    num(n["energy-kcal_serving"]) ||
    (n.energy_serving ? Math.round(n.energy_serving / 4.184) : 0);
  const kcalFrom100 =
    num(n["energy-kcal_100g"]) ||
    (n.energy_100g ? Math.round(n.energy_100g / 4.184) : 0);

  const calories = hasServing ? kcalFromServing : kcalFrom100;
  const protein = hasServing ? num(n.proteins_serving) : num(n.proteins_100g);
  const carbs = hasServing ? num(n.carbohydrates_serving) : num(n.carbohydrates_100g);
  const fat = hasServing ? num(n.fat_serving) : num(n.fat_100g);

  const name =
    (p.product_name_en && p.product_name_en.trim()) ||
    (p.product_name && p.product_name.trim()) ||
    (p.generic_name && p.generic_name.trim()) ||
    "Unknown product";

  const serving = hasServing
    ? (p.serving_size && p.serving_size.trim()) || "1 serving"
    : "100 g";

  return {
    barcode: trimmed,
    name,
    brand: p.brands?.split(",")[0]?.trim() || undefined,
    serving,
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    source: "openfoodfacts",
  };
}
