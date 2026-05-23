import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const skeletonItems = [
  { width: "w-2/5", subWidth: "w-1/3" },
  { width: "w-1/3", subWidth: "w-1/4" },
  { width: "w-2/5", subWidth: "w-1/3" },
];

export function History() {
  return (
    <div className="flex flex-col px-5 pt-14">
      <header className="mb-8">
        <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide uppercase mb-1">
          Records
        </p>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-none">
          History
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {skeletonItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.2 }}
            className="bg-card rounded-3xl p-4 border border-border/60 flex items-center gap-4"
            data-testid={`skeleton-history-${i}`}
          >
            <div className="w-11 h-11 rounded-2xl bg-muted animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className={`h-3.5 bg-muted rounded-full animate-pulse ${item.width}`} />
              <div className={`h-2.5 bg-muted rounded-full animate-pulse ${item.subWidth}`} />
            </div>
            <div className="h-3 bg-muted rounded-full animate-pulse w-10" />
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-center text-[13px] text-muted-foreground/60 mt-8"
      >
        No history yet. Start logging to see entries here.
      </motion.p>
    </div>
  );
}
