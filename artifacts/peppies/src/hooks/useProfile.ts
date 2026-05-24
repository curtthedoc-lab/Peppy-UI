import { useState, useCallback, useEffect } from "react";

export type MeasurementKey =
  | "waist"
  | "chest"
  | "bicepLeft"
  | "bicepRight"
  | "thighLeft"
  | "thighRight";

export interface MeasurementValue {
  current: number | null;
  goal: number | null;
}

export type MeasurementUnit = "in" | "cm";

export interface Profile {
  startingWeight: number | null;
  weightGoal: number | null;
  measurementUnit: MeasurementUnit;
  measurements: Record<MeasurementKey, MeasurementValue>;
}

export const MEASUREMENT_KEYS: MeasurementKey[] = [
  "waist",
  "chest",
  "bicepLeft",
  "bicepRight",
  "thighLeft",
  "thighRight",
];

export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  waist: "Waist",
  chest: "Chest",
  bicepLeft: "Bicep (Left)",
  bicepRight: "Bicep (Right)",
  thighLeft: "Thigh (Left)",
  thighRight: "Thigh (Right)",
};

const STORAGE_KEY = "peppies_profile";
const EVENT = "peppies_profile_changed";

function emptyMeasurements(): Record<MeasurementKey, MeasurementValue> {
  return MEASUREMENT_KEYS.reduce((acc, k) => {
    acc[k] = { current: null, goal: null };
    return acc;
  }, {} as Record<MeasurementKey, MeasurementValue>);
}

const DEFAULTS: Profile = {
  startingWeight: null,
  weightGoal: null,
  measurementUnit: "in",
  measurements: emptyMeasurements(),
};

function sanitizeNumber(v: unknown): number | null {
  if (typeof v !== "number" || !isFinite(v) || v <= 0) return null;
  return v;
}

function load(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    const merged: Profile = {
      startingWeight: sanitizeNumber(parsed.startingWeight),
      weightGoal: sanitizeNumber(parsed.weightGoal),
      measurementUnit: parsed.measurementUnit === "cm" ? "cm" : "in",
      measurements: emptyMeasurements(),
    };
    const incoming = parsed.measurements ?? {};
    for (const key of MEASUREMENT_KEYS) {
      const m = (incoming as Record<string, MeasurementValue | undefined>)[key];
      if (m) {
        merged.measurements[key] = {
          current: sanitizeNumber(m.current),
          goal: sanitizeNumber(m.goal),
        };
      }
    }
    return merged;
  } catch {
    return DEFAULTS;
  }
}

function save(p: Profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(load);

  useEffect(() => {
    const onChange = () => setProfile(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const setMeasurement = useCallback(
    (key: MeasurementKey, field: "current" | "goal", value: number | null) => {
      setProfile((prev) => {
        const next: Profile = {
          ...prev,
          measurements: {
            ...prev.measurements,
            [key]: { ...prev.measurements[key], [field]: value },
          },
        };
        save(next);
        return next;
      });
    },
    []
  );

  const setMeasurementUnit = useCallback((unit: MeasurementUnit) => {
    setProfile((prev) => {
      const next = { ...prev, measurementUnit: unit };
      save(next);
      return next;
    });
  }, []);

  return { profile, updateProfile, setMeasurement, setMeasurementUnit };
}
