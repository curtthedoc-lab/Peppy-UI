export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "athlete";

export type FitnessGoal = "lose_fat" | "maintain" | "build_muscle" | "recomp";

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
  athlete: "Athlete / Extremely Active",
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Little or no exercise, desk job",
  lightly_active: "Light exercise 1–3 days/week",
  moderately_active: "Moderate exercise 3–5 days/week",
  very_active: "Hard exercise 6–7 days/week",
  athlete: "Twice-daily training or physical job",
};

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_fat: "Lose Fat",
  maintain: "Maintain Weight",
  build_muscle: "Build Muscle",
  recomp: "Body Recomposition",
};

export const GOAL_DESCRIPTIONS: Record<FitnessGoal, string> = {
  lose_fat: "Moderate calorie deficit — typically 300–500 below maintenance",
  maintain: "Eat at maintenance to hold your current weight",
  build_muscle: "Modest surplus — typically 150–300 above maintenance",
  recomp: "Lose fat while preserving or building muscle — slight deficit",
};

export const LBS_PER_KG = 2.20462;
export const KG_PER_LB = 1 / LBS_PER_KG;
export const CM_PER_IN = 2.54;

export function bmrMifflin(opts: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const base = 10 * opts.weightKg + 6.25 * opts.heightCm - 5 * opts.age;
  return opts.sex === "male" ? base + 5 : base - 161;
}

export function tdeeFromBmr(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activity];
}

export function goalAdjustedCalories(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case "lose_fat":
      return tdee - 400;
    case "maintain":
      return tdee;
    case "build_muscle":
      return tdee + 225;
    case "recomp":
      return tdee - 200;
  }
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function computeMacros(opts: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: FitnessGoal;
}): {
  bmr: number;
  tdee: number;
  targets: MacroTargets;
} {
  const bmr = bmrMifflin(opts);
  const tdee = tdeeFromBmr(bmr, opts.activity);
  const calories = Math.round(goalAdjustedCalories(tdee, opts.goal));
  const weightLbs = opts.weightKg * LBS_PER_KG;
  const protein = Math.round(0.9 * weightLbs);
  const fat = Math.round(0.35 * weightLbs);
  const remainingCal = Math.max(0, calories - (protein * 4 + fat * 9));
  const carbs = Math.round(remainingCal / 4);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targets: { calories, protein, carbs, fat },
  };
}

export function kgToLb(kg: number): number {
  return kg * LBS_PER_KG;
}
export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}
export function inToCm(inches: number): number {
  return inches * CM_PER_IN;
}
export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return inToCm(feet * 12 + inches);
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalIn = cmToIn(cm);
  const feet = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - feet * 12);
  if (inches === 12) return { feet: feet + 1, inches: 0 };
  return { feet, inches };
}
