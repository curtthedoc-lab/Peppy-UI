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
  Apple,
  ScanLine,
  Droplets,
  Scale,
  Footprints,
  Smartphone,
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
      "Open Settings → Profile to enter your starting weight, goal, and body measurements. Pick kg or lbs once and the whole app follows it. Your weight is also used to personalize calorie estimates in the step tracker.",
  },
  {
    icon: Calculator,
    title: "2. Calculate your dose",
    body:
      "Tap Calc in the bottom bar. Enter your vial size (mg), how much BAC water you reconstituted with (ml), and your target dose (mcg). The app tells you exactly how many units to draw on a standard insulin syringe — no math required.",
  },
  {
    icon: PenLine,
    title: "3. Log each injection",
    body:
      "Tap Log to record the peptide, dose, units drawn, and injection site. Use the body map to pick the exact spot — rotating sites helps avoid irritation. Every entry shows up in Recent Injections on Home and in full History.",
  },
  {
    icon: Repeat,
    title: "4. Track cycles",
    body:
      "From Home, tap the Cycle card to start a cycle (e.g. an 8-week BPC-157 run). The app counts the days, shows progress, and remembers past cycles so you can review what you've done.",
  },
  {
    icon: Scale,
    title: "5. Log your weight",
    body:
      "Tap Log or Track on the Weight card on Home. Each entry is saved with the date and you'll see a small sparkline of your last 7 weigh-ins along with trend arrows showing if you're up, down, or flat.",
  },
  {
    icon: Droplets,
    title: "6. Track hydration",
    body:
      "Use the + and − buttons on the Hydration card on Home to log glasses of water through the day. The ring fills as you progress toward your daily goal. Resets automatically each morning.",
  },
  {
    icon: Apple,
    title: "7. Log food & macros",
    body:
      "Tap Nutrition in the bottom bar to log meals. Add foods by name with calories, protein, carbs, and fat. The day view shows totals against your goals. Set or edit your daily targets from the Nutrition page.",
  },
  {
    icon: ScanLine,
    title: "8. Scan barcodes for fast logging",
    body:
      "Inside the Add Food sheet, tap Scan Barcode and point your phone at a packaged food's barcode. Peppies looks up the product and fills in the macros automatically. You can adjust the serving size before saving. First time you scan, allow camera access when iPhone asks.",
  },
  {
    icon: Footprints,
    title: "9. Track steps and walks",
    body:
      "Tap the Steps card on Home, then Start Walking. Peppies uses your phone's motion sensors to count steps and estimate distance + calories. Flip on Outdoor walk mode to use GPS for more accurate distance and pace. Allow Motion & Orientation Access when iPhone asks.",
  },
  {
    icon: Smartphone,
    title: "Important: steps only count while Peppies is open",
    body:
      "Step counting only works while the app is open and on screen. If your screen locks or you switch to another app, counting pauses until you come back — this is on purpose, not a bug. iPhone doesn't let web apps read motion sensors in the background. For best results, keep Peppies open during your walk (you can dim the screen). Add Peppies to your Home Screen for the most reliable tracking.",
  },
  {
    icon: Clock,
    title: "10. Review your history",
    body:
      "Tap History to see every injection and calculation, grouped by day. Filter by peptide to spot patterns over time. Tap any entry for full detail.",
  },
  {
    icon: Bell,
    title: "11. Turn on cycle reminders (optional)",
    body:
      "In Settings, enable Cycle Reminders to get a browser notification when an active cycle ends. Works best when Peppies is installed to your Home Screen.",
  },
  {
    icon: Download,
    title: "12. Back up your data",
    body:
      "All data stays on this device only — there's no cloud. Use Settings → Export Data regularly and save the file to iCloud Drive or email it to yourself. To restore on a new phone, use Import Data. Backups include injections, cycles, weight, hydration, nutrition, steps, profile, and preferences.",
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
