import { searchGenericFoods } from "@/data/genericFoods";

// A single way to portion a food (per-serving, per-100g, per-container, etc.).
// A lookup result can carry several bases so the user can pick the one that
// matches what they actually ate.
export interface FoodBasis {
  label: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLookupResult {
  barcode?: string;
  name: string;
  brand?: string;
  // Default basis fields (back-compat) — mirror bases[0].
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  // All available bases. Always populated; first item matches the default fields.
  bases: FoodBasis[];
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
  serving_quantity?: number;
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

const r1 = (v: number) => Math.round(v * 10) / 10;

function buildResult(
  base: { name: string; brand?: string; barcode?: string; source: FoodLookupResult["source"] },
  bases: FoodBasis[],
): FoodLookupResult | null {
  if (bases.length === 0) return null;
  const first = bases[0];
  return {
    ...base,
    serving: first.serving,
    calories: first.calories,
    protein: first.protein,
    carbs: first.carbs,
    fat: first.fat,
    bases,
  };
}

function parseOFFProduct(p: OFFProduct, fallbackName?: string): FoodLookupResult | null {
  const n = p.nutriments ?? {};

  // Energy may arrive in kJ if kcal is missing — convert.
  const kcalServing =
    num(n["energy-kcal_serving"]) ||
    (n.energy_serving ? Math.round(n.energy_serving / 4.184) : 0);
  const kcal100 =
    num(n["energy-kcal_100g"]) ||
    (n.energy_100g ? Math.round(n.energy_100g / 4.184) : 0);

  const hasServing =
    kcalServing > 0 ||
    num(n.proteins_serving) > 0 ||
    num(n.carbohydrates_serving) > 0 ||
    num(n.fat_serving) > 0;

  const has100 =
    kcal100 > 0 ||
    num(n.proteins_100g) > 0 ||
    num(n.carbohydrates_100g) > 0 ||
    num(n.fat_100g) > 0;

  const name =
    (p.product_name_en && p.product_name_en.trim()) ||
    (p.product_name && p.product_name.trim()) ||
    (p.generic_name && p.generic_name.trim()) ||
    fallbackName ||
    "";
  if (!name) return null;

  const bases: FoodBasis[] = [];
  if (hasServing) {
    const servingText = (p.serving_size && p.serving_size.trim()) || "1 serving";
    bases.push({
      label: `Per serving (${servingText})`,
      serving: servingText,
      calories: Math.round(kcalServing),
      protein: r1(num(n.proteins_serving)),
      carbs: r1(num(n.carbohydrates_serving)),
      fat: r1(num(n.fat_serving)),
    });
  }
  if (has100) {
    bases.push({
      label: "Per 100 g",
      serving: "100 g",
      calories: Math.round(kcal100),
      protein: r1(num(n.proteins_100g)),
      carbs: r1(num(n.carbohydrates_100g)),
      fat: r1(num(n.fat_100g)),
    });
  }
  if (bases.length === 0) return null;

  return buildResult(
    {
      name,
      brand: p.brands?.split(",")[0]?.trim() || undefined,
      barcode: p.code,
      source: "openfoodfacts",
    },
    bases,
  );
}

export async function lookupBarcode(barcode: string): Promise<FoodLookupResult | null> {
  const trimmed = barcode.trim();
  if (!/^\d{6,14}$/.test(trimmed)) {
    throw new Error("That doesn't look like a valid barcode.");
  }

  let res: Response;
  try {
    res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(trimmed)}.json?fields=code,product_name,product_name_en,generic_name,brands,serving_size,serving_quantity,nutriments`,
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

  const kcalRaw = fdcNutrient(food, FDC_KCAL);
  const proteinRaw = fdcNutrient(food, FDC_PROTEIN);
  const carbsRaw = fdcNutrient(food, FDC_CARBS);
  const fatRaw = fdcNutrient(food, FDC_FAT);

  if (kcalRaw <= 0 && proteinRaw <= 0 && carbsRaw <= 0 && fatRaw <= 0) return null;

  const bases: FoodBasis[] = [];
  const isBranded = food.dataType === "Branded" && typeof food.servingSize === "number" && food.servingSize > 0;

  if (isBranded) {
    const ss = food.servingSize as number;
    const rawUnit = (food.servingSizeUnit ?? "g").toLowerCase().trim();
    const gAliases = new Set(["g", "gr", "grm", "gram", "grams"]);
    const mlAliases = new Set(["ml", "mlt", "milliliter", "milliliters", "millilitre", "millilitres"]);
    const isMass = gAliases.has(rawUnit);
    const isVolume = mlAliases.has(rawUnit);

    if (isMass || isVolume) {
      const canonical = isMass ? "g" : "ml";
      const factor = ss / 100;
      const servingText = food.householdServingFullText?.trim() || `${ss} ${canonical}`;
      bases.push({
        label: `Per serving (${servingText})`,
        serving: servingText,
        calories: Math.round(kcalRaw * factor),
        protein: r1(proteinRaw * factor),
        carbs: r1(carbsRaw * factor),
        fat: r1(fatRaw * factor),
      });
      bases.push({
        label: `Per 100 ${canonical}`,
        serving: `100 ${canonical}`,
        calories: Math.round(kcalRaw),
        protein: r1(proteinRaw),
        carbs: r1(carbsRaw),
        fat: r1(fatRaw),
      });
    } else {
      // Unknown unit — values are per-100g but we can't trust the serving text.
      bases.push({
        label: "Per 100 g",
        serving: "100 g",
        calories: Math.round(kcalRaw),
        protein: r1(proteinRaw),
        carbs: r1(carbsRaw),
        fat: r1(fatRaw),
      });
    }
  } else {
    // Foundation / SR Legacy / Survey — values are per-100g.
    const servingText = food.householdServingFullText?.trim();
    bases.push({
      label: "Per 100 g",
      serving: "100 g",
      calories: Math.round(kcalRaw),
      protein: r1(proteinRaw),
      carbs: r1(carbsRaw),
      fat: r1(fatRaw),
    });
    if (servingText) {
      // Show the household text as info, but we can't scale it without knowing grams.
      // Skip adding as a separate basis to avoid duplicate macros.
    }
  }

  return buildResult(
    {
      name,
      brand: (food.brandName || food.brandOwner)?.trim() || undefined,
      source: "usda",
    },
    bases,
  );
}

async function searchUSDA(query: string, signal?: AbortSignal): Promise<FoodLookupResult[]> {
  const key = typeof __FDC_API_KEY__ === "string" ? __FDC_API_KEY__ : "";
  if (!key) return [];

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
//   1. local generic catalog
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

  const [usda, off] = await Promise.all([
    searchUSDA(q, signal).catch((e) => {
      if (signal?.aborted) throw e;
      return [] as FoodLookupResult[];
    }),
    (async () => {
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&sort_by=popularity_key&fields=code,product_name,product_name_en,generic_name,brands,serving_size,serving_quantity,nutriments`,
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
