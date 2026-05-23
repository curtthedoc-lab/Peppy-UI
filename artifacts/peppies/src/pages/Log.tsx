import { motion } from "framer-motion";
import { PenLine, Plus } from "lucide-react";

export function Log() {
  return (
    <div className="h-full flex flex-col px-5 pt-14">
      <header className="mb-10">
        <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide uppercase mb-1">
          Injections
        </p>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-none">
          Log Injection
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center pb-16 gap-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
          className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
        >
          <PenLine size={36} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.25 }}
          className="text-center"
        >
          <h2 className="text-[18px] font-semibold mb-2">Ready to log?</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[220px]">
            Injection logging form coming soon.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.25 }}
          whileTap={{ scale: 0.93 }}
          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 active:shadow-primary/20 transition-shadow"
          data-testid="button-log-injection"
        >
          <Plus size={28} strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
