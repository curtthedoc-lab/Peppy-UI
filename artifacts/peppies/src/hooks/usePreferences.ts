import { useState, useCallback, useEffect } from "react";

export type WeightUnit = "kg" | "lbs";

export interface Preferences {
  weightUnit: WeightUnit;
  cycleReminders: boolean;
}

const STORAGE_KEY = "peppies_preferences";
const DEFAULTS: Preferences = { weightUnit: "kg", cycleReminders: false };
const EVENT = "peppies_preferences_changed";

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      weightUnit: parsed.weightUnit === "lbs" ? "lbs" : "kg",
      cycleReminders: parsed.cycleReminders === true,
    };
  } catch {
    return DEFAULTS;
  }
}

function save(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(load);

  useEffect(() => {
    const onChange = () => setPrefs(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setWeightUnit = useCallback((unit: WeightUnit) => {
    setPrefs((prev) => {
      const next = { ...prev, weightUnit: unit };
      save(next);
      return next;
    });
  }, []);

  const setCycleReminders = useCallback((enabled: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, cycleReminders: enabled };
      save(next);
      return next;
    });
  }, []);

  const toggleWeightUnit = useCallback(() => {
    setPrefs((prev) => {
      const next: Preferences = {
        ...prev,
        weightUnit: prev.weightUnit === "kg" ? "lbs" : "kg",
      };
      save(next);
      return next;
    });
  }, []);

  return { prefs, setWeightUnit, toggleWeightUnit, setCycleReminders };
}
