import { motion } from "framer-motion";
import { PenLine, Scale, Droplets } from "lucide-react";
import { Link } from "wouter";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 26 },
  },
};

function ActionButton({ href, label, testId }: { href?: string; label: string; testId: string }) {
  const cls = "text-[13px] font-semibold text-primary tracking-wide px-3 py-1.5 rounded-xl hover:bg-primary/10 active:scale-95 transition-all duration-150";
  if (href) {
    return (
      <Link href={href} className={cls} data-testid={testId}>
        {label}
      </Link>
    );
  }
  return (
    <button className={cls} data-testid={testId}>
      {label}
    </button>
  );
}

function CardIcon({ icon: Icon }: { icon: typeof PenLine }) {
  return (
    <div className="w-9 h-9 rounded-2xl bg-primary/12 flex items-center justify-center text-primary flex-shrink-0">
      <Icon size={17} strokeWidth={2} />
    </div>
  );
}

export function Home() {
  return (
    <div className="px-5 pt-14 pb-4 flex flex-col">
      <header className="mb-8">
        <h1 className="text-[32px] font-bold text-primary tracking-[-0.03em] leading-none">
          Peppies
        </h1>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {/* Recent Injections */}
        <motion.div
          variants={cardVariants}
          className="bg-card rounded-3xl p-5 border border-border/60"
          data-testid="card-recent-injections"
        >
          <div className="flex items-center gap-3 mb-5">
            <CardIcon icon={PenLine} />
            <div>
              <h2 className="text-[15px] font-semibold leading-tight">Recent Injections</h2>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">Track your doses</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted-foreground">No injections logged yet</p>
            <ActionButton href="/log" label="Log now" testId="button-log-now" />
          </div>
        </motion.div>

        {/* Weight Tracking */}
        <motion.div
          variants={cardVariants}
          className="bg-card rounded-3xl p-5 border border-border/60"
          data-testid="card-weight-tracking"
        >
          <div className="flex items-center gap-3 mb-5">
            <CardIcon icon={Scale} />
            <div>
              <h2 className="text-[15px] font-semibold leading-tight">Weight Tracking</h2>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">Monitor your progress</p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[40px] font-bold tracking-[-0.04em] leading-none text-foreground/90">--</span>
              <span className="text-[17px] font-medium text-muted-foreground ml-1.5">kg</span>
            </div>
            <div className="flex items-end gap-4">
              <svg viewBox="0 0 80 28" className="w-16 h-7 opacity-30 stroke-primary fill-none" strokeWidth="2" strokeLinecap="round">
                <path d="M0,18 Q10,6 20,14 T40,12 T60,8 T80,14" />
              </svg>
              <ActionButton label="Track" testId="button-track-weight" />
            </div>
          </div>
        </motion.div>

        {/* Hydration */}
        <motion.div
          variants={cardVariants}
          className="bg-card rounded-3xl p-5 border border-border/60"
          data-testid="card-hydration"
        >
          <div className="flex items-center gap-3 mb-5">
            <CardIcon icon={Droplets} />
            <div>
              <h2 className="text-[15px] font-semibold leading-tight">Hydration</h2>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">Daily water intake</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-muted" />
                  <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3.5" fill="transparent" strokeDasharray="113" strokeDashoffset="113" className="text-primary" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold">0</span>
              </div>
              <div>
                <p className="text-[22px] font-bold tracking-tight leading-none">0 <span className="text-[14px] font-medium text-muted-foreground">/ 8</span></p>
                <p className="text-[11px] text-muted-foreground mt-0.5">glasses today</p>
              </div>
            </div>
            <ActionButton label="+ Add" testId="button-add-water" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
