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
  Moon,
  ShoppingBag,
  Star,
  CalendarDays,
  Pencil,
} from "lucide-react";

type Step = {
  icon: typeof BookOpen;
  title: string;
  body: string;
  tip?: { title: string; body: string };
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
      "Tap Nutrition in the bottom bar. Tap Add Food to enter a meal. Start typing the food name and Peppies searches the USDA database — pick a result to auto-fill calories, protein, carbs, and fat. If the food has both a labeled serving and per-100g info, you'll see a Basis picker so you can choose which one to use. Use the × Servings counter to scale up if you ate more than one. You can also enter everything by hand.",
  },
  {
    icon: ScanLine,
    title: "8. Scan barcodes for fast logging",
    body:
      "Inside the Add Food sheet, tap Scan Barcode and point your phone at a packaged food's barcode. Peppies looks up the product and fills in the macros automatically. You can adjust the serving size before saving. First time you scan, allow camera access when iPhone asks.",
    tip: {
      title: "iPhone / Safari tip",
      body:
        "When iOS asks for camera access, tapping Allow only grants it for the current visit. To stop being asked every time, open the iPhone Settings app → Safari → Settings for Websites → Camera, find your Peppies site in the list, and set it to Allow. After that, Safari will remember it.",
    },
  },
  {
    icon: Pencil,
    title: "9. Edit or delete a food entry",
    body:
      "On the Nutrition page, tap any food row to reopen it. The × Servings counter starts at 1 — bump it up or down and the macros and serving label scale together (so '1 fried slices' becomes '2 fried slices'). Tap Save changes when done. To remove an entry, swipe it left and the red trash icon will delete it.",
  },
  {
    icon: CalendarDays,
    title: "10. View past days & switch macro view",
    body:
      "At the top of the Nutrition page is a day pager with < and > arrows — tap them to look at previous days. Tap the date in the middle to jump back to Today. Below the date is a swipeable summary card: swipe left or right (or tap the dots) to flip between the Rings view (calories + macro donuts) and the Bars view (each macro as a progress bar). Bars are color-coded: blue means more to go, green means goal met, red means you're over.",
  },
  {
    icon: Star,
    title: "11. Quick Add favorites",
    body:
      "Foods you log often automatically appear as Quick Add chips at the top of Nutrition — one tap re-logs them. To save your own, tap + New favorite, fill in the name and macros, and it stays in Quick Add forever (custom ones show a filled star). Don't want a chip there? Swipe it left to remove it — auto-suggestions stay hidden, custom ones are deleted. Quick Add only shows when you're viewing Today.",
  },
  {
    icon: Footprints,
    title: "12. Track steps and walks",
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
    icon: Moon,
    title: "13. Log your sleep",
    body:
      "Tap the Sleep card on Home to log how many hours you slept and rate the quality from Poor to Great. Use the quick toggle for Last night or Night before. Tap '+ Add bedtime, wake time, notes' to enter a bedtime and wake time and Peppies will calculate the hours for you. Only one entry per night — logging the same night again replaces the previous one.",
  },
  {
    icon: Clock,
    title: "14. Review your history",
    body:
      "Tap History to see every injection and calculation, grouped by day. Filter by peptide to spot patterns over time. Tap any entry for full detail.",
  },
  {
    icon: Bell,
    title: "15. Turn on cycle reminders (optional)",
    body:
      "In Settings, enable Cycle Reminders to get a browser notification when an active cycle ends. Works best when Peppies is installed to your Home Screen.",
  },
  {
    icon: ShoppingBag,
    title: "16. Save and share your vendor referral",
    body:
      "Settings → Shop & Resources → Affiliate / Referral. Save the name, code, and link of the peptide vendor that referred you. Once saved, a Shop Peptides button appears on the home screen — tap it to open the link in your browser. To pass it to a friend, tap Share inside the Affiliate sheet — it sends a special Peppies link that auto-fills your code and link during their onboarding. There's also a separate Personal Link slot — use it for a second vendor link you want to keep handy (for example, one a friend shared with you after you signed up). The personal link is just for you and is never included when you share Peppies.",
  },
  {
    icon: Download,
    title: "17. Back up your data",
    body:
      "All data stays on this device only — there's no cloud. Use Settings → Export Data regularly and save the file to iCloud Drive or email it to yourself. To restore on a new phone, use Import Data. Backups include injections, cycles, weight, hydration, nutrition (including your custom favorites), steps, sleep, profile, and preferences.",
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
                  {step.tip && (
                    <div className="mt-2.5 bg-primary/10 border border-primary/25 rounded-xl px-3 py-2.5">
                      <p className="text-[11.5px] font-semibold text-primary leading-tight">
                        {step.tip.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground/85 leading-relaxed mt-1">
                        {step.tip.body}
                      </p>
                    </div>
                  )}
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
