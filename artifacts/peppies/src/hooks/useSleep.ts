import { useState, useCallback, useEffect } from "react";
import { uuid } from "@/utils/uuid";

export interface SleepEntry {
  id: string;
  date: string; // ISO timestamp of when logged
  forDate: string; // YYYY-MM-DD the night belongs to
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  bedtime?: string; // HH:MM
  wakeTime?: string; // HH:MM
  notes?: string;
}

const STORAGE_KEY = "peppies_sleep";
const EVENT = "peppies_sleep_changed";

function load(): SleepEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SleepEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(entries: SleepEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useSleep() {
  const [entries, setEntries] = useState<SleepEntry[]>(load);

  useEffect(() => {
    const onChange = () => setEntries(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Most recent first (matches Weight pattern)
  const latest = entries[0] ?? null;
  const previous = entries[1] ?? null;

  const trend: "up" | "down" | "flat" | null =
    latest && previous
      ? latest.hours > previous.hours
        ? "up"
        : latest.hours < previous.hours
          ? "down"
          : "flat"
      : null;

  const weekAverage = (() => {
    if (entries.length === 0) return null;
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = entries.filter((e) => new Date(e.date).getTime() >= cutoff);
    if (recent.length === 0) return null;
    const sum = recent.reduce((acc, e) => acc + e.hours, 0);
    return sum / recent.length;
  })();

  const addEntry = useCallback(
    (
      hours: number,
      quality: 1 | 2 | 3 | 4 | 5,
      opts?: { forDate?: string; bedtime?: string; wakeTime?: string; notes?: string },
    ) => {
      const forDate =
        opts?.forDate ?? new Date().toISOString().slice(0, 10);
      const entry: SleepEntry = {
        id: uuid(),
        date: new Date().toISOString(),
        forDate,
        hours,
        quality,
        bedtime: opts?.bedtime,
        wakeTime: opts?.wakeTime,
        notes: opts?.notes,
      };
      setEntries((prev) => {
        // Replace any existing entry for the same forDate (one per night)
        const filtered = prev.filter((e) => e.forDate !== forDate);
        const next = [entry, ...filtered].sort((a, b) =>
          b.forDate.localeCompare(a.forDate),
        );
        save(next);
        return next;
      });
    },
    [],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { entries, latest, previous, trend, weekAverage, addEntry, deleteEntry };
}

// Compute hours from HH:MM bedtime to HH:MM waketime (handles overnight wrap)
export function computeSleepHours(bedtime: string, wakeTime: string): number | null {
  const parse = (s: string) => {
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h * 60 + min;
  };
  const bed = parse(bedtime);
  const wake = parse(wakeTime);
  if (bed == null || wake == null) return null;
  let mins = wake - bed;
  if (mins <= 0) mins += 24 * 60; // wrap past midnight
  return mins / 60;
}

export const QUALITY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Poor",
  2: "Fair",
  3: "OK",
  4: "Good",
  5: "Great",
};
