import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Plus, Trash2, Star, Pencil, Apple, ChevronLeft, ChevronRight } from "lucide-react";
import { useNutrition, FoodEntry, FavoriteItem, MealType, NutritionGoals } from "@/hooks/useNutrition";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { MacroRing } from "@/components/MacroRing";
import { localDayKey, localDayKeyOffset } from "@/utils/localDate";

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
    entries,
    goals,
    favorites,
    addEntry,
    updateEntry,
    deleteEntry,
    setGoals,
    addCustomFavorite,
    removeFavorite,
  } = useNutrition();

  const [selectedDate, setSelectedDate] = useState<string>(() => localDayKey());
  const isToday = selectedDate === localDayKey();

  const [sheetState, setSheetState] = useState<
    | { kind: "closed" }
    | { kind: "add"; meal: MealType }
    | { kind: "edit"; entry: FoodEntry }
  >({ kind: "closed" });
  const [showGoals, setShowGoals] = useState(false);
  const [showAddFavorite, setShowAddFavorite] = useState(false);

  const dayEntries = useMemo(
    () => entries.filter((e) => localDayKey(e.date) === selectedDate),
    [entries, selectedDate],
  );

  const totals = useMemo(
    () =>
      dayEntries.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories,
          protein: acc.protein + e.protein,
          carbs: acc.carbs + e.carbs,
          fat: acc.fat + e.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [dayEntries],
  );

  const entriesByMeal = useMemo(() => {
    const grouped: Record<MealType, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    for (const e of dayEntries) grouped[e.meal].push(e);
    return grouped;
  }, [dayEntries]);

  const handleAddFavorite = (fav: FavoriteItem) => {
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
        {/* Date pager */}
        <motion.div variants={itemVariants}>
          <DatePager value={selectedDate} onChange={setSelectedDate} />
        </motion.div>

        {/* Swipeable summary carousel */}
        <motion.div variants={itemVariants}>
          <SummaryCarousel
            slides={[
              <RingsSlide
                key="rings"
                totals={totals}
                goals={goals}
                onEditGoals={() => setShowGoals(true)}
              />,
              <BarsSlide
                key="bars"
                totals={totals}
                goals={goals}
                onEditGoals={() => setShowGoals(true)}
              />,
            ]}
          />
        </motion.div>

        {/* Add food button — only when viewing today */}
        {isToday && (
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
        )}

        {/* Favorites — only when viewing today */}
        {isToday && (
          <motion.section variants={itemVariants} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Star size={13} strokeWidth={2.2} className="text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Quick add
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground/50 italic">
                swipe left to remove
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {favorites.map((fav) => (
                <FavoriteChip
                  key={fav.id}
                  fav={fav}
                  onAdd={() => handleAddFavorite(fav)}
                  onRemove={() => removeFavorite(fav)}
                />
              ))}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowAddFavorite(true)}
                className="bg-card/60 hover:bg-muted/60 border border-dashed border-border/60 rounded-2xl px-3.5 py-2 flex items-center gap-1.5"
                data-testid="button-add-favorite"
              >
                <Plus size={12} strokeWidth={2.4} className="text-primary" />
                <span className="text-[12.5px] font-semibold text-primary/90">
                  New favorite
                </span>
              </motion.button>
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
              {isToday && (
                <button
                  onClick={() => setSheetState({ kind: "add", meal: section.value })}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary/80"
                  data-testid={`button-add-${section.value}`}
                >
                  <Plus size={12} strokeWidth={2.4} /> Add
                </button>
              )}
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

        {dayEntries.length === 0 && (isToday ? favorites.length === 0 : true) && (
          <motion.div
            variants={itemVariants}
            className="bg-card/60 border border-border/40 rounded-2xl p-6 flex flex-col items-center text-center gap-2 mt-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Apple size={22} strokeWidth={1.6} />
            </div>
            <p className="text-[13px] font-semibold">
              {isToday ? "Start tracking your day" : "Nothing logged that day"}
            </p>
            <p className="text-[12px] text-muted-foreground/70 leading-relaxed max-w-[260px]">
              {isToday
                ? "Tap “Add Food” above to log your first meal. Foods you add often will show up here for one-tap re-add."
                : "No food entries were recorded for this date."}
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
        {showAddFavorite && (
          <CustomFavoriteSheet
            onClose={() => setShowAddFavorite(false)}
            onSave={(data) => {
              addCustomFavorite(data);
              setShowAddFavorite(false);
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

// --- Favorite chip with swipe-left to remove ---

function FavoriteChip({
  fav,
  onAdd,
  onRemove,
}: {
  fav: FavoriteItem;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    setDragging(false);
    if (info.offset.x < -50 || info.velocity.x < -400) {
      setRemoving(true);
      setTimeout(onRemove, 180);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 right-0 w-12 bg-destructive/20 rounded-2xl flex items-center justify-center pointer-events-none">
        <Trash2 size={12} className="text-destructive" strokeWidth={2.2} />
      </div>
      <motion.button
        drag="x"
        dragConstraints={{ left: -70, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        animate={removing ? { x: -220, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={() => {
          if (!dragging) onAdd();
        }}
        className="relative bg-muted/60 hover:bg-muted border border-border/40 rounded-2xl px-3.5 py-2 flex items-center gap-2 touch-pan-y cursor-pointer"
        data-testid={`favorite-${fav.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {fav.kind === "custom" ? (
          <Star
            size={11}
            className="text-primary fill-primary"
            strokeWidth={0}
          />
        ) : (
          <Plus size={12} strokeWidth={2.4} className="text-primary" />
        )}
        <span className="text-[12.5px] font-semibold">{fav.name}</span>
        <span className="text-[11px] text-muted-foreground/60">
          {Math.round(fav.calories)}
        </span>
      </motion.button>
    </div>
  );
}

// --- Custom favorite sheet ---

function CustomFavoriteSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: string;
  }) => void;
}) {
  const [draft, setDraft] = useState({
    name: "",
    serving: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof draft, value: string) => {
    setError(null);
    if (key === "name" || key === "serving") {
      setDraft((d) => ({ ...d, [key]: value }));
      return;
    }
    if (value === "" || /^\d{0,5}(\.\d{0,2})?$/.test(value)) {
      setDraft((d) => ({ ...d, [key]: value }));
    }
  };

  const handleSave = () => {
    const name = draft.name.trim();
    if (!name) {
      setError("Please enter a name");
      return;
    }
    onSave({
      name,
      serving: draft.serving.trim(),
      calories: parseFloat(draft.calories) || 0,
      protein: parseFloat(draft.protein) || 0,
      carbs: parseFloat(draft.carbs) || 0,
      fat: parseFloat(draft.fat) || 0,
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
        data-testid="sheet-custom-favorite"
      >
        <div className="flex items-center gap-2">
          <Star size={16} className="text-primary fill-primary" strokeWidth={0} />
          <h2 className="text-[17px] font-bold">New favorite</h2>
        </div>
        <p className="text-[12px] text-muted-foreground/70 leading-relaxed -mt-2">
          Save a food you eat often. It stays in Quick Add even if you haven't logged it recently.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            Name
          </label>
          <input
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Morning protein shake"
            className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="input-favorite-name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            Serving (optional)
          </label>
          <input
            value={draft.serving}
            onChange={(e) => update("serving", e.target.value)}
            placeholder="e.g. 1 scoop, 1 cup, 100g"
            className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="input-favorite-serving"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {k === "calories" ? "Calories" : `${k.charAt(0).toUpperCase() + k.slice(1)} (g)`}
              </label>
              <input
                inputMode="decimal"
                value={draft[k]}
                onChange={(e) => update(k, e.target.value)}
                placeholder="0"
                className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
                data-testid={`input-favorite-${k}`}
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="text-[12px] text-destructive font-semibold" data-testid="text-favorite-error">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-muted text-muted-foreground font-semibold text-[13px] py-3 rounded-2xl"
            data-testid="button-cancel-favorite"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground font-semibold text-[13px] py-3 rounded-2xl"
            data-testid="button-save-favorite"
          >
            Save favorite
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Date pager ---

function formatPagerDate(key: string): string {
  const today = localDayKey();
  const yesterday = localDayKeyOffset(1);
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function DatePager({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const today = localDayKey();
  const isToday = value === today;

  const shift = (days: number) => {
    const [y, m, d] = value.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const next = localDayKey(dt);
    if (next > today) return;
    onChange(next);
  };

  return (
    <div
      className="flex items-center justify-between bg-card border border-border/60 rounded-2xl px-2 py-2"
      data-testid="date-pager"
    >
      <button
        onClick={() => shift(-1)}
        className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center active:scale-95 transition-transform"
        data-testid="button-prev-day"
        aria-label="Previous day"
      >
        <ChevronLeft size={17} strokeWidth={2.4} />
      </button>
      <button
        onClick={() => onChange(today)}
        disabled={isToday}
        className="flex-1 text-center text-[14px] font-bold tabular-nums disabled:opacity-100 disabled:cursor-default"
        data-testid="text-pager-date"
      >
        {formatPagerDate(value)}
        {!isToday && (
          <span className="block text-[10px] font-semibold text-primary/80 tracking-wider uppercase mt-0.5">
            Tap for today
          </span>
        )}
      </button>
      <button
        onClick={() => shift(1)}
        disabled={isToday}
        className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
        data-testid="button-next-day"
        aria-label="Next day"
      >
        <ChevronRight size={17} strokeWidth={2.4} />
      </button>
    </div>
  );
}

// --- Summary carousel ---

function SummaryCarousel({ slides }: { slides: React.ReactNode[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
      setActive((prev) => (prev === i ? prev : i));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={scrollerRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: "none" }}
        data-testid="summary-carousel"
      >
        {slides.map((s, i) => (
          <div key={i} className="snap-center shrink-0 w-full">
            {s}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
              aria-label={`Slide ${i + 1}`}
              data-testid={`carousel-dot-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function RingsSlide({
  totals,
  goals,
  onEditGoals,
}: {
  totals: Totals;
  goals: NutritionGoals;
  onEditGoals: () => void;
}) {
  const calRatio = Math.min(totals.calories / Math.max(goals.calories, 1), 1.2);
  const calOver = totals.calories > goals.calories;
  const calRemaining = Math.max(goals.calories - totals.calories, 0);

  return (
    <div
      className="bg-card border border-border/60 rounded-3xl p-5 flex flex-col gap-4"
      data-testid="card-summary-rings"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Calories
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
          onClick={onEditGoals}
          className="text-[11px] font-semibold text-primary/80"
          data-testid="button-edit-goals"
        >
          Edit goals
        </button>
      </div>

      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(calRatio, 1) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className={`h-full rounded-full ${calOver ? "bg-destructive" : "bg-primary"}`}
        />
      </div>

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
    </div>
  );
}

type MacroStatus = "over" | "met" | "track";

function macroStatus(value: number, goal: number): MacroStatus {
  if (goal <= 0) return "track";
  const pct = value / goal;
  if (pct > 1.05) return "over";
  if (pct >= 0.95) return "met";
  return "track";
}

function BarsSlide({
  totals,
  goals,
  onEditGoals,
}: {
  totals: Totals;
  goals: NutritionGoals;
  onEditGoals: () => void;
}) {
  const rows: { key: string; label: string; value: number; goal: number; unit: string }[] = [
    { key: "calories", label: "Calories", value: totals.calories, goal: goals.calories, unit: "kcal" },
    { key: "protein", label: "Protein", value: totals.protein, goal: goals.protein, unit: "g" },
    { key: "carbs", label: "Carbs", value: totals.carbs, goal: goals.carbs, unit: "g" },
    { key: "fat", label: "Fat", value: totals.fat, goal: goals.fat, unit: "g" },
  ];

  return (
    <div
      className="bg-card border border-border/60 rounded-3xl p-5 flex flex-col gap-4"
      data-testid="card-summary-bars"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Targets
        </p>
        <button
          onClick={onEditGoals}
          className="text-[11px] font-semibold text-primary/80"
          data-testid="button-edit-goals-bars"
        >
          Edit goals
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {rows.map((r) => {
          const pct = r.goal > 0 ? r.value / r.goal : 0;
          const status = macroStatus(r.value, r.goal);
          const over = Math.max(r.value - r.goal, 0);
          const remaining = Math.max(r.goal - r.value, 0);

          const barClass =
            status === "over"
              ? "bg-destructive"
              : status === "met"
                ? "bg-emerald-500"
                : "bg-primary";
          const pctClass =
            status === "over"
              ? "text-destructive"
              : status === "met"
                ? "text-emerald-500"
                : "text-muted-foreground/80";
          const subtitle =
            status === "over"
              ? `${Math.round(over)} ${r.unit} over goal`
              : status === "met"
                ? "Goal met"
                : `${Math.round(remaining)} ${r.unit} to go`;

          const valDisplay =
            r.key === "calories"
              ? Math.round(r.value).toLocaleString()
              : (Math.round(r.value * 10) / 10).toString();
          const goalDisplay =
            r.key === "calories" ? r.goal.toLocaleString() : r.goal.toString();

          return (
            <div key={r.key} data-testid={`macro-bar-${r.key}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12.5px] font-semibold leading-tight">
                  {r.label}
                  <span className="text-muted-foreground/60 font-normal">
                    {" "}— {valDisplay} / {goalDisplay} {r.unit}
                  </span>
                </p>
                <span className={`text-[12.5px] font-bold tabular-nums ${pctClass}`}>
                  {Math.round(pct * 100)}%
                </span>
              </div>
              <div className="h-2 mt-1.5 rounded-full bg-muted/60 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 1) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 22 }}
                  className={`h-full rounded-full ${barClass}`}
                />
              </div>
              <p className={`text-[10.5px] mt-1 ${pctClass}`}>{subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 pt-1 text-[10px] font-semibold tracking-wider uppercase">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground/70">Left</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground/70">Met</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground/70">Over</span>
        </span>
      </div>
    </div>
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
