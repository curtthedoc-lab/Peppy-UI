import type { FoodLookupResult } from "@/utils/openFoodFacts";

type Generic = Omit<FoodLookupResult, "source" | "barcode" | "brand"> & {
  keywords: string[];
};

export const GENERIC_FOODS: Generic[] = [
  { name: "Banana, medium", serving: "1 medium (118g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, keywords: ["banana"] },
  { name: "Banana, large", serving: "1 large (136g)", calories: 121, protein: 1.5, carbs: 31, fat: 0.4, keywords: ["banana"] },
  { name: "Banana, 100g", serving: "100 g", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, keywords: ["banana"] },
  { name: "Apple, medium", serving: "1 medium (182g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, keywords: ["apple"] },
  { name: "Orange, medium", serving: "1 medium (131g)", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, keywords: ["orange"] },
  { name: "Avocado, medium", serving: "1 medium (150g)", calories: 234, protein: 2.9, carbs: 12, fat: 21, keywords: ["avocado"] },
  { name: "Blueberries, 1 cup", serving: "1 cup (148g)", calories: 84, protein: 1.1, carbs: 21, fat: 0.5, keywords: ["blueberry", "blueberries", "berries"] },
  { name: "Strawberries, 1 cup", serving: "1 cup (152g)", calories: 49, protein: 1, carbs: 12, fat: 0.5, keywords: ["strawberry", "strawberries", "berries"] },

  { name: "Egg, large", serving: "1 large (50g)", calories: 72, protein: 6.3, carbs: 0.4, fat: 5, keywords: ["egg", "eggs"] },
  { name: "Eggs, 2 large", serving: "2 large (100g)", calories: 144, protein: 12.6, carbs: 0.7, fat: 10, keywords: ["egg", "eggs"] },
  { name: "Eggs, 3 large", serving: "3 large (150g)", calories: 216, protein: 18.9, carbs: 1, fat: 15, keywords: ["egg", "eggs"] },
  { name: "Egg white, large", serving: "1 large (33g)", calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, keywords: ["egg white", "eggs"] },

  { name: "Chicken breast, cooked, 100g", serving: "100 g", calories: 165, protein: 31, carbs: 0, fat: 3.6, keywords: ["chicken", "chicken breast"] },
  { name: "Chicken breast, 4 oz cooked", serving: "4 oz (113g)", calories: 187, protein: 35.1, carbs: 0, fat: 4.1, keywords: ["chicken", "chicken breast"] },
  { name: "Chicken thigh, cooked, 100g", serving: "100 g", calories: 209, protein: 26, carbs: 0, fat: 10.9, keywords: ["chicken", "chicken thigh"] },
  { name: "Ground beef, 80/20 cooked, 100g", serving: "100 g", calories: 254, protein: 26, carbs: 0, fat: 17, keywords: ["beef", "ground beef"] },
  { name: "Beef, sirloin cooked, 100g", serving: "100 g", calories: 206, protein: 29, carbs: 0, fat: 9, keywords: ["beef", "sirloin", "steak"] },
  { name: "Salmon, cooked, 100g", serving: "100 g", calories: 208, protein: 22, carbs: 0, fat: 13, keywords: ["salmon", "fish"] },
  { name: "Tuna, canned in water, 100g", serving: "100 g", calories: 116, protein: 26, carbs: 0, fat: 1, keywords: ["tuna", "fish"] },
  { name: "Shrimp, cooked, 100g", serving: "100 g", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, keywords: ["shrimp", "prawn"] },
  { name: "Turkey breast, cooked, 100g", serving: "100 g", calories: 135, protein: 30, carbs: 0, fat: 1, keywords: ["turkey"] },
  { name: "Bacon, 2 slices cooked", serving: "2 slices (16g)", calories: 87, protein: 6, carbs: 0.3, fat: 6.7, keywords: ["bacon", "pork"] },

  { name: "Rice, white cooked, 1 cup", serving: "1 cup (158g)", calories: 205, protein: 4.3, carbs: 45, fat: 0.4, keywords: ["rice", "white rice"] },
  { name: "Rice, brown cooked, 1 cup", serving: "1 cup (195g)", calories: 218, protein: 4.5, carbs: 46, fat: 1.6, keywords: ["rice", "brown rice"] },
  { name: "Rice, white cooked, 100g", serving: "100 g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, keywords: ["rice", "white rice"] },
  { name: "Pasta, cooked, 1 cup", serving: "1 cup (140g)", calories: 220, protein: 8.1, carbs: 43, fat: 1.3, keywords: ["pasta", "spaghetti", "noodles"] },
  { name: "Quinoa, cooked, 1 cup", serving: "1 cup (185g)", calories: 222, protein: 8.1, carbs: 39, fat: 3.6, keywords: ["quinoa"] },
  { name: "Oats, dry, 1/2 cup", serving: "1/2 cup dry (40g)", calories: 150, protein: 5, carbs: 27, fat: 2.5, keywords: ["oats", "oatmeal"] },
  { name: "Oatmeal, cooked, 1 cup", serving: "1 cup (234g)", calories: 158, protein: 6, carbs: 27, fat: 3.2, keywords: ["oats", "oatmeal"] },
  { name: "Bread, white, 1 slice", serving: "1 slice (28g)", calories: 75, protein: 2.5, carbs: 14, fat: 1, keywords: ["bread", "toast"] },
  { name: "Bread, whole wheat, 1 slice", serving: "1 slice (28g)", calories: 80, protein: 4, carbs: 14, fat: 1.1, keywords: ["bread", "whole wheat", "toast"] },
  { name: "Bagel, plain, medium", serving: "1 medium (105g)", calories: 277, protein: 11, carbs: 55, fat: 1.7, keywords: ["bagel"] },
  { name: "Tortilla, flour, 8-inch", serving: "1 (49g)", calories: 144, protein: 4, carbs: 24, fat: 3.6, keywords: ["tortilla", "wrap"] },

  { name: "Sweet potato, baked, 1 medium", serving: "1 medium (130g)", calories: 103, protein: 2.3, carbs: 24, fat: 0.2, keywords: ["sweet potato", "yam"] },
  { name: "Potato, baked, 1 medium", serving: "1 medium (173g)", calories: 161, protein: 4.3, carbs: 37, fat: 0.2, keywords: ["potato"] },
  { name: "Broccoli, cooked, 1 cup", serving: "1 cup (156g)", calories: 55, protein: 3.7, carbs: 11, fat: 0.6, keywords: ["broccoli"] },
  { name: "Spinach, raw, 1 cup", serving: "1 cup (30g)", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, keywords: ["spinach", "greens"] },
  { name: "Carrots, raw, 1 cup", serving: "1 cup (122g)", calories: 50, protein: 1.1, carbs: 12, fat: 0.3, keywords: ["carrot", "carrots"] },

  { name: "Greek yogurt, plain nonfat", serving: "1 container (170g)", calories: 100, protein: 17, carbs: 6, fat: 0.7, keywords: ["yogurt", "greek yogurt"] },
  { name: "Cottage cheese, 1% low-fat, 1 cup", serving: "1 cup (226g)", calories: 163, protein: 28, carbs: 6.2, fat: 2.3, keywords: ["cottage cheese"] },
  { name: "Milk, 2%, 1 cup", serving: "1 cup (244g)", calories: 122, protein: 8.1, carbs: 12, fat: 4.8, keywords: ["milk"] },
  { name: "Milk, whole, 1 cup", serving: "1 cup (244g)", calories: 149, protein: 7.7, carbs: 12, fat: 8, keywords: ["milk"] },
  { name: "Milk, skim, 1 cup", serving: "1 cup (245g)", calories: 83, protein: 8.3, carbs: 12, fat: 0.2, keywords: ["milk", "skim"] },
  { name: "Cheese, cheddar, 1 oz", serving: "1 oz (28g)", calories: 113, protein: 7, carbs: 0.4, fat: 9, keywords: ["cheese", "cheddar"] },

  { name: "Almonds, 1 oz", serving: "1 oz (28g, ~23 nuts)", calories: 164, protein: 6, carbs: 6, fat: 14, keywords: ["almonds", "nuts"] },
  { name: "Peanut butter, 2 tbsp", serving: "2 tbsp (32g)", calories: 188, protein: 8, carbs: 7, fat: 16, keywords: ["peanut butter", "pb"] },
  { name: "Walnuts, 1 oz", serving: "1 oz (28g)", calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, keywords: ["walnuts", "nuts"] },

  { name: "Whey protein, 1 scoop", serving: "1 scoop (30g)", calories: 120, protein: 24, carbs: 3, fat: 1.5, keywords: ["whey", "protein", "shake"] },

  { name: "Olive oil, 1 tbsp", serving: "1 tbsp (14g)", calories: 119, protein: 0, carbs: 0, fat: 13.5, keywords: ["olive oil", "oil"] },
  { name: "Butter, 1 tbsp", serving: "1 tbsp (14g)", calories: 102, protein: 0.1, carbs: 0, fat: 11.5, keywords: ["butter"] },
  { name: "Honey, 1 tbsp", serving: "1 tbsp (21g)", calories: 64, protein: 0.1, carbs: 17, fat: 0, keywords: ["honey"] },

  { name: "Beans, black, cooked, 1 cup", serving: "1 cup (172g)", calories: 227, protein: 15, carbs: 41, fat: 0.9, keywords: ["beans", "black beans"] },
  { name: "Lentils, cooked, 1 cup", serving: "1 cup (198g)", calories: 230, protein: 18, carbs: 40, fat: 0.8, keywords: ["lentils"] },
  { name: "Tofu, firm, 100g", serving: "100 g", calories: 144, protein: 17, carbs: 2.8, fat: 8.7, keywords: ["tofu"] },
];

export function searchGenericFoods(query: string): FoodLookupResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/);

  const scored: { score: number; item: Generic }[] = [];
  for (const item of GENERIC_FOODS) {
    const haystack = (item.name + " " + item.keywords.join(" ")).toLowerCase();
    let score = 0;
    // strong: any keyword starts with the query
    for (const kw of item.keywords) {
      if (kw === q) score += 100;
      else if (kw.startsWith(q)) score += 60;
      else if (kw.includes(q)) score += 25;
    }
    // every token must match somewhere
    let allMatch = true;
    for (const t of tokens) {
      if (!haystack.includes(t)) {
        allMatch = false;
        break;
      }
      score += 5;
    }
    if (!allMatch) continue;
    if (score > 0) scored.push({ score, item });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map(({ item }) => ({
    name: item.name,
    serving: item.serving,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    source: "generic" as const,
  }));
}
