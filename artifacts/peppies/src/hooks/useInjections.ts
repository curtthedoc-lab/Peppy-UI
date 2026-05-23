import { useState, useCallback } from "react";

export interface Injection {
  id: string;
  peptide: string;
  dose: string;
  units: string;
  site: string;
  notes: string;
  date: string;
}

const STORAGE_KEY = "peppies_injections";

function loadInjections(): Injection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Injection[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(injections: Injection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(injections));
}

export function useInjections() {
  const [injections, setInjections] = useState<Injection[]>(loadInjections);

  const addInjection = useCallback((data: Omit<Injection, "id" | "date">) => {
    const entry: Injection = {
      ...data,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setInjections((prev) => {
      const next = [entry, ...prev];
      saveToStorage(next);
      return next;
    });
    return entry;
  }, []);

  const deleteInjection = useCallback((id: string) => {
    setInjections((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  return { injections, addInjection, deleteInjection };
}
