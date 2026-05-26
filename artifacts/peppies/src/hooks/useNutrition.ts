import { useState, useCallback, useEffect, useMemo } from "react";
import { uuid } from "@/utils/uuid";
import { localDayKey } from "@/utils/localDate";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  meal: MealType;
  date: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const ENTRIES_KEY = "peppies_nutrition_entries";
const GOALS_KEY = "peppies_nutrition_goals";
const CUSTOM_FAVS_KEY = "peppies_nutrition_custom_favorites";
const HIDDEN_FAVS_KEY = "peppies_nutrition_hidden_favorites";
const ENTRIES_EVENT = "peppies_nutrition_entries_changed";
const GOALS_EVENT = "peppies_nutrition_goals_changed";
const CUSTOM_FAVS_EVENT = "peppies_nutrition_custom_favorites_changed";
const HIDDEN_FAVS_EVENT = "peppies_nutrition_hidden_favorites_changed";

export interface CustomFavorite {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

export interface FavoriteItem extends CustomFavorite {
  kind: "custom" | "derived";
}

const DEFAULT_GOALS: NutritionGoals = {
  calories: 2300,
  protein: 165,
  carbs: 230,
  fat: 65,
};

export const todayKey = () => localDayKey();

function loadEntries(): FoodEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? (JSON.parse(raw) as FoodEntry[]) : [];
  } catch {
    return [];
  }
}

function loadGoals(): NutritionGoals {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (raw) return { ...DEFAULT_GOALS, ...(JSON.parse(raw) as Partial<NutritionGoals>) };
  } catch {
    // fall through
  }
  return DEFAULT_GOALS;
}

function saveEntries(entries: FoodEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(ENTRIES_EVENT));
}

function saveGoals(goals: NutritionGoals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  window.dispatchEvent(new CustomEvent(GOALS_EVENT));
}

function loadCustomFavorites(): CustomFavorite[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FAVS_KEY);
    return raw ? (JSON.parse(raw) as CustomFavorite[]) : [];
  } catch {
    return [];
  }
}

function saveCustomFavorites(favs: CustomFavorite[]) {
  localStorage.setItem(CUSTOM_FAVS_KEY, JSON.stringify(favs));
  window.dispatchEvent(new CustomEvent(CUSTOM_FAVS_EVENT));
}

