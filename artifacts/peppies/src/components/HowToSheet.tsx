import { motion } from "framer-motion";
import {
  X,
  BookOpen,
  Calculator,
  PenLine,
  Clock,
  Repeat,
  User,
  Bell,
  Download,
  ShieldAlert,
} from "lucide-react";

type Step = {
  icon: typeof BookOpen;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: User,
    title: "1. Set up your profile",
    body:
      "Open Settings → Profile to enter your starting weight, goal, and body measurements. Pick kg or lbs once and the whole app follows it.",
  },
  {
    icon: Calculator,
    title: "2. Calculate your dose",
    body:
      "Tap Calc in the bottom bar. Enter your vial size (mg), how much BAC water you reconstituted with (ml), and your target dose (mcg). The app tells you exactly how many units to draw on a standard insulin syringe.",
  },
  {
    icon: PenLine,
    title: "3. Log each injection",
    body:
      "Tap Log to record the peptide, dose, units drawn, and injection site. Use the body map to pick the exact spot — rotating sites helps avoid irritation.",
  },
  {
    icon: Repeat,
    title: "4. Track cycles",
    body:
      "From Home, start a cycle (e.g. an 8-week BPC-157 run). The app counts the days, shows progress, and remembers past cycles so you can review what you've done.",
  },
  {
    icon: Clock,
    title: "5. Review your history",
    body:
      "Tap History to see every injection and calculation, grouped by day. Filter by peptide to spot patterns over time.",
  },
  {
    icon: Bell,
    title: "6. Turn on cycle reminders (optional)",
    body:
      "In Settings, enable Cycle Reminders to get a browser notification when an active cycle ends. Works best when Peppies is installed to your home screen.",
  },
  {
    icon: Download,
    title: "7. Back up your data",
    body:
      "All data stays on this device only — there's no cloud. Use Settings → Backup (JSON) regularly so you don't lose your history if you clear your browser or switch phones.",
  },
];

export function HowToSheet({ onClose }: { onClose: () => void }) {
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
        transition={{ type: "spring", stiffness: 300, damping: 30 } as const}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        data-testid="sheet-how-to"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">How to use Peppies</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            data-testid="button-close-how-to"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <div className="w-16 h-16 rounded-3xl bg-primary/12 border border-primary/20 flex items-center justify-center text-primary mb-1">
            <BookOpen size={26} strokeWidth={1.6} />
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[300px]">
            A quick walkthrough of the main features. Take it step by step.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-muted/40 rounded-2xl px-4 py-3.5 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold leading-tight">{step.title}</p>
                  <p className="text-[12.5px] text-muted-foreground/85 leading-relaxed mt-1">
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-destructive/10 border border-destructive/25 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={16} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold leading-tight text-destructive">
              Important
            </p>
            <p className="text-[12px] text-muted-foreground/85 leading-relaxed mt-1">
              Peppies is a tracking tool, not medical advice. Always confirm
              dosing and protocols with a qualified healthcare professional.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
