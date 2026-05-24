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

function loadActiveCycle(): ActiveCycle | null {
  try {
    const raw = localStorage.getItem("peppies_cycles");
    if (!raw) return null;
    const list = JSON.parse(raw) as ActiveCycle[];
    return list.find((c) => !c.endedAt) ?? null;
  } catch {
    return null;
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
  const scheduledTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!prefs.cycleReminders) {
      if (scheduledTimer.current !== null) {
        clearTimeout(scheduledTimer.current);
        scheduledTimer.current = null;
      }
      return;
    }
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const check = () => {
      // Always clear any pending timer first — it may be tied to a stale or removed cycle.
      if (scheduledTimer.current !== null) {
        clearTimeout(scheduledTimer.current);
        scheduledTimer.current = null;
      }
      const cycle = loadActiveCycle();
      if (!cycle) return;
      const endTime = cycleEndTime(cycle);
      if (endTime === null) return;
      const now = Date.now();
      const notified = loadNotified();

      if (now >= endTime) {
        if (!notified.notifiedCycles.includes(cycle.id)) {
          fireNotification(cycle);
        }
        return;
      }
      const msUntil = endTime - now;
      if (msUntil <= 24 * 60 * 60 * 1000) {
        const cycleIdAtSchedule = cycle.id;
        scheduledTimer.current = window.setTimeout(() => {
          scheduledTimer.current = null;
          // Re-verify at fire time: cycle still active, same id, still past end, not already notified.
          const fresh = loadActiveCycle();
          if (!fresh || fresh.id !== cycleIdAtSchedule) return;
          const freshEnd = cycleEndTime(fresh);
          if (freshEnd === null || Date.now() < freshEnd) return;
          const freshNotified = loadNotified();
          if (freshNotified.notifiedCycles.includes(fresh.id)) return;
          fireNotification(fresh);
        }, msUntil + 1000);
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
      if (scheduledTimer.current !== null) {
        clearTimeout(scheduledTimer.current);
        scheduledTimer.current = null;
      }
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
