import { useState } from "react";
import { motion } from "framer-motion";
import {
  Footprints,
  Play,
  Square,
  MapPin,
  Flame,
  Clock,
  Route,
  RotateCcw,
} from "lucide-react";
import { useStepTracker } from "@/hooks/useStepTracker";
import { useProfile } from "@/hooks/useProfile";
import { useWeight } from "@/hooks/useWeight";

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDistance(meters: number): { value: string; unit: string } {
  if (meters >= 1000) return { value: (meters / 1000).toFixed(2), unit: "km" };
  return { value: Math.round(meters).toString(), unit: "m" };
}

export function Steps() {
  const { profile } = useProfile();
  const { entries: weightEntries } = useWeight();
  const [useGps, setUseGps] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const latestWeightKg =
    weightEntries.length > 0
      ? weightEntries[0].unit === "kg"
        ? weightEntries[0].value
        : weightEntries[0].value * 0.453592
      : profile.startingWeight
        ? profile.startingWeight > 110
          ? profile.startingWeight * 0.453592
          : profile.startingWeight
        : 70;

  const tracker = useStepTracker({ weightKg: latestWeightKg });

  const handleStart = async () => {
    await tracker.start({ useGps });
  };

  const dist = formatDistance(tracker.todayDistanceM);
  const sessionDist = formatDistance(tracker.sessionDistanceM);

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em] leading-none">
            Steps
          </h1>
          <p className="text-[12.5px] text-muted-foreground/70 mt-1.5">
            Today &middot; {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
          <Footprints size={22} strokeWidth={2} />
        </div>
      </div>

      {/* Big step counter */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 flex flex-col items-center gap-1 shadow-lg shadow-black/20">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Steps today
        </p>
        <p
          className="text-[64px] font-bold tabular-nums text-primary leading-none mt-1 tracking-[-0.03em]"
          data-testid="text-today-steps"
        >
          {tracker.todaySteps.toLocaleString()}
        </p>
        {tracker.isRunning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 flex items-center gap-1.5"
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            <span className="text-[11px] font-semibold text-primary tracking-wide">
              Tracking
            </span>
          </motion.div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={Route}
          label="Distance"
          value={dist.value}
          unit={dist.unit}
          testId="stat-distance"
        />
        <StatTile
          icon={Flame}
          label="Calories"
          value={Math.round(tracker.todayCalories).toString()}
          unit="kcal"
          testId="stat-calories"
        />
        <StatTile
          icon={Clock}
          label="Active"
          value={formatDuration(tracker.todayDurationSec)}
          unit=""
          testId="stat-duration"
        />
      </div>

      {/* Outdoor walk toggle */}
      {!tracker.isRunning && (
        <button
          onClick={() => setUseGps((v) => !v)}
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
          className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border transition-colors ${
            useGps
              ? "bg-primary/15 border-primary/40 text-primary"
              : "bg-card border-border/60 text-foreground"
          }`}
          data-testid="toggle-gps"
        >
          <div className="flex items-center gap-3">
            <MapPin size={18} strokeWidth={2.2} />
            <div className="text-left">
              <p className="text-[14px] font-semibold leading-tight">
                Outdoor walk mode
              </p>
              <p className="text-[11.5px] text-muted-foreground/70 mt-0.5">
                Use GPS for more accurate distance &amp; pace
              </p>
            </div>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
              useGps ? "bg-primary justify-end" : "bg-muted justify-start"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow" />
          </div>
        </button>
      )}

      {/* Start/Stop control */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={tracker.isRunning ? tracker.stop : handleStart}
        disabled={tracker.permissionState === "requesting"}
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        className={`w-full font-semibold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all ${
          tracker.isRunning
            ? "bg-destructive text-destructive-foreground shadow-destructive/20"
            : "bg-primary text-primary-foreground shadow-primary/30"
        }`}
        data-testid={tracker.isRunning ? "button-stop-walking" : "button-start-walking"}
      >
        {tracker.permissionState === "requesting" ? (
          "Requesting permission…"
        ) : tracker.isRunning ? (
          <>
            <Square size={16} strokeWidth={2.4} fill="currentColor" />
            Stop Walking
          </>
        ) : (
          <>
            <Play size={16} strokeWidth={2.4} fill="currentColor" />
            Start Walking
          </>
        )}
      </motion.button>

      {/* Errors */}
      {tracker.permissionError && (
        <div
          className="bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 text-[12.5px] text-destructive"
          data-testid="text-permission-error"
        >
          {tracker.permissionError}
        </div>
      )}
      {tracker.gpsError && (
        <div
          className="bg-muted/60 rounded-xl px-4 py-3 text-[12.5px] text-muted-foreground"
          data-testid="text-gps-error"
        >
          {tracker.gpsError}
        </div>
      )}

      {/* Session details while running */}
      {tracker.isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-3xl p-5 flex flex-col gap-3"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            This session
          </p>
          <div className="grid grid-cols-2 gap-3">
            <SessionRow label="Steps" value={tracker.sessionSteps.toLocaleString()} />
            <SessionRow
              label="Time"
              value={formatDuration(tracker.sessionDurationSec)}
            />
            <SessionRow label="Distance" value={`${sessionDist.value} ${sessionDist.unit}`} />
            <SessionRow
              label="Calories"
              value={`${Math.round(tracker.sessionCalories)} kcal`}
            />
          </div>
          {tracker.gpsEnabled && (
            <div className="mt-1 pt-3 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11.5px] text-primary font-semibold">
                <MapPin size={12} strokeWidth={2.4} /> GPS active
              </div>
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {tracker.currentPaceMps > 0
                  ? `${(tracker.currentPaceMps * 3.6).toFixed(1)} km/h`
                  : "—"}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Reset today */}
      {!tracker.isRunning && tracker.todaySteps > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-[12px] text-muted-foreground/70 flex items-center gap-1.5 px-3 py-2"
              data-testid="button-reset-today"
            >
              <RotateCcw size={11} strokeWidth={2.2} />
              Reset today's steps
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  tracker.resetToday();
                  setConfirmReset(false);
                }}
                className="text-[12px] font-semibold bg-destructive/15 text-destructive px-3.5 py-2 rounded-xl"
                data-testid="button-reset-confirm"
              >
                Yes, reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-[12px] font-semibold bg-muted text-muted-foreground px-3.5 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Helper note for iOS */}
      {!tracker.isRunning && tracker.permissionState === "idle" && (
        <p className="text-[11.5px] text-muted-foreground/60 text-center leading-snug px-4">
          On iPhone, you'll be asked to allow Motion &amp; Orientation access.
          Add Peppies to your Home Screen for the most reliable tracking.
        </p>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  testId,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
  unit: string;
  testId?: string;
}) {
  return (
    <div
      className="bg-card border border-border/60 rounded-2xl px-3 py-3.5 flex flex-col gap-1"
      data-testid={testId}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground/70">
        <Icon size={12} strokeWidth={2.2} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[20px] font-bold tabular-nums leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-muted-foreground/60">{unit}</span>
        )}
      </div>
    </div>
  );
}

function SessionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
      <span className="text-[16px] font-bold tabular-nums leading-tight mt-0.5">
        {value}
      </span>
    </div>
  );
}

