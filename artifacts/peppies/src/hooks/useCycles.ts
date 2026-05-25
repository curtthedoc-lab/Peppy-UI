import { useState, useCallback, useEffect } from "react";
import { uuid } from "@/utils/uuid";

export interface Cycle {
  id: string;
  name: string;
  startDate: string;
  durationDays?: number;
  notes?: string;
  endedAt?: string;
}

const STORAGE_KEY = "peppies_cycles";

function load(): Cycle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cycle[]) : [];
  } catch {
    return [];
  }
}

export const CYCLES_CHANGED_EVENT = "peppies_cycles_changed";

function save(cycles: Cycle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
  window.dispatchEvent(new CustomEvent(CYCLES_CHANGED_EVENT));
}

export function useCycles() {
  const [cycles, setCycles] = useState<Cycle[]>(load);

  useEffect(() => {
    const onChange = () => setCycles(load());
    window.addEventListener(CYCLES_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CYCLES_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // All non-ended cycles, newest first (newest = lowest index in stored array).
  const activeCycles = cycles.filter((c) => !c.endedAt);
  // Backwards-compatible alias — first active cycle, or null.
  const activeCycle = activeCycles[0] ?? null;
  const pastCycles = cycles.filter((c) => !!c.endedAt).reverse();

  // Start a new protocol. Does NOT end any currently active protocols —
  // multiple can run in parallel.
  const startCycle = useCallback((data: Omit<Cycle, "id" | "endedAt">) => {
    const entry: Cycle = { ...data, id: uuid() };
    setCycles((prev) => {
      const next = [entry, ...prev];
      save(next);
      return next;
    });
  }, []);

  const endCycle = useCallback((id: string) => {
    setCycles((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, endedAt: new Date().toISOString() } : c));
      save(next);
      return next;
    });
  }, []);

  const deleteCycle = useCallback((id: string) => {
    setCycles((prev) => {
      const next = prev.filter((c) => c.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { cycles, activeCycle, activeCycles, pastCycles, startCycle, endCycle, deleteCycle };
}

export function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}