function loadHiddenFavorites(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_FAVS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveHiddenFavorites(keys: string[]) {
  localStorage.setItem(HIDDEN_FAVS_KEY, JSON.stringify(keys));
  window.dispatchEvent(new CustomEvent(HIDDEN_FAVS_EVENT));
}

export function useNutrition() {
  const [entries, setEntries] = useState<FoodEntry[]>(loadEntries);
  const [goals, setGoalsState] = useState<NutritionGoals>(loadGoals);
  const [customFavorites, setCustomFavoritesState] = useState<CustomFavorite[]>(loadCustomFavorites);
  const [hiddenFavorites, setHiddenFavoritesState] = useState<string[]>(loadHiddenFavorites);

  useEffect(() => {
    const reloadEntries = () => setEntries(loadEntries());
    const reloadGoals = () => setGoalsState(loadGoals());
    const reloadCustomFavs = () => setCustomFavoritesState(loadCustomFavorites());
    const reloadHiddenFavs = () => setHiddenFavoritesState(loadHiddenFavorites());
    const storageHandler = (e: StorageEvent) => {
      if (e.key === ENTRIES_KEY) reloadEntries();
      if (e.key === GOALS_KEY) reloadGoals();
      if (e.key === CUSTOM_FAVS_KEY) reloadCustomFavs();
      if (e.key === HIDDEN_FAVS_KEY) reloadHiddenFavs();
    };
    window.addEventListener(ENTRIES_EVENT, reloadEntries);
    window.addEventListener(GOALS_EVENT, reloadGoals);
    window.addEventListener(CUSTOM_FAVS_EVENT, reloadCustomFavs);
    window.addEventListener(HIDDEN_FAVS_EVENT, reloadHiddenFavs);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(ENTRIES_EVENT, reloadEntries);
      window.removeEventListener(GOALS_EVENT, reloadGoals);
      window.removeEventListener(CUSTOM_FAVS_EVENT, reloadCustomFavs);
      window.removeEventListener(HIDDEN_FAVS_EVENT, reloadHiddenFavs);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const addEntry = useCallback((data: Omit<FoodEntry, "id" | "date">) => {
    const entry: FoodEntry = { ...data, id: uuid(), date: new Date().toISOString() };
    setEntries((prev) => {
      const next = [entry, ...prev];
      saveEntries(next);
      return next;
    });
    return entry;
  }, []);

  const updateEntry = useCallback(
    (id: string, patch: Partial<Omit<FoodEntry, "id" | "date">>) => {
      setEntries((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        saveEntries(next);
        return next;
      });
    },
    [],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  const setGoals = useCallback((next: NutritionGoals) => {
    setGoalsState(next);
    saveGoals(next);
  }, []);

  const today = todayKey();
  const todayEntries = entries.filter((e) => localDayKey(e.date) === today);

  const totals = todayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const addCustomFavorite = useCallback((data: Omit<CustomFavorite, "id">) => {
    const fav: CustomFavorite = { ...data, id: uuid() };
    setCustomFavoritesState((prev) => {
      const next = [fav, ...prev];
      saveCustomFavorites(next);
      return next;
    });
    return fav;
  }, []);

  const removeCustomFavorite = useCallback((id: string) => {
    setCustomFavoritesState((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveCustomFavorites(next);
      return next;
    });
  }, []);

  const hideDerivedFavorite = useCallback((name: string) => {
    const key = name.trim().toLowerCase();
    if (!key) return;
    setHiddenFavoritesState((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      saveHiddenFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback(
    (fav: FavoriteItem) => {
      if (fav.kind === "custom") removeCustomFavorite(fav.id);
      else hideDerivedFavorite(fav.name);
    },
    [removeCustomFavorite, hideDerivedFavorite],
  );

  const resetHiddenFavorites = useCallback(() => {
    setHiddenFavoritesState([]);
    saveHiddenFavorites([]);
  }, []);

  // Merged favorites: user-defined custom favorites first, then derived from
  // history. Custom favorites persist independent of food entries. Derived
  // favorites can be hidden via swipe-to-delete (stored in hiddenFavorites).
  const favorites: FavoriteItem[] = useMemo(() => {
    const customs: FavoriteItem[] = customFavorites.map((f) => ({ ...f, kind: "custom" }));
    const customKeys = new Set(customs.map((f) => f.name.trim().toLowerCase()));
    const hidden = new Set(hiddenFavorites);

    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    const counts = new Map<string, { count: number; sample: FoodEntry }>();
    for (const e of entries) {
      if (new Date(e.date).getTime() < sixtyDaysAgo) continue;
      const key = e.name.trim().toLowerCase();
      if (!key) continue;
      if (customKeys.has(key) || hidden.has(key)) continue;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { count: 1, sample: e });
    }
    const derived: FavoriteItem[] = Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, v]) => ({
        kind: "derived" as const,
        id: `derived:${key}`,
        name: v.sample.name,
        calories: v.sample.calories,
        protein: v.sample.protein,
        carbs: v.sample.carbs,
        fat: v.sample.fat,
        serving: v.sample.serving,
      }));

    return [...customs, ...derived].slice(0, 10);
  }, [entries, customFavorites, hiddenFavorites]);

  return {
    entries,
    todayEntries,
    totals,
    goals,
    favorites,
    customFavorites,
    hiddenFavorites,
    addEntry,
    updateEntry,
    deleteEntry,
    setGoals,
    addCustomFavorite,
    removeCustomFavorite,
    hideDerivedFavorite,
    removeFavorite,
    resetHiddenFavorites,
  };
}
