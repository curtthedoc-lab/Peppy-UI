import { useState, useCallback, useEffect } from "react";
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
const ENTRIES_EVENT = "peppies_nutrition_entries_changed";
const GOALS_EVENT = "peppies_nutrition_goals_changed";

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

export function useNutrition() {
  const [entries, setEntries] = useState<FoodEntry[]>(loadEntries);
  const [goals, setGoalsState] = useState<NutritionGoals>(loadGoals);

  useEffect(() => {
    const reloadEntries = () => setEntries(loadEntries());
    const reloadGoals = () => setGoalsState(loadGoals());
    const storageHandler = (e: StorageEvent) => {
      if (e.key === ENTRIES_KEY) reloadEntries();
      if (e.key === GOALS_KEY) reloadGoals();
    };
    window.addEventListener(ENTRIES_EVENT, reloadEntries);
    window.addEventListener(GOALS_EVENT, reloadGoals);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(ENTRIES_EVENT, reloadEntries);
      window.removeEventListener(GOALS_EVENT, reloadGoals);
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

  // Derive favorites: most-used food templates from history (last 60 days), top 6.
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  type FavKey = string;
  const counts = new Map<FavKey, { count: number; sample: FoodEntry }>();
  for (const e of entries) {
    if (new Date(e.date).getTime() < sixtyDaysAgo) continue;
    const key = e.name.trim().toLowerCase();
    if (!key) continue;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { count: 1, sample: e });
    }
  }
  const favorites = Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((v) => v.sample);

  return {
    entries,
    todayEntries,
    totals,
    goals,
    favorites,
    addEntry,
    updateEntry,
    deleteEntry,
    setGoals,
  };
}
