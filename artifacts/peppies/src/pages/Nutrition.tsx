import { useState, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Plus, Trash2, Star, Pencil, Apple } from "lucide-react";
import { useNutrition, FoodEntry, MealType, NutritionGoals } from "@/hooks/useNutrition";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { MacroRing } from "@/components/MacroRing";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
} as const;

const MEAL_SECTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

const MACRO_COLORS = {
  protein: "rgb(239 68 68)",
  carbs: "rgb(245 158 11)",
  fat: "rgb(139 92 246)",
};

export function Nutrition() {
  const {
    todayEntries,
    totals,
    goals,
    favorites,
    addEntry,
    updateEntry,
    deleteEntry,
    setGoals,
  } = useNutrition();

  const [sheetState, setSheetState] = useState<
    | { kind: "closed" }
    | { kind: "add"; meal: MealType }
    | { kind: "edit"; entry: FoodEntry }
  >({ kind: "closed" });
  const [showGoals, setShowGoals] = useState(false);

  const calRatio = Math.min(totals.calories / Math.max(goals.calories, 1), 1.2);
  const calOver = totals.calories > goals.calories;
  const calRemaining = Math.max(goals.calories - totals.calories, 0);

  const entriesByMeal = useMemo(() => {
    const grouped: Record<MealType, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    for (const e of todayEntries) grouped[e.meal].push(e);
    return grouped;
  }, [todayEntries]);

  const handleAddFavorite = (fav: FoodEntry) => {
    addEntry({
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      serving: fav.serving,
      meal: currentMealByTime(),
    });
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-5 pt-6 pb-6 flex flex-col gap-5"
      >
        {/* Daily summary */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border/60 rounded-3xl p-5 flex flex-col gap-4"
          data-testid="card-daily-summary"
        >
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Today
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span
                  className="text-[32px] font-bold tracking-[-0.04em] leading-none"
                  data-testid="text-calories-eaten"
                >
                  {Math.round(totals.calories).toLocaleString()}
                </span>
                <span className="text-[14px] text-muted-foreground/70 font-medium">
                  / {goals.calories.toLocaleString()} cal
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground/70 mt-1">
                {calOver
                  ? `${Math.round(totals.calories - goals.calories).toLocaleString()} over goal`
                  : `${Math.round(calRemaining).toLocaleString()} remaining`}
              </p>
            </div>
            <button
              onClick={() => setShowGoals(true)}
              className="text-[11px] font-semibold text-primary/80"
              data-testid="button-edit-goals"
            >
              Edit goals
            </button>
          </div>

          {/* Calorie progress bar */}
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(calRatio, 1) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              className={`h-full rounded-full ${calOver ? "bg-destructive" : "bg-primary"}`}
            />
          </div>

          {/* Macro rings */}
          <div className="flex items-center justify-around pt-1">
            <MacroRing
              value={totals.protein}
              goal={goals.protein}
              label="Protein"
              color={MACRO_COLORS.protein}
            />
            <MacroRing
              value={totals.carbs}
              goal={goals.carbs}
              label="Carbs"
              color={MACRO_COLORS.carbs}
            />
            <MacroRing
              value={totals.fat}
              goal={goals.fat}
              label="Fat"
              color={MACRO_COLORS.fat}
            />
          </div>
        </motion.div>

        {/* Add food button */}
        <motion.button
          variants={itemVariants}
          whileTap={{ scale: 0.97 }}
          onClick={() => setSheetState({ kind: "add", meal: currentMealByTime() })}
          className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
          data-testid="button-add-food"
        >
          <Plus size={18} strokeWidth={2.4} />
          Add Food
        </motion.button>

        {/* Favorites */}
        {favorites.length > 0 && (
          <motion.section variants={itemVariants} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 px-1">
              <Star size={13} strokeWidth={2.2} className="text-primary" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Quick add
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {favorites.map((fav) => (
                <motion.button
                  key={fav.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleAddFavorite(fav)}
                  className="bg-muted/60 hover:bg-muted border border-border/40 rounded-2xl px-3.5 py-2 flex items-center gap-2"
                  data-testid={`favorite-${fav.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Plus size={12} strokeWidth={2.4} className="text-primary" />
                  <span className="text-[12.5px] font-semibold">{fav.name}</span>
                  <span className="text-[11px] text-muted-foreground/60">
                    {Math.round(fav.calories)}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Meal sections */}
        {MEAL_SECTIONS.map((section) => (
          <motion.section
            key={section.value}
            variants={itemVariants}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[13px] font-bold tracking-tight">{section.label}</h3>
              <button
                onClick={() => setSheetState({ kind: "add", meal: section.value })}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary/80"
                data-testid={`button-add-${section.value}`}
              >
                <Plus size={12} strokeWidth={2.4} /> Add
              </button>
            </div>
            {entriesByMeal[section.value].length === 0 ? (
              <div className="bg-card/60 border border-dashed border-border/50 rounded-2xl px-4 py-4 text-center">
                <p className="text-[12px] text-muted-foreground/50">No entries yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {entriesByMeal[section.value].map((entry) => (
                  <FoodRow
                    key={entry.id}
                    entry={entry}
                    onEdit={() => setSheetState({ kind: "edit", entry })}
                    onDelete={() => deleteEntry(entry.id)}
                  />
                ))}
              </div>
            )}
          </motion.section>
        ))}

        {todayEntries.length === 0 && favorites.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-card/60 border border-border/40 rounded-2xl p-6 flex flex-col items-center text-center gap-2 mt-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Apple size={22} strokeWidth={1.6} />
            </div>
            <p className="text-[13px] font-semibold">Start tracking your day</p>
            <p className="text-[12px] text-muted-foreground/70 leading-relaxed max-w-[260px]">
              Tap “Add Food” above to log your first meal. Foods you add often will show up here for one-tap re-add.
            </p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {sheetState.kind === "add" && (
          <AddFoodSheet
            defaultMeal={sheetState.meal}
            onClose={() => setSheetState({ kind: "closed" })}
            onSave={(data) => addEntry(data)}
          />
        )}
        {sheetState.kind === "edit" && (
          <AddFoodSheet
            isEdit
            initial={sheetState.entry}
            onClose={() => setSheetState({ kind: "closed" })}
            onSave={(data) => updateEntry(sheetState.entry.id, data)}
            onDelete={() => deleteEntry(sheetState.entry.id)}
          />
        )}
        {showGoals && (
          <GoalsSheet
            goals={goals}
            onClose={() => setShowGoals(false)}
            onSave={(g) => {
              setGoals(g);
              setShowGoals(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function FoodRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: FoodEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    setDragging(false);
    if (info.offset.x < -80 || info.velocity.x < -400) {
      setRemoving(true);
      setTimeout(onDelete, 180);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 right-0 w-20 bg-destructive/15 rounded-2xl flex items-center justify-end pr-4 pointer-events-none">
        <Trash2 size={16} className="text-destructive" strokeWidth={2.2} />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        animate={removing ? { x: -400, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={() => {
          if (!dragging) onEdit();
        }}
        className="relative bg-card border border-border/50 rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer touch-pan-y"
        data-testid={`food-row-${entry.id}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13.5px] font-semibold truncate">{entry.name}</p>
            {entry.serving && (
              <span className="text-[11px] text-muted-foreground/60 truncate">
                · {entry.serving}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-muted-foreground/70">
              P {Math.round(entry.protein)}g
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              C {Math.round(entry.carbs)}g
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              F {Math.round(entry.fat)}g
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[14px] font-bold tabular-nums">
            {Math.round(entry.calories)}
          </span>
          <span className="text-[9.5px] text-muted-foreground/60 uppercase tracking-wide">
            cal
          </span>
        </div>
        <Pencil size={13} className="text-muted-foreground/40 flex-shrink-0" strokeWidth={2} />
      </motion.div>
    </div>
  );
}

function GoalsSheet({
  goals,
  onClose,
  onSave,
}: {
  goals: NutritionGoals;
  onClose: () => void;
  onSave: (g: NutritionGoals) => void;
}) {
  const [draft, setDraft] = useState({
    calories: String(goals.calories),
    protein: String(goals.protein),
    carbs: String(goals.carbs),
    fat: String(goals.fat),
  });

  const update = (key: keyof typeof draft, value: string) => {
    if (value === "" || /^\d{0,5}$/.test(value)) {
      setDraft((d) => ({ ...d, [key]: value }));
    }
  };

  const handleSave = () => {
    onSave({
      calories: parseInt(draft.calories) || 0,
      protein: parseInt(draft.protein) || 0,
      carbs: parseInt(draft.carbs) || 0,
      fat: parseInt(draft.fat) || 0,
    });
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
        className="w-full max-w-[430px] bg-card border border-border/60 rounded-3xl p-5 flex flex-col gap-4"
        data-testid="sheet-goals"
      >
        <h2 className="text-[17px] font-bold">Daily goals</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {k === "calories" ? "Calories" : `${k.charAt(0).toUpperCase() + k.slice(1)} (g)`}
              </label>
              <input
                inputMode="numeric"
                value={draft[k]}
                onChange={(e) => update(k, e.target.value)}
                className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
                data-testid={`input-goal-${k}`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-muted text-muted-foreground font-semibold text-[13px] py-3 rounded-2xl"
            data-testid="button-cancel-goals"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground font-semibold text-[13px] py-3 rounded-2xl"
            data-testid="button-save-goals"
          >
            Save
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function currentMealByTime(): MealType {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snacks";
  if (h < 21) return "dinner";
  return "snacks";
}
