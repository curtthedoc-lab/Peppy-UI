import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "peppies_steps";
const EVENT = "peppies_steps_changed";

const DEFAULT_STRIDE_M = 0.762;
const DEFAULT_WEIGHT_KG = 70;
const PEAK_THRESHOLD = 1.2;
const MIN_STEP_INTERVAL_MS = 280;
const SMOOTHING = 0.85;

export interface DailyStepRecord {
  steps: number;
  distanceM: number;
  calories: number;
  durationSec: number;
  updatedAt: string;
}

export type DailyStepMap = Record<string, DailyStepRecord>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadAll(): DailyStepMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as DailyStepMap;
    }
    return {};
  } catch {
    return {};
  }
}

function saveAll(map: DailyStepMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function haversineMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

interface TrackerConfig {
  strideM?: number;
  weightKg?: number;
}

export interface StepTrackerState {
  isRunning: boolean;
  permissionState: "idle" | "requesting" | "granted" | "denied" | "unsupported";
  permissionError: string | null;
  gpsEnabled: boolean;
  gpsError: string | null;
  // Live session counters
  sessionSteps: number;
  sessionDistanceM: number;
  sessionCalories: number;
  sessionDurationSec: number;
  sessionGpsDistanceM: number;
  currentPaceMps: number;
  // Daily totals (includes current session)
  todaySteps: number;
  todayDistanceM: number;
  todayCalories: number;
  todayDurationSec: number;
  history: DailyStepMap;
}

export interface StepTracker extends StepTrackerState {
  start: (opts?: { useGps?: boolean }) => Promise<void>;
  stop: () => void;
  resetToday: () => void;
}

export function useStepTracker(config?: TrackerConfig): StepTracker {
  const strideM = config?.strideM ?? DEFAULT_STRIDE_M;
  const weightKg = config?.weightKg ?? DEFAULT_WEIGHT_KG;

  const [history, setHistory] = useState<DailyStepMap>(loadAll);
  const [isRunning, setIsRunning] = useState(false);
  const [permissionState, setPermissionState] =
    useState<StepTrackerState["permissionState"]>("idle");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionDurationSec, setSessionDurationSec] = useState(0);
  const [sessionGpsDistanceM, setSessionGpsDistanceM] = useState(0);
  const [currentPaceMps, setCurrentPaceMps] = useState(0);

  const motionListenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(
    null,
  );
  const tickIntervalRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const lastStepAtRef = useRef<number>(0);
  const smoothedMagRef = useRef<number>(9.8);
  const aboveRef = useRef<boolean>(false);
  const gpsWatchRef = useRef<number | null>(null);
  const gpsLastFixRef = useRef<{
    lat: number;
    lon: number;
    t: number;
  } | null>(null);

  // Cross-tab + intra-app sync
  useEffect(() => {
    const onChange = () => setHistory(loadAll());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const persistSession = useCallback(
    (
      addedSteps: number,
      addedDurationSec: number,
      addedGpsDistanceM: number,
    ) => {
      if (addedSteps <= 0 && addedDurationSec <= 0 && addedGpsDistanceM <= 0)
        return;
      const key = todayKey();
      setHistory((prev) => {
        const existing = prev[key] ?? {
          steps: 0,
          distanceM: 0,
          calories: 0,
          durationSec: 0,
          updatedAt: new Date().toISOString(),
        };
        const distanceFromSteps = addedSteps * strideM;
        // If GPS distance is meaningful, prefer it; otherwise use stride estimate.
        const addedDistanceM =
          addedGpsDistanceM > 1 ? addedGpsDistanceM : distanceFromSteps;
        const addedCalories =
          addedSteps * (weightKg / DEFAULT_WEIGHT_KG) * 0.04;
        const next: DailyStepMap = {
          ...prev,
          [key]: {
            steps: existing.steps + addedSteps,
            distanceM: existing.distanceM + addedDistanceM,
            calories: existing.calories + addedCalories,
            durationSec: existing.durationSec + addedDurationSec,
            updatedAt: new Date().toISOString(),
          },
        };
        saveAll(next);
        return next;
      });
    },
    [strideM, weightKg],
  );

  // Flush session deltas every 5s while running so closing the tab doesn't lose much.
  const lastPersistRef = useRef({
    steps: 0,
    durationSec: 0,
    gpsDistanceM: 0,
  });

  const stop = useCallback(() => {
    if (motionListenerRef.current) {
      window.removeEventListener(
        "devicemotion",
        motionListenerRef.current as EventListener,
      );
      motionListenerRef.current = null;
    }
    if (tickIntervalRef.current != null) {
      window.clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (gpsWatchRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }

    // Final flush
    const stepsDelta = sessionSteps - lastPersistRef.current.steps;
    const durationDelta =
      sessionDurationSec - lastPersistRef.current.durationSec;
    const gpsDelta =
      sessionGpsDistanceM - lastPersistRef.current.gpsDistanceM;
    persistSession(stepsDelta, durationDelta, gpsDelta);

    lastPersistRef.current = { steps: 0, durationSec: 0, gpsDistanceM: 0 };
    sessionStartRef.current = null;
    setSessionSteps(0);
    setSessionDurationSec(0);
    setSessionGpsDistanceM(0);
    setCurrentPaceMps(0);
    setIsRunning(false);
    setGpsEnabled(false);
    gpsLastFixRef.current = null;
  }, [
    persistSession,
    sessionSteps,
    sessionDurationSec,
    sessionGpsDistanceM,
  ]);

  const start = useCallback(
    async (opts?: { useGps?: boolean }) => {
      if (isRunning) return;
      setPermissionError(null);
      setGpsError(null);

      // Feature detect motion API
      if (typeof window.DeviceMotionEvent === "undefined") {
        setPermissionState("unsupported");
        setPermissionError(
          "Motion sensors aren't available in this browser. Try opening Peppies on your phone.",
        );
        return;
      }

      // iOS 13+ requires explicit permission via user gesture
      const DM = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof DM.requestPermission === "function") {
        try {
          setPermissionState("requesting");
          const result = await DM.requestPermission();
          if (result !== "granted") {
            setPermissionState("denied");
            setPermissionError(
              "Motion access was declined. To turn it on: Settings → Safari → Motion & Orientation Access.",
            );
            return;
          }
          setPermissionState("granted");
        } catch (e) {
          setPermissionState("denied");
          setPermissionError(
            e instanceof Error
              ? e.message
              : "Couldn't request motion permission.",
          );
          return;
        }
      } else {
        setPermissionState("granted");
      }

      // Reset session counters & detection state
      setSessionSteps(0);
      setSessionDurationSec(0);
      setSessionGpsDistanceM(0);
      setCurrentPaceMps(0);
      lastPersistRef.current = { steps: 0, durationSec: 0, gpsDistanceM: 0 };
      lastStepAtRef.current = 0;
      smoothedMagRef.current = 9.8;
      aboveRef.current = false;
      sessionStartRef.current = Date.now();

      // Step detection — peak in low-pass-filtered magnitude
      const onMotion = (e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity;
        if (!a || a.x == null || a.y == null || a.z == null) return;
        const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
        const smoothed =
          SMOOTHING * smoothedMagRef.current + (1 - SMOOTHING) * mag;
        smoothedMagRef.current = smoothed;
        const delta = mag - smoothed;
        const now = Date.now();
        if (
          delta > PEAK_THRESHOLD &&
          !aboveRef.current &&
          now - lastStepAtRef.current >= MIN_STEP_INTERVAL_MS
        ) {
          aboveRef.current = true;
          lastStepAtRef.current = now;
          setSessionSteps((s) => s + 1);
        } else if (delta < PEAK_THRESHOLD * 0.5) {
          aboveRef.current = false;
        }
      };
      motionListenerRef.current = onMotion;
      window.addEventListener("devicemotion", onMotion);

      // Optional GPS mode
      if (opts?.useGps) {
        if (!navigator.geolocation) {
          setGpsError("GPS isn't supported in this browser.");
        } else {
          setGpsEnabled(true);
          gpsWatchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const now = Date.now();
              const fix = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                t: now,
              };
              if (pos.coords.accuracy && pos.coords.accuracy > 30) {
                // Skip low-accuracy points to avoid GPS jitter inflating distance
                gpsLastFixRef.current = fix;
                return;
              }
              const prev = gpsLastFixRef.current;
              if (prev) {
                const segMeters = haversineMeters(prev, fix);
                const segSec = Math.max(0.001, (now - prev.t) / 1000);
                const pace = segMeters / segSec;
                // Only count plausible walking/running segments
                if (segMeters > 1 && segMeters < 50 && pace < 8) {
                  setSessionGpsDistanceM((d) => d + segMeters);
                  setCurrentPaceMps(pace);
                }
              }
              gpsLastFixRef.current = fix;
            },
            (err) => {
              setGpsError(
                err.code === err.PERMISSION_DENIED
                  ? "Location access was declined. Step tracking will still work without GPS."
                  : "GPS unavailable right now.",
              );
              setGpsEnabled(false);
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
          );
        }
      }

      // Tick: update duration once per second, flush deltas every 5s
      tickIntervalRef.current = window.setInterval(() => {
        if (sessionStartRef.current == null) return;
        const elapsed = Math.floor(
          (Date.now() - sessionStartRef.current) / 1000,
        );
        setSessionDurationSec(elapsed);
        if (elapsed % 5 === 0 && elapsed > 0) {
          setSessionSteps((curSteps) => {
            setSessionGpsDistanceM((curGps) => {
              const stepsDelta = curSteps - lastPersistRef.current.steps;
              const durDelta = elapsed - lastPersistRef.current.durationSec;
              const gpsDelta = curGps - lastPersistRef.current.gpsDistanceM;
              persistSession(stepsDelta, durDelta, gpsDelta);
              lastPersistRef.current = {
                steps: curSteps,
                durationSec: elapsed,
                gpsDistanceM: curGps,
              };
              return curGps;
            });
            return curSteps;
          });
        }
      }, 1000);

      setIsRunning(true);
    },
    [isRunning, persistSession],
  );

  // Auto-stop when tab is hidden for too long? Keep running while open — DeviceMotion
  // events stop firing when the screen sleeps anyway, so duration timer is the only
  // thing that would over-count. Pause duration when hidden.
  useEffect(() => {
    if (!isRunning) return;
    const onVisibility = () => {
      if (document.hidden && sessionStartRef.current != null) {
        // Snapshot current duration into "frozen" baseline by adjusting start.
        // Simplest approach: pause the tick by clearing interval.
        if (tickIntervalRef.current != null) {
          window.clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }
      } else if (!document.hidden && isRunning && sessionStartRef.current) {
        if (tickIntervalRef.current == null) {
          tickIntervalRef.current = window.setInterval(() => {
            const elapsed = Math.floor(
              (Date.now() - (sessionStartRef.current ?? Date.now())) / 1000,
            );
            setSessionDurationSec(elapsed);
          }, 1000);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (motionListenerRef.current) {
        window.removeEventListener(
          "devicemotion",
          motionListenerRef.current as EventListener,
        );
      }
      if (tickIntervalRef.current != null)
        window.clearInterval(tickIntervalRef.current);
      if (gpsWatchRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    };
  }, []);

  const resetToday = useCallback(() => {
    const key = todayKey();
    setHistory((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      saveAll(next);
      return next;
    });
    setSessionSteps(0);
    setSessionDurationSec(0);
    setSessionGpsDistanceM(0);
    lastPersistRef.current = { steps: 0, durationSec: 0, gpsDistanceM: 0 };
    if (isRunning) sessionStartRef.current = Date.now();
  }, [isRunning]);

  const todayRecord = history[todayKey()] ?? {
    steps: 0,
    distanceM: 0,
    calories: 0,
    durationSec: 0,
    updatedAt: "",
  };

  // Live totals = persisted today + unflushed session delta
  const stepsDelta = sessionSteps - lastPersistRef.current.steps;
  const durationDelta =
    sessionDurationSec - lastPersistRef.current.durationSec;
  const gpsDelta = sessionGpsDistanceM - lastPersistRef.current.gpsDistanceM;
  const distanceDelta =
    gpsDelta > 1 ? gpsDelta : Math.max(0, stepsDelta) * strideM;
  const caloriesDelta =
    Math.max(0, stepsDelta) * (weightKg / DEFAULT_WEIGHT_KG) * 0.04;

  const sessionDistanceM =
    sessionGpsDistanceM > 1 ? sessionGpsDistanceM : sessionSteps * strideM;
  const sessionCalories =
    sessionSteps * (weightKg / DEFAULT_WEIGHT_KG) * 0.04;

  return {
    isRunning,
    permissionState,
    permissionError,
    gpsEnabled,
    gpsError,
    sessionSteps,
    sessionDistanceM,
    sessionCalories,
    sessionDurationSec,
    sessionGpsDistanceM,
    currentPaceMps,
    todaySteps: todayRecord.steps + Math.max(0, stepsDelta),
    todayDistanceM: todayRecord.distanceM + distanceDelta,
    todayCalories: todayRecord.calories + caloriesDelta,
    todayDurationSec: todayRecord.durationSec + Math.max(0, durationDelta),
    history,
    start,
    stop,
    resetToday,
  };
}
