import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FlaskConical, Download, CheckCheck, ChevronDown, NotebookPen } from "lucide-react";
import { useInjections, Injection } from "@/hooks/useInjections";
import { exportInjectionsAsCsv } from "@/utils/exportCsv";
import { peptideInitials } from "@/utils/peptideName";
import { useState, useRef, useEffect } from "react";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function NotesEditor({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (notes: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const len = textareaRef.current?.value.length ?? 0;
    textareaRef.current?.setSelectionRange(len, len);
  }, []);

  const isDirty = value.trim() !== initialValue.trim();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5">
        <div className="w-full h-px bg-border/40" />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a note — how you felt, reaction, timing..."
          rows={3}
          className="w-full bg-background/60 border border-border/50 rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed placeholder:text-muted-foreground/40 text-foreground resize-none outline-none focus:border-primary/50 transition-colors"
          data-testid="notes-textarea"
        />
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSave(value.trim())}
            disabled={!isDirty && value.trim() === initialValue.trim()}
            data-testid="notes-save"
            className="flex-1 bg-primary text-primary-foreground text-[13px] font-semibold py-2.5 rounded-xl disabled:opacity-40 transition-opacity"
          >
            Save Note
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onCancel}
            data-testid="notes-cancel"
            className="flex-1 bg-muted text-muted-foreground text-[13px] font-semibold py-2.5 rounded-xl"
          >
            Cancel
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function InjectionRow({
  injection,
  onDelete,
  onUpdateNotes,
}: {
  injection: Injection;
  onDelete: () => void;
  onUpdateNotes: (notes: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleRowTap = () => {
    if (confirmDelete) return;
    if (editing) return;
    setExpanded((v) => !v);
  };

  const handleSave = (notes: string) => {
    onUpdateNotes(notes);
    setEditing(false);
    setExpanded(true);
  };

  const hasNotes = injection.notes && injection.notes.trim().length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="bg-card rounded-3xl border border-border/60 overflow-hidden"
      data-testid={`history-row-${injection.id}`}
    >
      {/* Main row — tappable */}
      <div
        className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer active:bg-muted/30 transition-colors"
        onClick={handleRowTap}
      >
        <div className="w-10 h-10 rounded-2xl bg-primary/12 flex items-center justify-center text-primary flex-shrink-0">
          <span className="text-[11px] font-bold tracking-tight">{peptideInitials(injection.peptide)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold truncate">{injection.peptide}</p>
          <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
            {injection.dose} {injection.units} · {injection.site}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[11px] text-muted-foreground/70 font-medium">{formatDate(injection.date)}</span>
          <span className="text-[10px] text-muted-foreground/50">{formatTime(injection.date)}</span>
        </div>

        {/* Notes indicator */}
        {hasNotes && !expanded && (
          <div className="flex-shrink-0 text-primary/50">
            <NotebookPen size={13} strokeWidth={2} />
          </div>
        )}

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex-shrink-0 text-muted-foreground/30"
        >
          <ChevronDown size={15} strokeWidth={2} />
        </motion.div>

        {/* Delete */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (confirmDelete) {
              onDelete();
            } else {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 2500);
            }
          }}
          data-testid={`delete-injection-${injection.id}`}
          className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
            confirmDelete
              ? "bg-destructive/15 text-destructive"
              : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted"
          }`}
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {editing ? (
                <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <NotesEditor
                    initialValue={injection.notes ?? ""}
                    onSave={handleSave}
                    onCancel={() => setEditing(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="viewer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 pb-4 pt-1"
                >
                  <div className="w-full h-px bg-border/40 mb-3" />
                  {hasNotes ? (
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[12.5px] text-muted-foreground/75 italic leading-relaxed flex-1">
                        "{injection.notes}"
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                        data-testid={`edit-notes-${injection.id}`}
                        className="flex-shrink-0 text-[11px] font-semibold text-primary/70 hover:text-primary transition-colors px-2.5 py-1.5 rounded-xl hover:bg-primary/10"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                      data-testid={`add-notes-${injection.id}`}
                      className="flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground/50 hover:text-primary transition-colors py-1"
                    >
                      <NotebookPen size={13} strokeWidth={2} />
                      Add a note...
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ExportButton({ injections }: { injections: Injection[] }) {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    exportInjectionsAsCsv(injections);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={handleExport}
      data-testid="button-export-history"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
        exported
          ? "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {exported ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <CheckCheck size={13} strokeWidth={2.2} />
            Exported
          </motion.span>
        ) : (
          <motion.span
            key="export"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <Download size={13} strokeWidth={2.2} />
            Export CSV
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function History() {
  const { injections, deleteInjection, updateInjection } = useInjections();

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      <header className="mb-8">
        <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide uppercase mb-1">
          Records
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-none">History</h1>
          {injections.length > 0 && (
            <div className="flex items-center gap-2">
              <ExportButton injections={injections} />
              <span className="text-[12px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {injections.length} {injections.length === 1 ? "entry" : "entries"}
              </span>
            </div>
          )}
        </div>
      </header>

      {injections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col items-center justify-center py-20 gap-5 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/40">
            <FlaskConical size={34} strokeWidth={1.3} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground/70 mb-1">No injections yet</p>
            <p className="text-[13px] text-muted-foreground/60 max-w-[200px] leading-relaxed">
              Log your first injection to start tracking your history.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div layout className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {injections.map((inj) => (
              <InjectionRow
                key={inj.id}
                injection={inj}
                onDelete={() => deleteInjection(inj.id)}
                onUpdateNotes={(notes) => updateInjection(inj.id, { notes })}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
