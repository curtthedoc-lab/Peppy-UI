import { useState, useCallback, useEffect } from "react";
import { uuid } from "@/utils/uuid";

export interface WeightEntry {
  id: string;
  value: number;
  unit: "kg" | "lbs";
  date: string;
}

const STORAGE_KEY = "peppies_weight";
const EVENT = "peppies_weight_changed";

function load(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: WeightEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useWeight() {
  const [entries, setEntries] = useState<WeightEntry[]>(load);

  useEffect(() => {
    const onChange = () => setEntries(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const latest = entries[0] ?? null;
  const previous = entries[1] ?? null;

  const trend: "up" | "down" | "flat" | null =
    latest && previous
      ? latest.value > previous.value
        ? "up"
        : latest.value < previous.value
        ? "down"
        : "flat"
      : null;

  const addEntry = useCallback((value: number, unit: "kg" | "lbs") => {
    const entry: WeightEntry = {
      id: uuid(),
      value,
      unit,
      date: new Date().toISOString(),
    };
    setEntries((prev) => {
      const next = [entry, ...prev];
      save(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { entries, latest, previous, trend, addEntry, deleteEntry };
}
