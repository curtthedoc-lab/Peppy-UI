import { useEffect, useRef } from "react";
import { usePreferences } from "./usePreferences";
import { CYCLES_CHANGED_EVENT } from "./useCycles";

const NOTIFIED_KEY = "peppies_notifications";

interface NotifiedMap {
  notifiedCycles: string[];
}

function loadNotified(): NotifiedMap {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    if (!raw) return { notifiedCycles: [] };
    const parsed = JSON.parse(raw) as Partial<NotifiedMap>;
    return { notifiedCycles: Array.isArray(parsed.notifiedCycles) ? parsed.notifiedCycles : [] };
  } catch {
    return { notifiedCycles: [] };
  }
}

function markNotified(cycleId: string) {
  const cur = loadNotified();
  if (cur.notifiedCycles.includes(cycleId)) return;
  cur.notifiedCycles.push(cycleId);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(cur));
}

interface ActiveCycle {
  id: string;
  name: string;
  startDate: string;
  durationDays?: number;
  endedAt?: string;
}

function loadActiveCycles(): ActiveCycle[] {
  try {
    const raw = localStorage.getItem("peppies_cycles");
    if (!raw) return [];
    const list = JSON.parse(raw) as ActiveCycle[];
    return list.filter((c) => !c.endedAt);
  } catch {
    return [];
  }
}

function cycleEndTime(c: ActiveCycle): number | null {
  if (!c.durationDays || c.durationDays <= 0) return null;
  const start = new Date(c.startDate).getTime();
  if (isNaN(start)) return null;
  return start + c.durationDays * 24 * 60 * 60 * 1000;
}

function fireNotification(cycle: ActiveCycle) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("Peppies — Cycle complete", {
      body: `Your "${cycle.name}" cycle has reached its ${cycle.durationDays}-day duration. Time to review or end it.`,
      tag: `peppies-cycle-${cycle.id}`,
      icon: "/peppies/icon-192.png",
    });
    markNotified(cycle.id);
  } catch {
    // ignore — some browsers (iOS Safari) throw on direct construction; PWA install path handles it
  }
}

export function useCycleReminder() {
  const { prefs } = usePreferences();
  // One scheduled timer per active cycle, keyed by cycle id.
  const scheduledTimers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const clearAllTimers = () => {
      scheduledTimers.current.forEach((t) => clearTimeout(t));
      scheduledTimers.current.clear();
    };

    if (!prefs.cycleReminders) {
      clearAllTimers();
      return;
    }
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const check = () => {
      // Reset all pending timers — cycles may have been added, ended, or removed.
      clearAllTimers();

      const cycles = loadActiveCycles();
      if (cycles.length === 0) return;
      const now = Date.now();
      const notified = loadNotified();

      for (const cycle of cycles) {
        const endTime = cycleEndTime(cycle);
        if (endTime === null) continue;

        if (now >= endTime) {
          if (!notified.notifiedCycles.includes(cycle.id)) {
            fireNotification(cycle);
          }
          continue;
        }
        const msUntil = endTime - now;
        if (msUntil <= 24 * 60 * 60 * 1000) {
          const cycleIdAtSchedule = cycle.id;
          const timer = window.setTimeout(() => {
            scheduledTimers.current.delete(cycleIdAtSchedule);
            // Re-verify at fire time: cycle still active, still past end, not already notified.
            const fresh = loadActiveCycles().find((c) => c.id === cycleIdAtSchedule);
            if (!fresh) return;
            const freshEnd = cycleEndTime(fresh);
            if (freshEnd === null || Date.now() < freshEnd) return;
            const freshNotified = loadNotified();
            if (freshNotified.notifiedCycles.includes(fresh.id)) return;
            fireNotification(fresh);
          }, msUntil + 1000);
          scheduledTimers.current.set(cycleIdAtSchedule, timer);
        }
      }
    };

    check();
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", check);
    window.addEventListener(CYCLES_CHANGED_EVENT, check);
    window.addEventListener("storage", check);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", check);
      window.removeEventListener(CYCLES_CHANGED_EVENT, check);
      window.removeEventListener("storage", check);
      clearAllTimers();
    };
  }, [prefs.cycleReminders]);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return "denied";
  }
}

export function notificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function currentNotificationPermission(): NotificationPermission {
  if (!notificationSupported()) return "denied";
  return Notification.permission;
}
