import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Scale, Moon, Info, ChevronRight, Trash2, AlertTriangle, Download, CheckCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useInjections } from "@/hooks/useInjections";
import { exportInjectionsAsCsv } from "@/utils/exportCsv";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

const ALL_STORAGE_KEYS = [
  "peppies_injections",
  "peppies_calculations",
  "peppies_disclaimer_v1",
];

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase px-1 mb-2 mt-6 first:mt-0">
      {label}
    </p>
  );
}

function Row({
  icon: Icon,
  label,
  sublabel,
  right,
  testId,
  teal,
  destructive,
  onClick,
}: {
  icon: typeof User;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  testId: string;
  teal?: boolean;
  destructive?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      variants={rowVariants}
      onClick={onClick}
      className="bg-card rounded-2xl px-4 py-3.5 border border-border/60 flex items-center gap-3.5 active:scale-[0.985] transition-transform cursor-pointer"
      data-testid={testId}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        destructive ? "bg-destructive/10 text-destructive" :
        teal ? "bg-primary/12 text-primary" :
        "bg-muted text-foreground/70"
      }`}>
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium leading-tight ${destructive ? "text-destructive" : ""}`}>{label}</p>
        {sublabel && <p className="text-[12px] text-muted-foreground/70 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex-shrink-0">
        {right ?? <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />}
      </div>
    </motion.div>
  );
}

function ResetConfirmSheet({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle size={26} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-[17px] font-bold mb-1.5">Reset all app data?</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              This will permanently delete all your logged injections and saved calculations. The disclaimer will also be reset. This cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            data-testid="button-confirm-reset"
            className="w-full bg-destructive text-destructive-foreground font-semibold text-[15px] py-4 rounded-2xl tracking-wide"
          >
            Delete Everything
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            data-testid="button-cancel-reset"
            className="w-full bg-muted text-foreground font-semibold text-[15px] py-4 rounded-2xl tracking-wide"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Settings() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [exported, setExported] = useState(false);
  const { injections } = useInjections();

  const handleReset = () => {
    ALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    setShowConfirm(false);
    setResetDone(true);
    setTimeout(() => window.location.reload(), 800);
  };

  const handleExport = () => {
    exportInjectionsAsCsv(injections);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <>
      <div className="flex flex-col px-5 pt-14 pb-4">
        <header className="mb-8">
          <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide uppercase mb-1">
            Preferences
          </p>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-none">
            Settings
          </h1>
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col">
          <SectionLabel label="Account" />
          <div className="flex flex-col gap-2 mb-2">
            <Row
              icon={User}
              label="Profile"
              sublabel="Manage your information"
              teal
              testId="settings-profile"
            />
          </div>

          <SectionLabel label="Preferences" />
          <div className="flex flex-col gap-2 mb-2">
            <Row
              icon={Bell}
              label="Notifications"
              sublabel="Reminders and alerts"
              testId="settings-notifications"
              right={<Switch checked={true} className="scale-90" />}
            />
            <Row
              icon={Scale}
              label="Units"
              sublabel="Weight and measurement"
              testId="settings-units"
              right={
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-muted-foreground font-medium">kg</span>
                  <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />
                </div>
              }
            />
            <Row
              icon={Moon}
              label="Theme"
              sublabel="Appearance"
              testId="settings-theme"
              right={
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-muted-foreground font-medium">Dark</span>
                  <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />
                </div>
              }
            />
          </div>

          <SectionLabel label="Support" />
          <div className="flex flex-col gap-2 mb-2">
            <Row
              icon={Info}
              label="About Peppies"
              sublabel="Version 1.0.0"
              testId="settings-about"
            />
          </div>

          <SectionLabel label="Data" />
          <div className="flex flex-col gap-2">
            <Row
              icon={Download}
              label="Export History"
              sublabel={injections.length > 0 ? `${injections.length} ${injections.length === 1 ? "entry" : "entries"} as CSV` : "No entries to export"}
              teal={injections.length > 0}
              testId="settings-export"
              onClick={injections.length > 0 ? handleExport : undefined}
              right={
                exported ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-primary text-[12px] font-semibold"
                  >
                    <CheckCheck size={14} strokeWidth={2.2} />
                    Saved
                  </motion.span>
                ) : (
                  <ChevronRight size={16} className={injections.length > 0 ? "text-muted-foreground/50" : "text-muted-foreground/25"} strokeWidth={2} />
                )
              }
            />
            <Row
              icon={Trash2}
              label="Reset App Data"
              sublabel="Clear all injections and calculations"
              destructive
              testId="settings-reset"
              onClick={() => setShowConfirm(true)}
              right={<span />}
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {resetDone && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-[13px] text-muted-foreground mt-6"
            >
              All data cleared. Restarting...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <ResetConfirmSheet
            onConfirm={handleReset}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
