import { useState, useCallback, useEffect } from "react";
import { uuid } from "@/utils/uuid";

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
const EVENT = "peppies_injections_changed";

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
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useInjections() {
  const [injections, setInjections] = useState<Injection[]>(loadInjections);

  useEffect(() => {
    const onChange = () => setInjections(loadInjections());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addInjection = useCallback((data: Omit<Injection, "id" | "date">) => {
    const entry: Injection = {
      ...data,
      id: uuid(),
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

  const updateInjection = useCallback((id: string, patch: Partial<Omit<Injection, "id" | "date">>) => {
    setInjections((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i));
      saveToStorage(next);
      return next;
    });
  }, []);

  return { injections, addInjection, deleteInjection, updateInjection };
}
