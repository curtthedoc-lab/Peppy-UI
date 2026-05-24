import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

const STORAGE_KEY = "peppies_disclaimer_v1";

export function useDisclaimerAccepted() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function Disclaimer({ onAccept }: { onAccept: () => void }) {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = () => {
    setAccepting(true);
    localStorage.setItem(STORAGE_KEY, "true");
    setTimeout(onAccept, 320);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-background px-6"
      style={{
        paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
        paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      }}
    >
      <div className="w-full max-w-[380px] mx-auto flex flex-col items-center min-h-full justify-center py-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6"
        >
          <ShieldAlert size={34} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.28 }}
          className="text-center mb-6"
        >
          <h1 className="text-[26px] font-bold tracking-[-0.03em] mb-3">
            Before you begin
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
            Peppies is a personal tracking and reference tool only. It is not a medical app and does not provide medical advice, diagnosis, or treatment recommendations.
          </p>
          <div className="bg-card border border-border/60 rounded-2xl p-4 text-left flex flex-col gap-3">
            <DisclaimerPoint text="All peptides tracked in this app are research compounds. They are not FDA-approved for human use unless explicitly stated." />
            <DisclaimerPoint text="Dosage calculations and reference data are for informational purposes only. Always verify with a qualified healthcare professional before use." />
            <DisclaimerPoint text="You are solely responsible for how you use this app and any information it contains." />
            <DisclaimerPoint text="This app stores all data locally on your device. Nothing is shared or transmitted." />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="w-full flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAccept}
            disabled={accepting}
            data-testid="button-accept-disclaimer"
            className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/25 transition-opacity disabled:opacity-70 tracking-wide"
          >
            I Understand — Continue
          </motion.button>
          <p className="text-center text-[11px] text-muted-foreground/50 leading-relaxed px-4">
            By continuing, you confirm you are 18+ and acknowledge this disclaimer.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DisclaimerPoint({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0 mt-[6px]" />
      <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed">{text}</p>
    </div>
  );
}
