import { useState } from "react";
import { motion } from "framer-motion";
import { X, Target, Scale, Ruler } from "lucide-react";
import {
  useProfile,
  MeasurementKey,
  MEASUREMENT_KEYS,
  MEASUREMENT_LABELS,
} from "@/hooks/useProfile";
import { usePreferences } from "@/hooks/usePreferences";

// Strict: full-string positive decimal only. Rejects "12abc", "-", ".", "" → null.
const NUM_RE = /^\d+(\.\d+)?$/;
function parseNumOrNull(v: string): number | null {
  const trimmed = v.trim();
  if (trimmed === "") return null;
  if (!NUM_RE.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!isFinite(n) || n <= 0) return null;
  return n;
}

// Detect whether the input looks like a "clearing" action vs invalid transient typing.
// Empty string → user is clearing → save null.
// Non-empty but invalid → don't touch persisted value (user mid-edit).
function shouldPersist(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed === "") return true;
  return NUM_RE.test(trimmed);
}

function toInputString(n: number | null): string {
  return n === null ? "" : String(n);
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Target;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[13px] font-bold leading-tight">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground/70 leading-tight mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  onCommit,
  unit,
  placeholder,
  testId,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  unit: string;
  placeholder?: string;
  testId?: string;
  invalid?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-0.5">
        {label}
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="decimal"
          placeholder={placeholder}
          data-testid={testId}
          className={`w-full bg-background border rounded-xl pl-3 pr-10 py-2.5 text-[14px] placeholder:text-muted-foreground/40 outline-none transition-colors ${
            invalid
              ? "border-destructive/60 focus:border-destructive"
              : "border-border/60 focus:border-primary/50"
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/70 font-medium pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function MeasurementRow({
  mKey,
  unit,
  current,
  goal,
  onChangeCurrent,
  onChangeGoal,
  onCommitCurrent,
  onCommitGoal,
}: {
  mKey: MeasurementKey;
  unit: string;
  current: string;
  goal: string;
  onChangeCurrent: (v: string) => void;
  onChangeGoal: (v: string) => void;
  onCommitCurrent: () => void;
  onCommitGoal: () => void;
}) {
  const currentInvalid = current.trim() !== "" && !NUM_RE.test(current.trim());
  const goalInvalid = goal.trim() !== "" && !NUM_RE.test(goal.trim());
  return (
    <div className="bg-muted/30 rounded-2xl p-3">
      <p className="text-[12.5px] font-semibold mb-2.5 px-0.5">
        {MEASUREMENT_LABELS[mKey]}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Current"
          value={current}
          onChange={onChangeCurrent}
          onCommit={onCommitCurrent}
          unit={unit}
          invalid={currentInvalid}
          testId={`input-${mKey}-current`}
        />
        <NumberField
          label="Goal"
          value={goal}
          onChange={onChangeGoal}
          onCommit={onCommitGoal}
          unit={unit}
          invalid={goalInvalid}
          testId={`input-${mKey}-goal`}
        />
      </div>
    </div>
  );
}

export function ProfileSheet({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile, setMeasurement, setMeasurementUnit } = useProfile();
  const { prefs } = usePreferences();

  const [startingWeight, setStartingWeight] = useState(toInputString(profile.startingWeight));
  const [weightGoal, setWeightGoal] = useState(toInputString(profile.weightGoal));
  const [measurementInputs, setMeasurementInputs] = useState<
    Record<MeasurementKey, { current: string; goal: string }>
  >(() =>
    MEASUREMENT_KEYS.reduce((acc, k) => {
      acc[k] = {
        current: toInputString(profile.measurements[k].current),
        goal: toInputString(profile.measurements[k].goal),
      };
      return acc;
    }, {} as Record<MeasurementKey, { current: string; goal: string }>)
  );

  const commitStartingWeight = () => {
    if (!shouldPersist(startingWeight)) {
      setStartingWeight(toInputString(profile.startingWeight));
      return;
    }
    const sw = parseNumOrNull(startingWeight);
    if (sw !== profile.startingWeight) updateProfile({ startingWeight: sw });
    setStartingWeight(toInputString(sw));
  };

  const commitWeightGoal = () => {
    if (!shouldPersist(weightGoal)) {
      setWeightGoal(toInputString(profile.weightGoal));
      return;
    }
    const wg = parseNumOrNull(weightGoal);
    if (wg !== profile.weightGoal) updateProfile({ weightGoal: wg });
    setWeightGoal(toInputString(wg));
  };

  const commitMeasurement = (key: MeasurementKey, field: "current" | "goal") => {
    const raw = measurementInputs[key][field];
    if (!shouldPersist(raw)) {
      setMeasurementInputs((prev) => ({
        ...prev,
        [key]: { ...prev[key], [field]: toInputString(profile.measurements[key][field]) },
      }));
      return;
    }
    const parsed = parseNumOrNull(raw);
    if (parsed !== profile.measurements[key][field]) {
      setMeasurement(key, field, parsed);
    }
    setMeasurementInputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: toInputString(parsed) },
    }));
  };

  const handleMeasurementChange = (
    key: MeasurementKey,
    field: "current" | "goal",
    raw: string
  ) => {
    setMeasurementInputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: raw },
    }));
  };

  const startingWeightInvalid =
    startingWeight.trim() !== "" && !NUM_RE.test(startingWeight.trim());
  const weightGoalInvalid =
    weightGoal.trim() !== "" && !NUM_RE.test(weightGoal.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 } as const}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[88vh] overflow-y-auto"
        data-testid="sheet-profile"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            data-testid="button-close-profile"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <p className="text-[12px] text-muted-foreground/70 leading-relaxed -mt-2">
          Track your starting point and goals. Everything stays on this device.
        </p>

        <div>
          <SectionHeader
            icon={Scale}
            title="Weight"
            subtitle={`Tracked in ${prefs.weightUnit}`}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <NumberField
              label="Starting"
              value={startingWeight}
              onChange={setStartingWeight}
              onCommit={commitStartingWeight}
              unit={prefs.weightUnit}
              invalid={startingWeightInvalid}
              placeholder={prefs.weightUnit === "kg" ? "82.5" : "180"}
              testId="input-starting-weight"
            />
            <NumberField
              label="Goal"
              value={weightGoal}
              onChange={setWeightGoal}
              onCommit={commitWeightGoal}
              unit={prefs.weightUnit}
              invalid={weightGoalInvalid}
              placeholder={prefs.weightUnit === "kg" ? "75" : "165"}
              testId="input-weight-goal"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionHeader icon={Ruler} title="Body Measurements" />
            <div className="flex bg-muted rounded-xl p-0.5 gap-0.5" data-testid="measurement-unit-toggle">
              {(["in", "cm"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setMeasurementUnit(u)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    profile.measurementUnit === u
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/60"
                  }`}
                  data-testid={`button-unit-${u}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {MEASUREMENT_KEYS.map((k) => (
              <MeasurementRow
                key={k}
                mKey={k}
                unit={profile.measurementUnit}
                current={measurementInputs[k].current}
                goal={measurementInputs[k].goal}
                onChangeCurrent={(v) => handleMeasurementChange(k, "current", v)}
                onChangeGoal={(v) => handleMeasurementChange(k, "goal", v)}
                onCommitCurrent={() => commitMeasurement(k, "current")}
                onCommitGoal={() => commitMeasurement(k, "goal")}
              />
            ))}
          </div>
        </div>

        <p className="text-[10.5px] text-muted-foreground/50 text-center leading-relaxed px-2">
          Changes save automatically. Leave a field empty to clear it.
        </p>
      </motion.div>
    </motion.div>
  );
}
