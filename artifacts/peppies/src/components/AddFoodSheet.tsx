import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScanBarcode, Minus, Plus, Loader2, Pencil, Search, Tag } from "lucide-react";
import { FoodEntry, MealType } from "@/hooks/useNutrition";
import { BarcodeScanner } from "./BarcodeScanner";
import { lookupBarcode, searchFoods, FoodLookupResult } from "@/utils/openFoodFacts";

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

interface Base {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface ActiveLookup {
  result: FoodLookupResult;
  basisIndex: number;
}

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

const round = (v: number) => Math.round(v * 10) / 10;

// Multiply the leading number in a serving label by `factor`.
// "1 fried slices" × 2 → "2 fried slices"
// "100 g" × 1.5 → "150 g"
// "1 cup (240ml)" × 2 → "2 cup (240ml)"  (only the leading number scales)
// If no leading number, prepends "×N " to make the multiplier visible.
function scaleServingLabel(label: string, factor: number): string {
  if (factor === 1) return label;
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  const m = trimmed.match(/^(\d+(?:\.\d+)?)(\s*)(.*)$/);
  if (!m) return `×${round(factor)} ${trimmed}`;
  const n = parseFloat(m[1]);
  const scaledN = round(n * factor);
  return `${scaledN}${m[2] || " "}${m[3]}`;
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
  const [showScanner, setShowScanner] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [base, setBase] = useState<Base | null>(null);
  const [activeLookup, setActiveLookup] = useState<ActiveLookup | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<FoodLookupResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searched, setSearched] = useState(false);
  const searchTimerRef = useRef<number | null>(null);
  const searchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setDraft(toDraft(initial, defaultMeal));
    // In edit mode, seed the scaling base from the existing entry so the
    // × Servings counter is available immediately. Bumping × scales both the
    // macros and the leading number in the serving label.
    if (isEdit && initial) {
      const c = initial.calories ?? 0;
      const p = initial.protein ?? 0;
      const cb = initial.carbs ?? 0;
      const f = initial.fat ?? 0;
      const s = initial.serving ?? "";
      setBase({ calories: c, protein: p, carbs: cb, fat: f, serving: s });
      setActiveLookup(null);
      setQuantity("1");
    }
  }, [initial, defaultMeal, isEdit]);

  // Cleanup any pending search on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
      if (searchControllerRef.current) searchControllerRef.current.abort();
    };
  }, []);

  const runSearch = (q: string) => {
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    if (searchControllerRef.current) searchControllerRef.current.abort();

    if (q.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      setSearched(false);
      return;
    }
    setSearching(true);
    searchTimerRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      searchControllerRef.current = controller;
      try {
        const results = await searchFoods(q.trim(), controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setSearched(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 280);
  };

  const update = (key: keyof Draft, value: string) => {
    if (key === "name") {
      setDraft((d) => ({ ...d, name: value }));
      // Trigger autocomplete only in add-new mode and before a lookup is applied
      if (!isEdit && !base) {
        setShowSuggestions(true);
        runSearch(value);
      }
      return;
    }
    if (key === "serving" || key === "meal") {
      setDraft((d) => ({ ...d, [key]: value }));
      return;
    }
    if (value === "" || NUM_RE.test(value)) {
      setDraft((d) => ({ ...d, [key]: value }));
    }
  };

  const pickSuggestion = (result: FoodLookupResult) => {
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    if (searchControllerRef.current) searchControllerRef.current.abort();
    setShowSuggestions(false);
    setSuggestions([]);
    setSearched(false);
    setSearching(false);
    applyLookup(result);
  };

  const handleDetected = async (barcode: string) => {
    setShowScanner(false);
    setLookupError(null);
    setError(null);
    setLookingUp(true);
    try {
      const result = await lookupBarcode(barcode);
      if (!result) {
        setLookupError(
          `No match for barcode ${barcode}. You can enter it by hand below.`,
        );
        return;
      }
      applyLookup(result);
    } catch (e) {
      setLookupError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLookingUp(false);
    }
  };

  const applyLookup = (result: FoodLookupResult, basisIndex = 0) => {
    const basis = result.bases[basisIndex] ?? result.bases[0];
    const newBase: Base = {
      calories: basis.calories,
      protein: basis.protein,
      carbs: basis.carbs,
      fat: basis.fat,
      serving: basis.serving,
    };
    setBase(newBase);
    setActiveLookup({ result, basisIndex });
    setQuantity("1");
    const name = result.brand ? `${result.brand} — ${result.name}` : result.name;
    setDraft((d) => ({
      ...d,
      name,
      serving: basis.serving,
      calories: String(basis.calories),
      protein: String(basis.protein),
      carbs: String(basis.carbs),
      fat: String(basis.fat),
    }));
  };

  const pickBasis = (index: number) => {
    if (!activeLookup) return;
    applyLookup(activeLookup.result, index);
  };

  const qtyNum = (() => {
    const n = parseFloat(quantity);
    return Number.isFinite(n) && n > 0 ? n : 1;
  })();

  const scaled = base
    ? {
        calories: round(base.calories * qtyNum),
        protein: round(base.protein * qtyNum),
        carbs: round(base.carbs * qtyNum),
        fat: round(base.fat * qtyNum),
      }
    : null;

  const adjustQty = (delta: number) => {
    const next = Math.max(0.25, round(qtyNum + delta));
    setQuantity(String(next));
  };

  const switchToManualEdit = () => {
    if (!scaled) return;
    setDraft((d) => ({
      ...d,
      calories: String(scaled.calories),
      protein: String(scaled.protein),
      carbs: String(scaled.carbs),
      fat: String(scaled.fat),
    }));
    setBase(null);
    setActiveLookup(null);
    setQuantity("1");
  };

  const handleSave = () => {
    const name = draft.name.trim();
    if (!name) {
      setError("Please enter a food name");
      return;
    }
    const calories = scaled ? scaled.calories : parseFloat(draft.calories) || 0;
    const protein = scaled ? scaled.protein : parseFloat(draft.protein) || 0;
    const carbs = scaled ? scaled.carbs : parseFloat(draft.carbs) || 0;
    const fat = scaled ? scaled.fat : parseFloat(draft.fat) || 0;
    const serving = (scaled && base ? scaleServingLabel(base.serving, qtyNum) : draft.serving).trim();
    onSave({
      name,
      calories,
      protein,
      carbs,
      fat,
      serving,
      meal: draft.meal,
    });
    onClose();
  };

  const saveLabel = isEdit ? "Save changes" : scaled ? "Add to Today" : "Add food";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 } as const}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[430px] bg-card border border-border/60 rounded-3xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
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

          {!isEdit && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setLookupError(null);
                setShowScanner(true);
              }}
              disabled={lookingUp}
              className="w-full bg-primary/15 border border-primary/30 text-primary font-semibold text-[14px] py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
              data-testid="button-scan-barcode"
            >
              {lookingUp ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Looking up…
                </>
              ) : (
                <>
                  <ScanBarcode size={17} strokeWidth={2.2} />
                  Scan Barcode
                </>
              )}
            </motion.button>
          )}

          <AnimatePresence>
            {lookupError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[12.5px] text-muted-foreground bg-muted/60 rounded-xl px-3.5 py-2.5 text-center"
                data-testid="text-lookup-error"
              >
                {lookupError}
              </motion.p>
            )}
          </AnimatePresence>

          <Field label="Food name">
            <div className="relative">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                onFocus={() => {
                  if (!isEdit && !base && suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay so a tap on a suggestion still registers
                  window.setTimeout(() => setShowSuggestions(false), 150);
                }}
                placeholder="e.g. Banana, chicken breast, rice…"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40 pr-9"
                data-testid="input-food-name"
                autoFocus={!initial?.name && !scaled}
              />
              {searching && (
                <Loader2
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground/70"
                />
              )}
              {!searching && !isEdit && !base && draft.name.trim().length >= 2 && (
                <Search
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                />
              )}

              <AnimatePresence>
                {showSuggestions && !isEdit && !base && draft.name.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-1.5 z-10 bg-card border border-border/60 rounded-2xl shadow-xl shadow-black/30 overflow-hidden max-h-[280px] overflow-y-auto"
                    data-testid="food-suggestions"
                  >
                    {suggestions.length === 0 && searched && !searching && (
                      <p className="text-[12.5px] text-muted-foreground/70 text-center px-4 py-4">
                        No matches. Keep typing or enter values by hand.
                      </p>
                    )}
                    {suggestions.length === 0 && searching && (
                      <p className="text-[12.5px] text-muted-foreground/70 text-center px-4 py-4">
                        Searching…
                      </p>
                    )}
                    {suggestions.map((s, i) => {
                      const title = s.brand ? `${s.brand} — ${s.name}` : s.name;
                      return (
                        <button
                          key={`${s.source}-${s.barcode ?? i}-${i}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickSuggestion(s)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-muted/60 active:bg-muted transition-colors flex items-start gap-2.5 border-b border-border/30 last:border-b-0"
                          data-testid={`food-suggestion-${i}`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Tag size={12} strokeWidth={2.4} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold leading-tight truncate">
                              {title}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">
                              {s.serving} · {s.calories} kcal · {s.protein}p {s.carbs}c {s.fat}f
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Field>

          <Field label="Serving">
            <input
              type="text"
              value={scaled && base ? scaleServingLabel(base.serving, qtyNum) : draft.serving}
              onChange={(e) => {
                if (scaled) switchToManualEdit();
                update("serving", e.target.value);
              }}
              placeholder="e.g. 1 cup, 100g, 2 scoops"
              className="bg-muted/60 rounded-xl px-3.5 py-3 w-full text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
              data-testid="input-food-serving"
            />
          </Field>

          {scaled ? (
            <>
              {activeLookup && activeLookup.result.bases.length > 1 && (
                <Field label="Basis">
                  <div className="flex flex-wrap gap-1.5">
                    {activeLookup.result.bases.map((b, i) => (
                      <button
                        key={`${b.label}-${i}`}
                        type="button"
                        onClick={() => pickBasis(i)}
                        className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                          i === activeLookup.basisIndex
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/60 text-muted-foreground/80"
                        }`}
                        data-testid={`basis-${i}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              <Field label={`Servings × ${qtyNum}`}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustQty(-0.5)}
                    className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center"
                    data-testid="button-qty-down"
                  >
                    <Minus size={16} strokeWidth={2.4} />
                  </button>
                  <input
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || NUM_RE.test(v)) setQuantity(v);
                    }}
                    className="flex-1 bg-muted/60 rounded-xl px-3.5 py-3 text-center text-[14px] font-semibold outline-none focus:ring-2 focus:ring-primary/40"
                    data-testid="input-qty"
                  />
                  <button
                    type="button"
                    onClick={() => adjustQty(0.5)}
                    className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center"
                    data-testid="button-qty-up"
                  >
                    <Plus size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <MacroPill label="Calories" value={scaled.calories} unit="" />
                <MacroPill label="Protein" value={scaled.protein} unit="g" />
                <MacroPill label="Carbs" value={scaled.carbs} unit="g" />
                <MacroPill label="Fat" value={scaled.fat} unit="g" />
              </div>

              <button
                onClick={switchToManualEdit}
                className="text-[12px] text-primary/80 font-semibold flex items-center justify-center gap-1.5 py-1"
                data-testid="button-edit-manually"
              >
                <Pencil size={11} strokeWidth={2.4} />
                Edit values manually
              </button>
            </>
          ) : (
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
          )}

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
              {saveLabel}
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

      <AnimatePresence>
        {showScanner && (
          <BarcodeScanner
            onDetected={handleDetected}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </>
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

function MacroPill({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="bg-muted/40 rounded-xl px-3.5 py-2.5 flex flex-col">
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        {label}
      </span>
      <span className="text-[16px] font-bold tabular-nums mt-0.5">
        {value}
        {unit && <span className="text-[11px] text-muted-foreground/60 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}
