import { useState, useCallback, useEffect } from "react";
import { uuid } from "@/utils/uuid";

export interface Calculation {
  id: string;
  vialMg: number;
  bacMl: number;
  doseMcg: number;
  concentration: number;
  mlRequired: number;
  syringeUnits: number;
  date: string;
}

const STORAGE_KEY = "peppies_calculations";
const EVENT = "peppies_calculations_changed";

function load(): Calculation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Calculation[]) : [];
  } catch {
    return [];
  }
}

function persist(items: Calculation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useCalculations() {
  const [calculations, setCalculations] = useState<Calculation[]>(load);

  useEffect(() => {
    const onChange = () => setCalculations(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addCalculation = useCallback((data: Omit<Calculation, "id" | "date">) => {
    const entry: Calculation = {
      ...data,
      id: uuid(),
      date: new Date().toISOString(),
    };
    setCalculations((prev) => {
      const next = [entry, ...prev].slice(0, 10);
      persist(next);
      return next;
    });
    return entry;
  }, []);

  const clearCalculations = useCallback(() => {
    setCalculations([]);
    persist([]);
  }, []);

  return { calculations, addCalculation, clearCalculations };
}
