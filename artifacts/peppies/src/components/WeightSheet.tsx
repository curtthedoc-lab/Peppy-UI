import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useWeight, WeightEntry } from "@/hooks/useWeight";
import { usePreferences } from "@/hooks/usePreferences";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function WeightHistoryRow({ entry, onDelete }: { entry: WeightEntry; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex items-center justify-between py-2.5 border-t border-border/40 first:border-t-0">
      <div>
        <span className="text-[15px] font-bold">{entry.value}</span>
        <span className="text-[12px] text-muted-foreground ml-1">{entry.unit}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground/60">{formatDate(entry.date)}</span>
        <button
          onClick={() => {
            if (confirm) onDelete();
            else { setConfirm(true); setTimeout(() => setConfirm(false), 2500); }
          }}
          className={`p-1.5 rounded-xl transition-colors ${confirm ? "bg-destructive/15 text-destructive" : "text-muted-foreground/30 hover:text-muted-foreground/60"}`}
        >
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export function WeightSheet({ onClose }: { onClose: () => void }) {
  const { entries, latest, trend, addEntry, deleteEntry } = useWeight();
  const { prefs } = usePreferences();
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">(latest?.unit ?? prefs.weightUnit);
  const [error, setError] = useState("");

  const handleLog = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0 || num > 999) {
      setError("Enter a valid weight");
      return;
    }
    addEntry(num, unit);
    setValue("");
    setError("");
  };

  const recent = entries.slice(0, 10);

  return (
    // Backdrop — closes on tap outside
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 backdrop-blur-sm"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px) + 24px, 40px)" }}
      onClick={onClose}
    >
      {/* Sheet — centered in upper portion so keyboard doesn't obscure it */}
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -16, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full mx-4 max-w-[400px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto"
        style={{ maxWidth: 400 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Weight Tracking</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Current weight display */}
        {latest && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-0.5">Current</p>
              <div className="flex items-end gap-1.5">
                <span className="text-[32px] font-bold text-primary leading-none tracking-[-0.03em]">{latest.value}</span>
                <span className="text-[15px] font-medium text-muted-foreground mb-0.5">{latest.unit}</span>
              </div>
            </div>
            {trend && (
              <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${trend === "up" ? "text-red-400" : trend === "down" ? "text-emerald-400" : "text-muted-foreground"}`}>
                {trend === "up" ? <TrendingUp size={18} strokeWidth={2} /> : trend === "down" ? <TrendingDown size={18} strokeWidth={2} /> : <Minus size={18} strokeWidth={2} />}
                {trend === "up" ? "Up" : trend === "down" ? "Down" : "No change"}
              </div>
            )}
          </div>
        )}

        {/* Log new weight */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Log Weight</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLog()}
                // scrolls the input into view when keyboard opens on iOS
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 120)}
                placeholder={unit === "kg" ? "e.g. 82.5" : "e.g. 180"}
                inputMode="decimal"
                className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3.5 text-[15px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                data-testid="weight-input"
              />
            </div>
            <div className="flex bg-muted rounded-2xl p-1 gap-1">
              {(["kg", "lbs"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${unit === u ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLog}
            disabled={!value}
            data-testid="weight-log-button"
            className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl disabled:opacity-40 tracking-wide"
          >
            Log Weight
          </motion.button>
        </div>

        {/* History */}
        {recent.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3">History</p>
            <div className="bg-background/50 rounded-2xl px-3 py-1">
              {recent.map((e) => (
                <WeightHistoryRow key={e.id} entry={e} onDelete={() => deleteEntry(e.id)} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
