import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Moon } from "lucide-react";
import { localDayKey, localDayKeyOffset } from "@/utils/localDate";
import {
  useSleep,
  computeSleepHours,
  QUALITY_LABELS,
  SleepEntry,
} from "@/hooks/useSleep";

function formatForDate(forDate: string): string {
  // forDate is YYYY-MM-DD
  const [y, m, d] = forDate.split("-").map((s) => parseInt(s, 10));
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Last night";
  if (diffDays === 1) return "2 nights ago";
  if (diffDays < 7) return `${diffDays + 1} nights ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHours(h: number): string {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  if (mins === 0) return `${whole}h`;
  return `${whole}h ${mins}m`;
}

function todayISODate(): string {
  return localDayKey();
}

function SleepHistoryRow({
  entry,
  onDelete,
}: {
  entry: SleepEntry;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex items-center justify-between py-2.5 border-t border-border/40 first:border-t-0">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold tabular-nums">
            {formatHours(entry.hours)}
          </span>
          <span className="text-[11px] text-muted-foreground/70">
            · {QUALITY_LABELS[entry.quality]}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground/60 mt-0.5">
          {formatForDate(entry.forDate)}
          {entry.bedtime && entry.wakeTime
            ? ` · ${entry.bedtime} → ${entry.wakeTime}`
            : ""}
        </span>
      </div>
      <button
        onClick={() => {
          if (confirm) onDelete();
          else {
            setConfirm(true);
            setTimeout(() => setConfirm(false), 2500);
          }
        }}
        className={`p-1.5 rounded-xl transition-colors ${
          confirm
            ? "bg-destructive/15 text-destructive"
            : "text-muted-foreground/30 hover:text-muted-foreground/60"
        }`}
        data-testid={`button-delete-sleep-${entry.id}`}
      >
        <Trash2 size={13} strokeWidth={2} />
      </button>
    </div>
  );
}

export function SleepSheet({ onClose }: { onClose: () => void }) {
  const { entries, latest, weekAverage, addEntry, deleteEntry } = useSleep();
  const [forDate, setForDate] = useState(todayISODate());
  const [hoursInput, setHoursInput] = useState("");
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const computedHours = useMemo(() => {
    if (bedtime && wakeTime) return computeSleepHours(bedtime, wakeTime);
    return null;
  }, [bedtime, wakeTime]);

  const effectiveHours = computedHours ?? parseFloat(hoursInput);

  const handleLog = () => {
    if (isNaN(effectiveHours) || effectiveHours <= 0 || effectiveHours > 24) {
      setError("Enter how many hours you slept");
      return;
    }
    addEntry(effectiveHours, quality, {
      forDate,
      bedtime: bedtime || undefined,
      wakeTime: wakeTime || undefined,
      notes: notes.trim() || undefined,
    });
    setHoursInput("");
    setBedtime("");
    setWakeTime("");
    setNotes("");
    setError("");
    setShowAdvanced(false);
  };

  const recent = entries.slice(0, 10);

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
        className="w-full mx-4 max-w-[400px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        style={{ maxWidth: 400 }}
        data-testid="sheet-sleep"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Sleep Log</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            data-testid="button-close-sleep"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Latest display */}
        {latest && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-0.5">
                Last logged
              </p>
              <div className="flex items-end gap-1.5">
                <span className="text-[32px] font-bold text-primary leading-none tracking-[-0.03em] tabular-nums">
                  {formatHours(latest.hours)}
                </span>
                <span className="text-[13px] font-medium text-muted-foreground mb-1">
                  · {QUALITY_LABELS[latest.quality]}
                </span>
              </div>
            </div>
            {weekAverage != null && (
              <div className="text-right">
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-0.5">
                  7-day avg
                </p>
                <p className="text-[15px] font-bold tabular-nums text-foreground/90">
                  {formatHours(weekAverage)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Log new sleep */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Log Sleep
          </p>

          {/* For-date selector */}
          <div className="flex bg-muted rounded-2xl p-1 gap-1">
            {(() => {
              const today = todayISODate();
              const yesterday = localDayKeyOffset(1);
              return (
                <>
                  <button
                    onClick={() => setForDate(today)}
                    className={`flex-1 py-2 rounded-xl text-[12.5px] font-semibold transition-all ${
                      forDate === today
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Last night
                  </button>
                  <button
                    onClick={() => setForDate(yesterday)}
                    className={`flex-1 py-2 rounded-xl text-[12.5px] font-semibold transition-all ${
                      forDate === yesterday
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Night before
                  </button>
                </>
              );
            })()}
          </div>

          {/* Hours input */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
              Hours slept
            </label>
            <input
              value={computedHours != null ? formatHours(computedHours) : hoursInput}
              onChange={(e) => {
                setHoursInput(e.target.value);
                setError("");
              }}
              disabled={computedHours != null}
              onKeyDown={(e) => e.key === "Enter" && handleLog()}
              onFocus={(e) =>
                setTimeout(
                  () => e.target.scrollIntoView({ behavior: "smooth", block: "center" }),
                  120,
                )
              }
              placeholder="e.g. 7.5"
              inputMode="decimal"
              className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3.5 text-[15px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors disabled:opacity-60"
              data-testid="input-sleep-hours"
            />
            {computedHours != null && (
              <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                Calculated from bedtime &amp; wake time below
              </p>
            )}
          </div>

          {/* Quality selector */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
              Quality
            </label>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4, 5] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2.5 rounded-xl text-[11.5px] font-semibold transition-all border ${
                    quality === q
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-muted/40 border-border/40 text-muted-foreground/70"
                  }`}
                  data-testid={`button-quality-${q}`}
                >
                  {QUALITY_LABELS[q]}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced: bedtime / wake time / notes */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[12px] text-primary/80 font-semibold text-left"
          >
            {showAdvanced ? "− Hide details" : "+ Add bedtime, wake time, notes"}
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
                    Bedtime
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-2xl px-3 py-3 text-[14px] outline-none focus:border-primary/50"
                    data-testid="input-bedtime"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
                    Wake time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-2xl px-3 py-3 text-[14px] outline-none focus:border-primary/50"
                    data-testid="input-waketime"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. woke up at 3am, vivid dreams"
                  className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors resize-none"
                  data-testid="input-sleep-notes"
                />
              </div>
            </div>
          )}

          {error && <p className="text-[12px] text-destructive">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLog}
            disabled={!hoursInput && computedHours == null}
            className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl disabled:opacity-40 tracking-wide flex items-center justify-center gap-2"
            data-testid="button-log-sleep"
          >
            <Moon size={15} strokeWidth={2.4} />
            Log Sleep
          </motion.button>
        </div>

        {/* History */}
        {recent.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3">
              Recent nights
            </p>
            <div className="bg-background/50 rounded-2xl px-3 py-1">
              {recent.map((e) => (
                <SleepHistoryRow
                  key={e.id}
                  entry={e}
                  onDelete={() => deleteEntry(e.id)}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
