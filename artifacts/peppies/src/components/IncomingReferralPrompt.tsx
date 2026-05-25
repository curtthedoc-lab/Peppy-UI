import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Check, X } from "lucide-react";
import { useAffiliate } from "@/hooks/useAffiliate";
import type { IncomingReferral } from "@/utils/affiliateShare";

interface Props {
  incoming: IncomingReferral;
  onDismiss: () => void;
}

// Shown when an existing user opens a share link (?ref=...).
// Asks whether to save/replace their affiliate.
export function IncomingReferralPrompt({ incoming, onDismiss }: Props) {
  const { affiliate, hasAffiliate, setAffiliate } = useAffiliate();
  const [done, setDone] = useState(false);

  const handleSave = () => {
    setAffiliate({
      name: incoming.name || affiliate.name,
      code: incoming.code || affiliate.code,
      url: incoming.url || affiliate.url,
    });
    setDone(true);
    setTimeout(onDismiss, 1100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full mx-4 max-w-[400px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-4"
        data-testid="prompt-incoming-referral"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
            <Tag size={20} strokeWidth={2} />
          </div>
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
            data-testid="button-dismiss-incoming-referral"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div>
          <h2 className="text-[17px] font-bold leading-tight mb-1">
            {hasAffiliate ? "Replace your saved referral?" : "You've been referred"}
          </h2>
          <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
            {hasAffiliate
              ? "This Peppies link includes a different referral than the one you have saved. Want to switch?"
              : "This Peppies link came with a referral. Save it to enable the Shop Peptides button."}
          </p>
        </div>

        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 flex flex-col gap-1.5">
          {incoming.name && (
            <p className="text-[13.5px] font-semibold text-primary">{incoming.name}</p>
          )}
          {incoming.code && (
            <p className="text-[13px] font-mono text-foreground/85 tracking-wide">{incoming.code}</p>
          )}
          {incoming.url && (
            <p className="text-[11.5px] text-muted-foreground/70 break-all">{incoming.url}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={done}
            className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl disabled:opacity-70 tracking-wide flex items-center justify-center gap-2"
            data-testid="button-accept-incoming-referral"
          >
            {done ? (
              <>
                <Check size={15} strokeWidth={2.4} /> Saved
              </>
            ) : hasAffiliate ? (
              "Replace and save"
            ) : (
              "Save referral"
            )}
          </motion.button>
          <button
            onClick={onDismiss}
            className="w-full bg-muted text-muted-foreground font-semibold text-[13.5px] py-3 rounded-2xl tracking-wide"
            data-testid="button-decline-incoming-referral"
          >
            No thanks
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
