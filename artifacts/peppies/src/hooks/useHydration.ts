import { useState, useCallback, useEffect } from "react";
import { localDayKey } from "@/utils/localDate";

interface HydrationState {
  date: string;
  count: number;
  goal: number;
}

const STORAGE_KEY = "peppies_hydration";
const EVENT = "peppies_hydration_changed";
const TODAY = () => localDayKey();

function load(): HydrationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HydrationState;
      if (parsed.date === TODAY()) return parsed;
    }
  } catch {
    // fall through
  }
  return { date: TODAY(), count: 0, goal: 8 };
}

function save(state: HydrationState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useHydration() {
  const [state, setState] = useState<HydrationState>(load);

  useEffect(() => {
    const onChange = () => setState(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addGlass = useCallback(() => {
    setState((prev) => {
      const today = TODAY();
      const base = prev.date === today ? prev : { date: today, count: 0, goal: prev.goal };
      const next = { ...base, count: Math.min(base.count + 1, base.goal) };
      save(next);
      return next;
    });
  }, []);

  const removeGlass = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, count: Math.max(prev.count - 1, 0) };
      save(next);
      return next;
    });
  }, []);

  const setGoal = useCallback((goal: number) => {
    setState((prev) => {
      const next = { ...prev, goal };
      save(next);
      return next;
    });
  }, []);

  return { count: state.count, goal: state.goal, addGlass, removeGlass, setGoal };
}
