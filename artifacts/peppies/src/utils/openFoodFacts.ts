import { searchGenericFoods } from "@/data/genericFoods";

export interface FoodLookupResult {
  barcode?: string;
  name: string;
  brand?: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "openfoodfacts" | "generic" | "usda";
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
  code?: string;
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OFFNutriments;
}

interface OFFProductResponse {
  status: number;
  product?: OFFProduct;
}

interface OFFSearchResponse {
  products?: OFFProduct[];
}

function num(...vals: Array<number | undefined>): number {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return v;
  }
  return 0;
}

function parseOFFProduct(p: OFFProduct, fallbackName?: string): FoodLookupResult | null {
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
    fallbackName ||
    "";

  if (!name) return null;

  const serving = hasServing
    ? (p.serving_size && p.serving_size.trim()) || "1 serving"
    : "100 g";

  return {
    barcode: p.code,
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

export async function lookupBarcode(barcode: string): Promise<FoodLookupResult | null> {
  const trimmed = barcode.trim();
  if (!/^\d{6,14}$/.test(trimmed)) {
    throw new Error("That doesn't look like a valid barcode.");
  }

  let res: Response;
  try {
    res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(trimmed)}.json?fields=code,product_name,product_name_en,generic_name,brands,serving_size,nutriments`,
      { headers: { Accept: "application/json" } },
    );
  } catch {
    throw new Error("Couldn't reach the food database. Check your connection.");
  }

  if (!res.ok) {
    throw new Error(`Lookup failed (${res.status}). Try again.`);
  }

  const data = (await res.json()) as OFFProductResponse;
  if (data.status !== 1 || !data.product) return null;

  // Barcode lookups always get a name fallback so a product with nutriments
  // but no readable name still populates macros.
  return parseOFFProduct({ ...data.product, code: trimmed }, "Unknown product");
}

// ----- USDA FoodData Central -----
// https://fdc.nal.usda.gov/api-guide
// Key is injected at build time via vite's `define`.
declare const __FDC_API_KEY__: string;

interface FDCNutrient {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  value?: number;
  unitName?: string;
}

interface FDCFood {
  fdcId: number;
  description?: string;
  brandOwner?: string;
  brandName?: string;
  dataType?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: FDCNutrient[];
}

interface FDCSearchResponse {
  foods?: FDCFood[];
}

// USDA standard nutrient numbers
const FDC_KCAL = "208";
const FDC_PROTEIN = "203";
const FDC_FAT = "204";
const FDC_CARBS = "205";

function fdcNutrient(food: FDCFood, number: string): number {
  const list = food.foodNutrients ?? [];
  for (const n of list) {
    if (n.nutrientNumber === number) {
      return typeof n.value === "number" && Number.isFinite(n.value) ? n.value : 0;
    }
  }
  return 0;
}

function parseFDCFood(food: FDCFood): FoodLookupResult | null {
  const name = (food.description ?? "").trim();
  if (!name) return null;

  // FDC nutrient values are per 100g for SR Legacy / Foundation / Survey foods,
  // and per serving for Branded foods when servingSize is provided.
  const isBranded = food.dataType === "Branded" && typeof food.servingSize === "number" && food.servingSize > 0;

  const kcalRaw = fdcNutrient(food, FDC_KCAL);
  const proteinRaw = fdcNutrient(food, FDC_PROTEIN);
  const carbsRaw = fdcNutrient(food, FDC_CARBS);
  const fatRaw = fdcNutrient(food, FDC_FAT);

  // For Branded foods, FDC reports per-100g (or per-100ml) AND we have the
  // servingSize in g/ml — scale to per-serving for consistency with OFF.
  let calories = kcalRaw;
  let protein = proteinRaw;
  let carbs = carbsRaw;
  let fat = fatRaw;
  let serving = "100 g";

  if (isBranded) {
    const ss = food.servingSize as number;
    const rawUnit = (food.servingSizeUnit ?? "g").toLowerCase().trim();
    // USDA uses various aliases. Normalise to canonical "g" / "ml" so we can
    // scale per-100 values to per-serving. "MLT" is FDC's milliliter code.
    const gAliases = new Set(["g", "gr", "grm", "gram", "grams"]);
    const mlAliases = new Set(["ml", "mlt", "milliliter", "milliliters", "millilitre", "millilitres"]);
    const isMass = gAliases.has(rawUnit);
    const isVolume = mlAliases.has(rawUnit);
    if (isMass || isVolume) {
      const canonical = isMass ? "g" : "ml";
      const factor = ss / 100;
      calories = kcalRaw * factor;
      protein = proteinRaw * factor;
      carbs = carbsRaw * factor;
      fat = fatRaw * factor;
      serving = food.householdServingFullText?.trim() || `${ss} ${canonical}`;
    } else {
      // Unknown unit — don't trust the per-100 values as per-serving.
      // Keep raw per-100 values labelled honestly.
      serving = "100 g";
    }
  } else if (food.householdServingFullText) {
    serving = food.householdServingFullText.trim();
  }

  if (calories <= 0 && protein <= 0 && carbs <= 0 && fat <= 0) return null;

  const brand = (food.brandName || food.brandOwner)?.trim() || undefined;

  return {
    name,
    brand,
    serving,
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    source: "usda",
  };
}

async function searchUSDA(query: string, signal?: AbortSignal): Promise<FoodLookupResult[]> {
  const key = typeof __FDC_API_KEY__ === "string" ? __FDC_API_KEY__ : "";
  if (!key) return [];

  // Prefer Foundation / SR Legacy first (clean generic entries), then Branded.
  // pageSize 10 keeps it fast.
  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search` +
    `?api_key=${encodeURIComponent(key)}` +
    `&query=${encodeURIComponent(query)}` +
    `&pageSize=10` +
    `&dataType=${encodeURIComponent("Foundation,SR Legacy,Branded")}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  } catch (e) {
    if (signal?.aborted) throw e;
    return [];
  }
  if (!res.ok) return [];

  const data = (await res.json()) as FDCSearchResponse;
  const foods = data.foods ?? [];
  const out: FoodLookupResult[] = [];
  for (const f of foods) {
    const parsed = parseFDCFood(f);
    if (parsed) out.push(parsed);
  }
  return out;
}

// Search across all sources by free text. Returns up to ~12 results, merging:
//   1. local generic catalog (banana, eggs, etc.)
//   2. USDA FoodData Central
//   3. Open Food Facts
// in that priority order, deduped by name+serving.
export async function searchFoods(
  query: string,
  signal?: AbortSignal,
): Promise<FoodLookupResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const local = searchGenericFoods(q).slice(0, 4);

  // Fire USDA + OFF in parallel. Each catches its own errors so a slow/failing
  // one never blocks the other.
  const [usda, off] = await Promise.all([
    searchUSDA(q, signal).catch((e) => {
      if (signal?.aborted) throw e;
      return [] as FoodLookupResult[];
    }),
    (async () => {
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&sort_by=popularity_key&fields=code,product_name,product_name_en,generic_name,brands,serving_size,nutriments`,
          { headers: { Accept: "application/json" }, signal },
        );
        if (!res.ok) return [] as FoodLookupResult[];
        const data = (await res.json()) as OFFSearchResponse;
        return (data.products ?? [])
          .map((p) => parseOFFProduct(p))
          .filter((x): x is FoodLookupResult => x !== null && x.calories > 0);
      } catch (e) {
        if (signal?.aborted) throw e;
        return [] as FoodLookupResult[];
      }
    })(),
  ]);

  // De-dupe and cap at 12. Local first, then USDA, then OFF.
  const seen = new Set<string>();
  const out: FoodLookupResult[] = [];
  for (const r of [...local, ...usda, ...off]) {
    const key = `${r.name.toLowerCase()}|${r.serving.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
    if (out.length >= 12) break;
  }
  return out;
}
