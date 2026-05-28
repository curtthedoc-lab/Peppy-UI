import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  Activity,
  Flame,
  Check,
  Pencil,
} from "lucide-react";
import { useMacroProfile } from "@/hooks/useMacroProfile";
import { useNutrition } from "@/hooks/useNutrition";
import { usePreferences } from "@/hooks/usePreferences";
import {
  ACTIVITY_DESCRIPTIONS,
  ACTIVITY_LABELS,
  GOAL_DESCRIPTIONS,
  GOAL_LABELS,
  cmToFeetInches,
  computeMacros,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  type ActivityLevel,
  type FitnessGoal,
  type Sex,
} from "@/utils/findMyMacros";

type Step = 1 | 2 | 3 | 4;

const ACTIVITY_KEYS: ActivityLevel[] = [
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
  "athlete",
];

const GOAL_KEYS: FitnessGoal[] = ["lose_fat", "maintain", "build_muscle", "recomp"];

function parseNum(v: string): number | null {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null;
}

function Pill({
  active,
  children,
  onClick,
  testId,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`flex-1 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground/80 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function OptionCard({
  active,
  title,
  description,
  onClick,
  testId,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-colors flex items-start gap-3 ${
        active
          ? "border-primary/60 bg-primary/10"
          : "border-border/60 bg-background hover:border-border"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
          active ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {active && <Check size={11} strokeWidth={3} className="text-primary-foreground" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] font-semibold leading-tight ${active ? "text-primary" : ""}`}>
          {title}
        </p>
        <p className="text-[12px] text-muted-foreground/70 mt-1 leading-snug">{description}</p>
      </div>
    </button>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  testId,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suffix?: string;
  testId?: string;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder={placeholder}
        inputMode="decimal"
        data-testid={testId}
        className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground/60 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function FindMyMacrosSheet({ onClose }: { onClose: () => void }) {
  const { macroProfile, updateMacroProfile } = useMacroProfile();
  const { setGoals } = useNutrition();
  const { prefs } = usePreferences();
  const isMetric = prefs.weightUnit === "kg";

  const [step, setStep] = useState<Step>(1);

  const [age, setAge] = useState(macroProfile.age ? String(macroProfile.age) : "");
  const [sex, setSex] = useState<Sex | null>(macroProfile.sex);

  const [heightUnit, setHeightUnit] = useState<"in" | "cm">(isMetric ? "cm" : "in");
  const initHeight = (() => {
    if (!macroProfile.heightCm) return { cm: "", ft: "", inc: "" };
    const { feet, inches } = cmToFeetInches(macroProfile.heightCm);
    return {
      cm: String(Math.round(macroProfile.heightCm)),
      ft: String(feet),
      inc: String(inches),
    };
  })();
  const [heightCm, setHeightCm] = useState(initHeight.cm);
  const [heightFt, setHeightFt] = useState(initHeight.ft);
  const [heightIn, setHeightIn] = useState(initHeight.inc);

  const initWeight = macroProfile.currentWeightKg
    ? isMetric
      ? String(Math.round(macroProfile.currentWeightKg * 10) / 10)
      : String(Math.round(kgToLb(macroProfile.currentWeightKg) * 10) / 10)
    : "";
  const initGoalWeight = macroProfile.goalWeightKg
    ? isMetric
      ? String(Math.round(macroProfile.goalWeightKg * 10) / 10)
      : String(Math.round(kgToLb(macroProfile.goalWeightKg) * 10) / 10)
    : "";
  const [weight, setWeight] = useState(initWeight);
  const [goalWeight, setGoalWeight] = useState(initGoalWeight);

  const [activity, setActivity] = useState<ActivityLevel | null>(macroProfile.activity);
  const [goal, setGoal] = useState<FitnessGoal | null>(macroProfile.goal);

  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editCal, setEditCal] = useState("");
  const [editProt, setEditProt] = useState("");
  const [editCarbs, setEditCarbs] = useState("");
  const [editFat, setEditFat] = useState("");
  const [saved, setSaved] = useState(false);

  const parsedAge = parseNum(age);
  const parsedWeight = parseNum(weight);
  const parsedGoalWeight = goalWeight.trim() ? parseNum(goalWeight) : null;
  const weightKg = parsedWeight ? (isMetric ? parsedWeight : lbToKg(parsedWeight)) : null;
  const goalWeightKg = parsedGoalWeight
    ? isMetric
      ? parsedGoalWeight
      : lbToKg(parsedGoalWeight)
    : null;

  const computedHeightCm = (() => {
    if (heightUnit === "cm") {
      const n = parseNum(heightCm);
      return n && n >= 80 && n <= 260 ? n : null;
    }
    const ft = Number(heightFt);
    const inc = Number(heightIn || "0");
    if (!isFinite(ft) || ft <= 0) return null;
    const cm = feetInchesToCm(ft, isFinite(inc) ? inc : 0);
    return cm >= 80 && cm <= 260 ? cm : null;
  })();

  const canStep1 =
    !!parsedAge &&
    parsedAge >= 13 &&
    parsedAge <= 100 &&
    !!sex &&
    !!computedHeightCm &&
    !!weightKg &&
    weightKg >= 30 &&
    weightKg <= 300;
  const canStep2 = !!activity;
  const canStep3 = !!goal;

  const result = useMemo(() => {
    if (!canStep1 || !activity || !goal || !weightKg || !computedHeightCm || !parsedAge || !sex)
      return null;
    return computeMacros({
      sex,
      age: parsedAge,
      heightCm: computedHeightCm,
      weightKg,
      activity,
      goal,
    });
  }, [canStep1, activity, goal, weightKg, computedHeightCm, parsedAge, sex]);

  useEffect(() => {
    if (step === 4 && result && !editMode) {
      setEditCal(String(result.targets.calories));
      setEditProt(String(result.targets.protein));
      setEditCarbs(String(result.targets.carbs));
      setEditFat(String(result.targets.fat));
    }
  }, [step, result, editMode]);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!parsedAge || parsedAge < 13 || parsedAge > 100) {
        setError("Enter an age between 13 and 100.");
        return;
      }
      if (!sex) {
        setError("Pick a sex.");
        return;
      }
      if (!computedHeightCm) {
        setError("Enter a valid height.");
        return;
      }
      if (!weightKg || weightKg < 30 || weightKg > 300) {
        setError(
          isMetric ? "Enter a weight between 30 and 300 kg." : "Enter a weight between 65 and 660 lbs."
        );
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!activity) {
        setError("Pick an activity level.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!goal) {
        setError("Pick a goal.");
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 1) {
      onClose();
      return;
    }
    if (editMode) {
      setEditMode(false);
      return;
    }
    setStep((s) => (s - 1) as Step);
  };

  const handleSave = () => {
    if (!result || !weightKg || !computedHeightCm || !parsedAge || !sex || !activity || !goal)
      return;

    let targets = result.targets;
    if (editMode) {
      const c = Number(editCal);
      const p = Number(editProt);
      const cb = Number(editCarbs);
      const f = Number(editFat);
      if (![c, p, cb, f].every((n) => isFinite(n) && n >= 0)) {
        setError("Targets must be non-negative numbers.");
        return;
      }
      targets = {
        calories: Math.round(c),
        protein: Math.round(p),
        carbs: Math.round(cb),
        fat: Math.round(f),
      };
    }

    setGoals(targets);
    updateMacroProfile({
      age: parsedAge,
      sex,
      heightCm: Math.round(computedHeightCm),
      currentWeightKg: weightKg,
      goalWeightKg,
      activity,
      goal,
      lastCalculatedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const stepTitle: Record<Step, string> = {
    1: "Your stats",
    2: "Activity level",
    3: "Your goal",
    4: "Your daily targets",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 backdrop-blur-sm"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px) + 24px, 40px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -16, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full mx-4 max-w-[420px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[88vh] overflow-y-auto"
        data-testid="sheet-find-my-macros"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground/60 tracking-widest uppercase leading-none mb-1">
              Find My Macros · Step {step} of 4
            </p>
            <h2 className="text-[17px] font-bold leading-tight">{stepTitle[step]}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0"
            data-testid="button-close-find-my-macros"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
                  Age
                </label>
                <NumberInput
                  value={age}
                  onChange={setAge}
                  placeholder="e.g. 32"
                  suffix="years"
                  testId="input-age"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
                  Sex (for BMR calculation)
                </label>
                <div className="flex gap-2">
                  <Pill active={sex === "male"} onClick={() => setSex("male")} testId="pill-sex-male">
                    Male
                  </Pill>
                  <Pill
                    active={sex === "female"}
                    onClick={() => setSex("female")}
                    testId="pill-sex-female"
                  >
                    Female
                  </Pill>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground/70">Height</label>
                  <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
                    {(["in", "cm"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setHeightUnit(u)}
                        className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-colors ${
                          heightUnit === u
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground/60"
                        }`}
                        data-testid={`height-unit-${u}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                {heightUnit === "cm" ? (
                  <NumberInput
                    value={heightCm}
                    onChange={setHeightCm}
                    placeholder="e.g. 178"
                    suffix="cm"
                    testId="input-height-cm"
                  />
                ) : (
                  <div className="flex gap-2">
                    <NumberInput
                      value={heightFt}
                      onChange={setHeightFt}
                      placeholder="ft"
                      suffix="ft"
                      testId="input-height-ft"
                    />
                    <NumberInput
                      value={heightIn}
                      onChange={setHeightIn}
                      placeholder="in"
                      suffix="in"
                      testId="input-height-in"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
                  Current weight
                </label>
                <NumberInput
                  value={weight}
                  onChange={setWeight}
                  placeholder={isMetric ? "e.g. 78" : "e.g. 172"}
                  suffix={isMetric ? "kg" : "lbs"}
                  testId="input-current-weight"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
                  Goal weight <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <NumberInput
                  value={goalWeight}
                  onChange={setGoalWeight}
                  placeholder={isMetric ? "e.g. 72" : "e.g. 160"}
                  suffix={isMetric ? "kg" : "lbs"}
                  testId="input-goal-weight"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                  <Activity size={16} strokeWidth={2.2} />
                </div>
                <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed flex-1">
                  Pick the option that best matches your average week.
                </p>
              </div>
              {ACTIVITY_KEYS.map((a) => (
                <OptionCard
                  key={a}
                  active={activity === a}
                  title={ACTIVITY_LABELS[a]}
                  description={ACTIVITY_DESCRIPTIONS[a]}
                  onClick={() => setActivity(a)}
                  testId={`option-activity-${a}`}
                />
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                  <Target size={16} strokeWidth={2.2} />
                </div>
                <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed flex-1">
                  What are you working toward right now?
                </p>
              </div>
              {GOAL_KEYS.map((g) => (
                <OptionCard
                  key={g}
                  active={goal === g}
                  title={GOAL_LABELS[g]}
                  description={GOAL_DESCRIPTIONS[g]}
                  onClick={() => setGoal(g)}
                  testId={`option-goal-${g}`}
                />
              ))}
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-4"
            >
              <div className="bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                    <Flame size={17} strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-semibold text-primary/80 tracking-widest uppercase leading-none mb-1">
                      Your Peppies Daily Targets
                    </p>
                    <p className="text-[13.5px] font-bold leading-tight">
                      {GOAL_LABELS[goal!]} · {ACTIVITY_LABELS[activity!]}
                    </p>
                  </div>
                </div>

                {!editMode ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-baseline justify-between bg-background/60 rounded-xl px-4 py-3">
                      <span className="text-[12.5px] font-semibold text-muted-foreground/80">
                        Calories
                      </span>
                      <span
                        className="text-[22px] font-bold tracking-tight text-primary"
                        data-testid="result-calories"
                      >
                        {result.targets.calories.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-background/60 rounded-xl px-3 py-2.5 flex flex-col items-center">
                        <p className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase">
                          Protein
                        </p>
                        <p
                          className="text-[16px] font-bold mt-0.5"
                          data-testid="result-protein"
                        >
                          {result.targets.protein}
                          <span className="text-[10.5px] font-semibold text-muted-foreground/70 ml-0.5">
                            g
                          </span>
                        </p>
                      </div>
                      <div className="bg-background/60 rounded-xl px-3 py-2.5 flex flex-col items-center">
                        <p className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase">
                          Carbs
                        </p>
                        <p
                          className="text-[16px] font-bold mt-0.5"
                          data-testid="result-carbs"
                        >
                          {result.targets.carbs}
                          <span className="text-[10.5px] font-semibold text-muted-foreground/70 ml-0.5">
                            g
                          </span>
                        </p>
                      </div>
                      <div className="bg-background/60 rounded-xl px-3 py-2.5 flex flex-col items-center">
                        <p className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase">
                          Fat
                        </p>
                        <p className="text-[16px] font-bold mt-0.5" data-testid="result-fat">
                          {result.targets.fat}
                          <span className="text-[10.5px] font-semibold text-muted-foreground/70 ml-0.5">
                            g
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase mb-1 block">
                        Calories
                      </label>
                      <NumberInput
                        value={editCal}
                        onChange={setEditCal}
                        placeholder="kcal"
                        suffix="kcal"
                        testId="input-edit-calories"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase mb-1 block">
                          Protein
                        </label>
                        <NumberInput
                          value={editProt}
                          onChange={setEditProt}
                          placeholder="g"
                          suffix="g"
                          testId="input-edit-protein"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase mb-1 block">
                          Carbs
                        </label>
                        <NumberInput
                          value={editCarbs}
                          onChange={setEditCarbs}
                          placeholder="g"
                          suffix="g"
                          testId="input-edit-carbs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase mb-1 block">
                          Fat
                        </label>
                        <NumberInput
                          value={editFat}
                          onChange={setEditFat}
                          placeholder="g"
                          suffix="g"
                          testId="input-edit-fat"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-background border border-border/50 rounded-2xl px-4 py-3 flex flex-col gap-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground/70">BMR (Mifflin-St Jeor)</span>
                  <span className="font-semibold">{result.bmr.toLocaleString()} kcal/day</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground/70">Maintenance (TDEE)</span>
                  <span className="font-semibold">{result.tdee.toLocaleString()} kcal/day</span>
                </div>
              </div>

              <p className="text-[12px] text-muted-foreground/70 leading-relaxed text-center">
                Based on your stats and goal, these are your recommended daily targets. You can edit
                these anytime in Settings.
              </p>

              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="text-[12px] font-semibold text-primary flex items-center justify-center gap-1.5 px-3 py-2"
                data-testid="button-toggle-edit-mode"
              >
                <Pencil size={11} strokeWidth={2.4} />
                {editMode ? "Use calculated targets" : "Edit manually"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-[12px] text-destructive">{error}</p>}

        <div className="flex gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBack}
            className="flex-shrink-0 bg-muted text-foreground font-semibold text-[14px] px-4 py-3.5 rounded-2xl flex items-center justify-center gap-1.5"
            data-testid="button-back"
          >
            <ChevronLeft size={15} strokeWidth={2.4} />
            {step === 1 ? "Cancel" : "Back"}
          </motion.button>

          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              disabled={
                (step === 1 && !canStep1) ||
                (step === 2 && !canStep2) ||
                (step === 3 && !canStep3)
              }
              className="flex-1 bg-primary text-primary-foreground font-semibold text-[15px] py-3.5 rounded-2xl disabled:opacity-40 tracking-wide flex items-center justify-center gap-1.5"
              data-testid="button-next"
            >
              Next
              <ChevronRight size={15} strokeWidth={2.4} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex-1 bg-primary text-primary-foreground font-semibold text-[15px] py-3.5 rounded-2xl tracking-wide flex items-center justify-center gap-2"
              data-testid="button-save-targets"
            >
              {saved ? (
                <>
                  <Check size={15} strokeWidth={2.5} />
                  Saved
                </>
              ) : (
                "Save as my daily targets"
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
