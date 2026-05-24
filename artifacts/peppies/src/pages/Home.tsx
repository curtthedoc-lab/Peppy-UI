import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Scale, Droplets, Flame, CalendarDays, FlaskConical, Activity, Plus, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useInjections, Injection } from "@/hooks/useInjections";
import { useCycles, daysSince } from "@/hooks/useCycles";
import { useWeight } from "@/hooks/useWeight";
import { useHydration } from "@/hooks/useHydration";
import { CycleSheet } from "@/components/CycleSheet";
import { WeightSheet } from "@/components/WeightSheet";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

function toDateKey(iso: string) { return iso.slice(0, 10); }

function computeStreak(injections: Injection[]): number {
  if (injections.length === 0) return 0;
  const days = new Set(injections.map((i) => toDateKey(i.date)));
  const today = toDateKey(new Date().toISOString());
  const yesterday = toDateKey(new Date(Date.now() - 86400000).toISOString());
  let streak = 0;
  let cursor: string | null = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  if (!cursor) return 0;
  while (days.has(cursor)) {
    streak++;
    const prev = new Date(cursor);
    prev.setDate(prev.getDate() - 1);
    cursor = toDateKey(prev.toISOString());
  }
  return streak;
}
function computeWeekCount(injections: Injection[]): number {
  const now = Date.now();
  return injections.filter((i) => now - new Date(i.date).getTime() < 7 * 24 * 60 * 60 * 1000).length;
}
function computeTopPeptide(injections: Injection[]): string {
  if (injections.length === 0) return "—";
  const counts: Record<string, number> = {};
  injections.forEach((i) => { counts[i.peptide] = (counts[i.peptide] ?? 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function buildSparklinePath(values: number[], w = 80, h = 28): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return `M${pts.join(" L")}`;
}

function StatTile({ icon: Icon, value, label, highlight, delay }: {
  icon: typeof Flame; value: string | number; label: string; highlight?: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26, delay }}
      className="flex-1 bg-card rounded-2xl border border-border/60 px-3 py-3.5 flex flex-col items-center gap-1.5"
    >
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/60"}`}>
        <Icon size={14} strokeWidth={2} />
      </div>
      <span className={`text-[20px] font-bold tracking-[-0.03em] leading-none ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground/60 text-center leading-tight uppercase tracking-wide">{label}</span>
    </motion.div>
  );
}

function CardIcon({ icon: Icon }: { icon: typeof PenLine }) {
  return (
    <div className="w-9 h-9 rounded-2xl bg-primary/12 flex items-center justify-center text-primary flex-shrink-0">
      <Icon size={17} strokeWidth={2} />
    </div>
  );
}

function formatRelative(iso: string) {
  const diffH = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  return `${diffD}d ago`;
}

function RecentInjectionRow({ inj }: { inj: Injection }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-t border-border/40 first:border-t-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <span className="text-[9px] font-bold tracking-tight">
            {inj.peptide.split(/[-\s]/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate leading-tight">{inj.peptide}</p>
          <p className="text-[11px] text-muted-foreground/70 leading-tight">{inj.dose} {inj.units} · {inj.site}</p>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground/60 flex-shrink-0 ml-2">{formatRelative(inj.date)}</span>
    </div>
  );
}

function CycleCard({ onOpen }: { onOpen: () => void }) {
  const { activeCycle } = useCycles();
  const daysIn = activeCycle ? daysSince(activeCycle.startDate) : 0;
  const progress = activeCycle?.durationDays ? Math.min(daysIn / activeCycle.durationDays, 1) : null;
  const daysLeft = activeCycle?.durationDays ? Math.max(activeCycle.durationDays - daysIn, 0) : null;

  return (
    <motion.div variants={cardVariants} className="bg-card rounded-3xl p-5 border border-border/60 cursor-pointer active:scale-[0.985] transition-transform" onClick={onOpen} data-testid="card-active-cycle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CardIcon icon={Activity} />
          <div>
            <h2 className="text-[15px] font-semibold leading-tight">Protocol</h2>
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">{activeCycle ? "Active cycle" : "No active cycle"}</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="text-[13px] font-semibold text-primary tracking-wide px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-all" data-testid="button-manage-cycle">
          {activeCycle ? "Manage" : <span className="flex items-center gap-1"><Plus size={13} strokeWidth={2.5} />Start</span>}
        </button>
      </div>
      {activeCycle ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold truncate leading-tight">{activeCycle.name}</p>
              {activeCycle.notes && <p className="text-[11px] text-muted-foreground/55 italic mt-0.5 truncate">{activeCycle.notes}</p>}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-[30px] font-bold text-primary leading-none tracking-[-0.03em]">{daysIn}</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wide">{daysIn === 1 ? "day in" : "days in"}</p>
            </div>
          </div>
          {progress !== null && (
            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground/55 mb-1.5">
                <span>Day {daysIn} of {activeCycle.durationDays}</span>
                <span>{daysLeft === 0 ? "Complete" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }} className="h-full bg-primary rounded-full" />
              </div>
            </div>
          )}
          {!activeCycle.durationDays && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] text-muted-foreground/60 font-medium">Ongoing</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground/50 py-0.5">Track a peptide protocol — name it, set a duration, and monitor your progress day by day.</p>
      )}
    </motion.div>
  );
}

function WeightCard({ onOpen }: { onOpen: () => void }) {
  const { latest, previous, trend, entries } = useWeight();
  const sparkValues = [...entries].reverse().slice(-7).map((e) => e.value);

  return (
    <motion.div variants={cardVariants} className="bg-card rounded-3xl p-5 border border-border/60" data-testid="card-weight-tracking">
      <div className="flex items-center gap-3 mb-5">
        <CardIcon icon={Scale} />
        <div>
          <h2 className="text-[15px] font-semibold leading-tight">Weight Tracking</h2>
          <p className="text-[12px] text-muted-foreground/70 mt-0.5">Monitor your progress</p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          {latest ? (
            <>
              <span className="text-[40px] font-bold tracking-[-0.04em] leading-none text-foreground/90">{latest.value}</span>
              <span className="text-[17px] font-medium text-muted-foreground ml-1.5">{latest.unit}</span>
              {trend && previous && (
                <div className={`flex items-center gap-1 mt-1 text-[12px] font-semibold ${trend === "up" ? "text-red-400" : trend === "down" ? "text-emerald-400" : "text-muted-foreground/50"}`}>
                  {trend === "up" ? <TrendingUp size={13} strokeWidth={2} /> : trend === "down" ? <TrendingDown size={13} strokeWidth={2} /> : null}
                  {trend === "up" ? "+" : trend === "down" ? "" : ""}
                  {trend !== "flat" ? `${Math.abs(latest.value - previous.value).toFixed(1)} ${latest.unit}` : "No change"}
                </div>
              )}
            </>
          ) : (
            <>
              <span className="text-[40px] font-bold tracking-[-0.04em] leading-none text-foreground/30">--</span>
              <span className="text-[17px] font-medium text-muted-foreground/40 ml-1.5">kg</span>
            </>
          )}
        </div>
        <div className="flex items-end gap-4">
          {sparkValues.length >= 2 ? (
            <svg viewBox="0 0 80 28" className="w-16 h-7 stroke-primary fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={buildSparklinePath(sparkValues)} />
            </svg>
          ) : (
            <svg viewBox="0 0 80 28" className="w-16 h-7 opacity-20 stroke-primary fill-none" strokeWidth="2" strokeLinecap="round">
              <path d="M0,18 Q10,6 20,14 T40,12 T60,8 T80,14" />
            </svg>
          )}
          <button
            onClick={onOpen}
            data-testid="button-track-weight"
            className="text-[13px] font-semibold text-primary tracking-wide px-3 py-1.5 rounded-xl hover:bg-primary/10 active:scale-95 transition-all whitespace-nowrap"
          >
            {latest ? "Log" : "Track"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function HydrationCard() {
  const { count, goal, addGlass, removeGlass } = useHydration();
  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference * (1 - count / goal);
  const pct = Math.round((count / goal) * 100);

  return (
    <motion.div variants={cardVariants} className="bg-card rounded-3xl p-5 border border-border/60" data-testid="card-hydration">
      <div className="flex items-center gap-3 mb-5">
        <CardIcon icon={Droplets} />
        <div>
          <h2 className="text-[15px] font-semibold leading-tight">Hydration</h2>
          <p className="text-[12px] text-muted-foreground/70 mt-0.5">Daily water intake</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-muted" />
              <motion.circle
                cx="22" cy="22" r="18"
                stroke="currentColor" strokeWidth="3.5" fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className={count >= goal ? "text-primary" : "text-primary"}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold">
              {pct < 100 ? `${pct}%` : "✓"}
            </span>
          </div>
          <div>
            <p className="text-[22px] font-bold tracking-tight leading-none">
              {count} <span className="text-[14px] font-medium text-muted-foreground">/ {goal}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">glasses today</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={removeGlass}
            disabled={count === 0}
            data-testid="button-remove-water"
            className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground disabled:opacity-30 transition-opacity"
          >
            <Minus size={16} strokeWidth={2.5} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={addGlass}
            disabled={count >= goal}
            data-testid="button-add-water"
            className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 shadow-md shadow-primary/20 transition-opacity"
          >
            <Plus size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {count >= goal && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-primary font-medium mt-3"
        >
          Daily goal reached!
        </motion.p>
      )}
    </motion.div>
  );
}

export function Home() {
  const { injections } = useInjections();
  const recent = injections.slice(0, 3);
  const [showCycleSheet, setShowCycleSheet] = useState(false);
  const [showWeightSheet, setShowWeightSheet] = useState(false);

  const streak = computeStreak(injections);
  const weekCount = computeWeekCount(injections);
  const topPeptide = computeTopPeptide(injections);
  const shortTopPeptide = topPeptide.length > 7 ? topPeptide.split(/[-\s]/)[0] : topPeptide;

  return (
    <>
      <div className="px-5 pt-14 pb-4 flex flex-col">
        <header className="mb-6">
          <h1 className="text-[32px] font-bold text-primary tracking-[-0.03em] leading-none">Peppies</h1>
        </header>

        <div className="flex gap-2.5 mb-5" data-testid="stats-strip">
          <StatTile icon={Flame} value={streak} label="Day Streak" highlight={streak > 0} delay={0.04} />
          <StatTile icon={CalendarDays} value={weekCount} label="This Week" highlight={weekCount > 0} delay={0.1} />
          <StatTile icon={FlaskConical} value={shortTopPeptide} label="Top Peptide" highlight={topPeptide !== "—"} delay={0.16} />
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3">
          <CycleCard onOpen={() => setShowCycleSheet(true)} />

          {/* Recent Injections */}
          <motion.div variants={cardVariants} className="bg-card rounded-3xl p-5 border border-border/60" data-testid="card-recent-injections">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CardIcon icon={PenLine} />
                <div>
                  <h2 className="text-[15px] font-semibold leading-tight">Recent Injections</h2>
                  <p className="text-[12px] text-muted-foreground/70 mt-0.5">Track your doses</p>
                </div>
              </div>
              <Link href="/log" className="text-[13px] font-semibold text-primary tracking-wide px-3 py-1.5 rounded-xl hover:bg-primary/10 active:scale-95 transition-all" data-testid="button-log-now">+ Log</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-[13px] text-muted-foreground/60 py-1">No injections logged yet</p>
            ) : (
              <div className="flex flex-col">
                {recent.map((inj) => <RecentInjectionRow key={inj.id} inj={inj} />)}
                {injections.length > 3 && (
                  <Link href="/history" className="text-[12px] text-primary/70 text-center pt-3 border-t border-border/40 mt-1 hover:text-primary transition-colors" data-testid="link-view-all-history">
                    View all {injections.length} entries
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          <WeightCard onOpen={() => setShowWeightSheet(true)} />
          <HydrationCard />
        </motion.div>
      </div>

      <AnimatePresence>
        {showCycleSheet && <CycleSheet onClose={() => setShowCycleSheet(false)} />}
        {showWeightSheet && <WeightSheet onClose={() => setShowWeightSheet(false)} />}
      </AnimatePresence>
    </>
  );
}
