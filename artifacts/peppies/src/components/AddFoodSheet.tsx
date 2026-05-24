import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FoodEntry, MealType } from "@/hooks/useNutrition";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

type Draft = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  serving: string;
  meal: MealType;
};

interface AddFoodSheetProps {
  initial?: Partial<FoodEntry>;
  defaultMeal?: MealType;
  isEdit?: boolean;
  onClose: () => void;
  onSave: (data: Omit<FoodEntry, "id" | "date">) => void;
  onDelete?: () => void;
}

const NUM_RE = /^\d*(\.\d{0,2})?$/;

function toDraft(initial: Partial<FoodEntry> | undefined, defaultMeal: MealType): Draft {
  return {
    name: initial?.name ?? "",
    calories: initial?.calories != null ? String(initial.calories) : "",
    protein: initial?.protein != null ? String(initial.protein) : "",
    carbs: initial?.carbs != null ? String(initial.carbs) : "",
    fat: initial?.fat != null ? String(initial.fat) : "",
    serving: initial?.serving ?? "",
    meal: (initial?.meal as MealType | undefined) ?? defaultMeal,
  };
}

export function AddFoodSheet({
  initial,
  defaultMeal = "breakfast",
  isEdit,
  onClose,
  onSave,
  onDelete,
}: AddFoodSheetProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial, defaultMeal));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toDraft(initial, defaultMeal));
  }, [initial, defaultMeal]);

  const update = (key: keyof Draft, value: string) => {
    if (key === "name" || key === "serving" || key === "meal") {
      setDraft((d) => ({ ...d, [key]: value }));
      return;
    }
    if (value === "" || NUM_RE.test(value)) {
      setDraft((d) => ({ ...d, [key]: value }));
    }
  };

  const handleSave = () => {
    const name = draft.name.trim();
    if (!name) {
      setError("Please enter a food name");
      return;
    }
    const calories = parseFloat(draft.calories) || 0;
    const protein = parseFloat(draft.protein) || 0;
    const carbs = parseFloat(draft.carbs) || 0;
    const fat = parseFloat(draft.fat) || 0;
    if (calories <= 0 && protein <= 0 && carbs <= 0 && fat <= 0) {
      setError("Add at least one nutrition value");
      return;
    }
    onSave({
      name,
      calories,
      protein,
      carbs,
      fat,
      serving: draft.serving.trim(),
      meal: draft.meal,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 } as const}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card border border-border/60 rounded-3xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        data-testid="sheet-add-food"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">{isEdit ? "Edit Food" : "Add Food"}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            data-testid="button-close-add-food"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <Field label="Food name">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Chicken breast"
            className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="input-food-name"
            autoFocus={!initial?.name}
          />
        </Field>

        <Field label="Serving (optional)">
          <input
            type="text"
            value={draft.serving}
            onChange={(e) => update("serving", e.target.value)}
            placeholder="e.g. 1 cup, 100g, 2 scoops"
            className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="input-food-serving"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Calories">
            <input
              inputMode="decimal"
              value={draft.calories}
              onChange={(e) => update("calories", e.target.value)}
              placeholder="0"
              className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
              data-testid="input-food-calories"
            />
          </Field>
          <Field label="Protein (g)">
            <input
              inputMode="decimal"
              value={draft.protein}
              onChange={(e) => update("protein", e.target.value)}
              placeholder="0"
              className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
              data-testid="input-food-protein"
            />
          </Field>
          <Field label="Carbs (g)">
            <input
              inputMode="decimal"
              value={draft.carbs}
              onChange={(e) => update("carbs", e.target.value)}
              placeholder="0"
              className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
              data-testid="input-food-carbs"
            />
          </Field>
          <Field label="Fat (g)">
            <input
              inputMode="decimal"
              value={draft.fat}
              onChange={(e) => update("fat", e.target.value)}
              placeholder="0"
              className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
              data-testid="input-food-fat"
            />
          </Field>
        </div>

        <Field label="Meal">
          <div className="grid grid-cols-4 gap-1.5">
            {MEAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("meal", opt.value)}
                className={`py-2.5 rounded-xl text-[12px] font-semibold transition-all ${
                  draft.meal === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground/80"
                }`}
                data-testid={`meal-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        {error && (
          <p className="text-[12.5px] text-destructive text-center" data-testid="text-food-error">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            data-testid="button-save-food"
            className="w-full bg-primary text-primary-foreground font-semibold text-[14px] py-3.5 rounded-2xl shadow-lg shadow-primary/20"
          >
            {isEdit ? "Save changes" : "Add food"}
          </motion.button>
          <div className="flex gap-2">
            {isEdit && onDelete && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="flex-1 bg-destructive/15 text-destructive font-semibold text-[13px] py-3 rounded-2xl"
                data-testid="button-delete-food"
              >
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-muted text-muted-foreground font-semibold text-[13px] py-3 rounded-2xl"
              data-testid="button-cancel-food"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        {label}
      </label>
      {children}
    </div>
  );
}
