import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckCircle2, Trash2, Clock } from "lucide-react";
import { useCycles, Cycle, daysSince } from "@/hooks/useCycles";

function CycleForm({ onSubmit, onCancel }: {
  onSubmit: (data: { name: string; durationDays?: number; notes?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      durationDays: duration ? parseInt(duration) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[16px] font-bold">New Protocol</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
          Protocol Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. BPC-157 healing cycle"
          className="bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
          autoFocus
          data-testid="cycle-name-input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
          Duration (optional)
        </label>
        <div className="relative">
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 42"
            inputMode="numeric"
            className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors pr-12"
            data-testid="cycle-duration-input"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/50 font-medium">
            days
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Peptides, goals, dosage plan..."
          rows={2}
          className="bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors resize-none"
          data-testid="cycle-notes-input"
        />
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!name.trim()}
          data-testid="cycle-start-button"
          className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl disabled:opacity-40 tracking-wide"
        >
          Start Protocol
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="w-full bg-muted text-foreground font-semibold text-[15px] py-3.5 rounded-2xl"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
}

function ActiveCycleCard({ cycle, onEnd }: { cycle: Cycle; onEnd: () => void }) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const daysIn = daysSince(cycle.startDate);
  const progress = cycle.durationDays
    ? Math.min(daysIn / cycle.durationDays, 1)
    : null;
  const daysLeft = cycle.durationDays ? cycle.durationDays - daysIn : null;

  return (
    <div
      className="bg-primary/8 border border-primary/20 rounded-2xl p-4 flex flex-col gap-3"
      data-testid={`active-cycle-${cycle.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest">Active</span>
          </div>
          <p className="text-[15px] font-bold leading-tight truncate">{cycle.name}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[22px] font-bold text-primary leading-none">{daysIn}</p>
          <p className="text-[10px] text-muted-foreground/60 font-medium">{daysIn === 1 ? "day in" : "days in"}</p>
        </div>
      </div>

      {progress !== null && (
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground/60 mb-1.5">
            <span>Day {daysIn}</span>
            <span>{daysLeft !== null && daysLeft > 0 ? `${daysLeft}d left` : cycle.durationDays ? "Complete" : ""}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      )}

      {cycle.notes && (
        <p className="text-[12px] text-muted-foreground/60 italic leading-relaxed">"{cycle.notes}"</p>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          if (confirmEnd) { onEnd(); setConfirmEnd(false); }
          else { setConfirmEnd(true); setTimeout(() => setConfirmEnd(false), 2500); }
        }}
        className={`w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold py-2.5 rounded-xl transition-colors ${
          confirmEnd ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
        }`}
        data-testid={`end-cycle-${cycle.id}`}
      >
        <CheckCircle2 size={14} strokeWidth={2} />
        {confirmEnd ? "Confirm End" : "End Protocol"}
      </motion.button>
    </div>
  );
}

function PastCycleRow({ cycle, onDelete }: { cycle: Cycle; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const days = daysSince(cycle.startDate);
  const endedDays = cycle.endedAt ? daysSince(cycle.startDate) - daysSince(cycle.endedAt) : days;

  return (
    <div className="flex items-center gap-3 py-2.5 border-t border-border/40 first:border-t-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate">{cycle.name}</p>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
          {endedDays} {endedDays === 1 ? "day" : "days"}
          {cycle.durationDays ? ` of ${cycle.durationDays}` : ""}
        </p>
      </div>
      <button
        onClick={() => {
          if (confirmDelete) { onDelete(); } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 2500);
          }
        }}
        className={`p-1.5 rounded-xl transition-colors ${confirmDelete ? "bg-destructive/15 text-destructive" : "text-muted-foreground/30 hover:text-muted-foreground/60"}`}
      >
        <Trash2 size={13} strokeWidth={2} />
      </button>
    </div>
  );
}

export function CycleSheet({ onClose }: { onClose: () => void }) {
  const { activeCycles, pastCycles, startCycle, endCycle, deleteCycle } = useCycles();
  const [showForm, setShowForm] = useState(activeCycles.length === 0);

  const handleStart = (data: { name: string; durationDays?: number; notes?: string }) => {
    startCycle({ ...data, startDate: new Date().toISOString() });
    setShowForm(false);
  };

  const activeLabel =
    activeCycles.length === 0
      ? "Protocols"
      : activeCycles.length === 1
      ? "1 active protocol"
      : `${activeCycles.length} active protocols`;

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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold leading-tight">Protocols</h2>
            {activeCycles.length > 0 && !showForm && (
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{activeLabel}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {showForm ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <CycleForm
                onSubmit={handleStart}
                onCancel={() => {
                  if (activeCycles.length > 0) setShowForm(false);
                  else onClose();
                }}
              />
            </motion.div>
          ) : (
            <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">

              {/* All active cycles */}
              {activeCycles.map((c) => (
                <ActiveCycleCard
                  key={c.id}
                  cycle={c}
                  onEnd={() => endCycle(c.id)}
                />
              ))}

              {/* Start another / start first */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowForm(true)}
                data-testid="start-cycle-button"
                className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] rounded-2xl tracking-wide transition-colors ${
                  activeCycles.length === 0
                    ? "bg-primary text-primary-foreground py-4 text-[15px]"
                    : "bg-primary/15 border border-primary/30 text-primary py-3"
                }`}
              >
                <Plus size={activeCycles.length === 0 ? 18 : 15} strokeWidth={2.4} />
                {activeCycles.length === 0 ? "Start a Protocol" : "Start another protocol"}
              </motion.button>

              {/* Past cycles */}
              {pastCycles.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground/50 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                    <Clock size={11} strokeWidth={2} />
                    Past Protocols
                  </p>
                  <div className="bg-background/50 rounded-2xl px-3 py-1">
                    {pastCycles.map((c) => (
                      <PastCycleRow key={c.id} cycle={c} onDelete={() => deleteCycle(c.id)} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
