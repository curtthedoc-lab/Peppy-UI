import { useState, useCallback, useEffect } from "react";
import type { ActivityLevel, FitnessGoal, Sex } from "@/utils/findMyMacros";

export interface MacroProfile {
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  goalWeightKg: number | null;
  activity: ActivityLevel | null;
  goal: FitnessGoal | null;
  lastCalculatedAt: string | null;
}

const STORAGE_KEY = "peppies_macro_profile";
const EVENT = "peppies_macro_profile_changed";

const EMPTY: MacroProfile = {
  age: null,
  sex: null,
  heightCm: null,
  currentWeightKg: null,
  goalWeightKg: null,
  activity: null,
  goal: null,
  lastCalculatedAt: null,
};

function sanitizeNum(v: unknown): number | null {
  return typeof v === "number" && isFinite(v) && v > 0 ? v : null;
}

function sanitizeSex(v: unknown): Sex | null {
  return v === "male" || v === "female" ? v : null;
}

function sanitizeActivity(v: unknown): ActivityLevel | null {
  return v === "sedentary" ||
    v === "lightly_active" ||
    v === "moderately_active" ||
    v === "very_active" ||
    v === "athlete"
    ? v
    : null;
}

function sanitizeGoal(v: unknown): FitnessGoal | null {
  return v === "lose_fat" || v === "maintain" || v === "build_muscle" || v === "recomp"
    ? v
    : null;
}

function load(): MacroProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<MacroProfile>;
    return {
      age: sanitizeNum(parsed.age),
      sex: sanitizeSex(parsed.sex),
      heightCm: sanitizeNum(parsed.heightCm),
      currentWeightKg: sanitizeNum(parsed.currentWeightKg),
      goalWeightKg: sanitizeNum(parsed.goalWeightKg),
      activity: sanitizeActivity(parsed.activity),
      goal: sanitizeGoal(parsed.goal),
      lastCalculatedAt:
        typeof parsed.lastCalculatedAt === "string" ? parsed.lastCalculatedAt : null,
    };
  } catch {
    return EMPTY;
  }
}

function save(p: MacroProfile) {
  const hasAnything =
    p.age ||
    p.sex ||
    p.heightCm ||
    p.currentWeightKg ||
    p.goalWeightKg ||
    p.activity ||
    p.goal ||
    p.lastCalculatedAt;
  if (!hasAnything) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useMacroProfile() {
  const [profile, setProfile] = useState<MacroProfile>(load);

  useEffect(() => {
    const onChange = () => setProfile(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const updateMacroProfile = useCallback((patch: Partial<MacroProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const clearMacroProfile = useCallback(() => {
    setProfile(EMPTY);
    save(EMPTY);
  }, []);

  const hasMacroProfile = !!profile.lastCalculatedAt;

  return { macroProfile: profile, hasMacroProfile, updateMacroProfile, clearMacroProfile };
}
