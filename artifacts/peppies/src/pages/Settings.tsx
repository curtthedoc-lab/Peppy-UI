import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Scale, Info, ChevronRight, Trash2, AlertTriangle, Download, CheckCheck, Upload, FileJson, BookOpen, ShoppingBag, Target } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useInjections } from "@/hooks/useInjections";
import { exportInjectionsAsCsv } from "@/utils/exportCsv";
import { exportBackupAsJson, parseBackupFile, applyBackup, summarizeBackup, BackupFile } from "@/utils/backup";
import { AboutSheet } from "@/components/AboutSheet";
import { HowToSheet } from "@/components/HowToSheet";
import { ProfileSheet } from "@/components/ProfileSheet";
import { AffiliateSheet } from "@/components/AffiliateSheet";
import { FindMyMacrosSheet } from "@/components/FindMyMacrosSheet";
import { useAffiliate } from "@/hooks/useAffiliate";
import { useMacroProfile } from "@/hooks/useMacroProfile";
import { usePreferences } from "@/hooks/usePreferences";
import { requestNotificationPermission, notificationSupported, currentNotificationPermission } from "@/hooks/useCycleReminder";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
} as const;
const rowVariants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
} as const;

const ALL_STORAGE_KEYS = [
  "peppies_injections",
  "peppies_calculations",
  "peppies_disclaimer_v1",
  "peppies_cycles",
  "peppies_weight",
  "peppies_hydration",
  "peppies_preferences",
  "peppies_notifications",
  "peppies_profile",
  "peppies_nutrition_entries",
  "peppies_nutrition_goals",
  "peppies_steps",
  "peppies_sleep",
  "peppies_affiliate",
  "peppies_macro_profile",
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

function RestoreConfirmSheet({
  backup,
  onConfirm,
  onCancel,
}: {
  backup: BackupFile;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const summary = summarizeBackup(backup);
  const exportedDate = new Date(summary.exportedAt);
  const dateLabel = isNaN(exportedDate.getTime())
    ? summary.exportedAt
    : exportedDate.toLocaleString();

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
          <div className="w-14 h-14 rounded-full bg-primary/12 flex items-center justify-center text-primary">
            <Upload size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-[17px] font-bold mb-1.5">Restore this backup?</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              This will <span className="font-semibold text-foreground">replace</span> all current
              injections, calculations, cycles, and food log on this device.
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-4 flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Exported</span><span className="font-medium">{dateLabel}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Injections</span><span className="font-medium">{summary.injections}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Calculations</span><span className="font-medium">{summary.calculations}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cycles</span><span className="font-medium">{summary.cycles}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Food entries</span><span className="font-medium">{summary.foods}</span></div>
        </div>

        <div className="flex flex-col gap-2.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            data-testid="button-confirm-restore"
            className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl tracking-wide"
          >
            Restore Backup
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            data-testid="button-cancel-restore"
            className="w-full bg-muted text-foreground font-semibold text-[15px] py-4 rounded-2xl tracking-wide"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
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
  const [backedUp, setBackedUp] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [restoreDone, setRestoreDone] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [showFindMacros, setShowFindMacros] = useState(false);
  const { macroProfile, hasMacroProfile } = useMacroProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { injections } = useInjections();
  const { affiliate, hasAffiliate } = useAffiliate();
  const { prefs, toggleWeightUnit, setCycleReminders } = usePreferences();
  const [notifError, setNotifError] = useState<string | null>(null);

  const handleToggleReminders = async () => {
    setNotifError(null);
    if (prefs.cycleReminders) {
      setCycleReminders(false);
      return;
    }
    if (!notificationSupported()) {
      setNotifError("Your browser doesn't support notifications.");
      return;
    }
    const perm = currentNotificationPermission();
    if (perm === "denied") {
      setNotifError("Notifications were blocked. Enable them for this site in your browser settings, then try again.");
      return;
    }
    if (perm === "granted") {
      setCycleReminders(true);
      return;
    }
    const result = await requestNotificationPermission();
    if (result === "granted") {
      setCycleReminders(true);
    } else {
      setNotifError("Permission not granted. Reminders stay off.");
    }
  };

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

  const handleBackup = () => {
    exportBackupAsJson();
    setBackedUp(true);
    setTimeout(() => setBackedUp(false), 2500);
  };

  const handleChooseRestoreFile = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const backup = await parseBackupFile(file);
      setPendingBackup(backup);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not read backup file.");
      setTimeout(() => setImportError(null), 5000);
    }
  };

  const handleConfirmRestore = () => {
    if (!pendingBackup) return;
    applyBackup(pendingBackup);
    setPendingBackup(null);
    setRestoreDone(true);
    setTimeout(() => window.location.reload(), 800);
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
              sublabel="Goals and body measurements"
              teal
              testId="settings-profile"
              onClick={() => setShowProfile(true)}
            />
            <Row
              icon={Target}
              label="Find My Macros"
              sublabel={
                hasMacroProfile
                  ? `Calculated ${macroProfile.lastCalculatedAt ? new Date(macroProfile.lastCalculatedAt).toLocaleDateString() : ""} — tap to recalc`
                  : "Calculate your daily calorie & macro targets"
              }
              teal
              testId="settings-find-macros"
              onClick={() => setShowFindMacros(true)}
            />
          </div>

          <SectionLabel label="Preferences" />
          <div className="flex flex-col gap-2 mb-2">
            <Row
              icon={Bell}
              label="Cycle Reminders"
              sublabel={prefs.cycleReminders ? "Alert when a cycle ends" : "Off"}
              testId="settings-notifications"
              onClick={handleToggleReminders}
              right={<Switch checked={prefs.cycleReminders} className="scale-90 pointer-events-none" />}
            />
            {notifError && (
              <p className="text-[11.5px] text-destructive/90 px-2 -mt-1 leading-snug" data-testid="text-notif-error">
                {notifError}
              </p>
            )}
            <Row
              icon={Scale}
              label="Weight Units"
              sublabel={prefs.weightUnit === "kg" ? "Kilograms (kg)" : "Pounds (lbs)"}
              testId="settings-units"
              onClick={toggleWeightUnit}
              right={
                <div className="flex bg-muted rounded-xl p-0.5 gap-0.5" data-testid="units-toggle">
                  {(["kg", "lbs"] as const).map((u) => (
                    <span
                      key={u}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        prefs.weightUnit === u
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {u}
                    </span>
                  ))}
                </div>
              }
            />
          </div>

          <SectionLabel label="Shop & Resources" />
          <div className="flex flex-col gap-2 mb-2">
            <Row
              icon={ShoppingBag}
              label="Affiliate / Referral"
              sublabel={
                hasAffiliate
                  ? affiliate.name
                    ? `${affiliate.name}${affiliate.code ? ` · ${affiliate.code}` : ""}`
                    : "Referral link saved"
                  : "Save your peptide vendor referral link"
              }
              teal={hasAffiliate}
              testId="settings-affiliate"
              onClick={() => setShowAffiliate(true)}
            />
          </div>

          <SectionLabel label="Support" />
          <div className="flex flex-col gap-2 mb-2">
            <Row
              icon={BookOpen}
              label="How to use Peppies"
              sublabel="Quick walkthrough of the main features"
              testId="settings-how-to"
              onClick={() => setShowHowTo(true)}
            />
            <Row
              icon={Info}
              label="About Peppies"
              sublabel="Version 1.0.0"
              testId="settings-about"
              onClick={() => setShowAbout(true)}
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
              icon={FileJson}
              label="Backup (JSON)"
              sublabel="Full backup — injections, calculations, cycles, food log"
              teal
              testId="settings-backup"
              onClick={handleBackup}
              right={
                backedUp ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-primary text-[12px] font-semibold"
                  >
                    <CheckCheck size={14} strokeWidth={2.2} />
                    Saved
                  </motion.span>
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />
                )
              }
            />
            <Row
              icon={Upload}
              label="Restore from Backup"
              sublabel="Import a Peppies JSON backup file"
              testId="settings-restore"
              onClick={handleChooseRestoreFile}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelected}
              className="hidden"
              data-testid="input-restore-file"
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

          <AnimatePresence>
            {importError && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[13px] text-destructive mt-4"
                data-testid="text-import-error"
              >
                {importError}
              </motion.p>
            )}
            {restoreDone && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[13px] text-primary mt-4"
              >
                Backup restored. Restarting...
              </motion.p>
            )}
          </AnimatePresence>
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
        {pendingBackup && (
          <RestoreConfirmSheet
            backup={pendingBackup}
            onConfirm={handleConfirmRestore}
            onCancel={() => setPendingBackup(null)}
          />
        )}
        {showAbout && <AboutSheet onClose={() => setShowAbout(false)} />}
        {showHowTo && <HowToSheet onClose={() => setShowHowTo(false)} />}
        {showAffiliate && <AffiliateSheet onClose={() => setShowAffiliate(false)} />}
        {showProfile && <ProfileSheet onClose={() => setShowProfile(false)} />}
        {showFindMacros && <FindMyMacrosSheet onClose={() => setShowFindMacros(false)} />}
      </AnimatePresence>
    </>
  );
}
