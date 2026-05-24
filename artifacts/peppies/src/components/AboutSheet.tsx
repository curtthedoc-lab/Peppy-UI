import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Lock, FlaskConical, Database, ExternalLink } from "lucide-react";
import { useInjections } from "@/hooks/useInjections";
import { PEPTIDE_REFERENCE } from "@/data/peptideReference";
import { Disclaimer } from "./Disclaimer";

const APP_VERSION = "1.0.0";

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Lock;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-muted/40 rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-muted-foreground/70 leading-tight">{label}</p>
        <p className="text-[13.5px] font-semibold leading-tight mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

export function AboutSheet({ onClose }: { onClose: () => void }) {
  const { injections } = useInjections();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  if (showDisclaimer) {
    return <Disclaimer onAccept={() => setShowDisclaimer(false)} />;
  }

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
        data-testid="sheet-about"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">About Peppies</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            data-testid="button-close-about"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <div className="w-16 h-16 rounded-3xl bg-primary/12 border border-primary/20 flex items-center justify-center text-primary mb-1">
            <FlaskConical size={28} strokeWidth={1.6} />
          </div>
          <h3 className="text-[20px] font-bold tracking-[-0.02em] text-primary">Peppies</h3>
          <p className="text-[12px] font-medium text-muted-foreground/70 tracking-wide">
            Version {APP_VERSION}
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[300px] mt-1">
            Private peptide tracking. No cloud, no accounts — everything lives on this device.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Fact icon={Lock} label="Storage" value="100% local — never transmitted" />
          <Fact
            icon={FlaskConical}
            label="Reference library"
            value={`${PEPTIDE_REFERENCE.length} peptides included`}
          />
          <Fact
            icon={Database}
            label="Your data"
            value={`${injections.length} ${injections.length === 1 ? "injection" : "injections"} logged`}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowDisclaimer(true)}
          data-testid="button-view-disclaimer"
          className="w-full bg-muted text-foreground font-semibold text-[14px] py-3.5 rounded-2xl flex items-center justify-center gap-2"
        >
          <ShieldAlert size={15} strokeWidth={2} />
          View Disclaimer
        </motion.button>

        <div className="flex flex-col gap-1.5 pt-1 pb-1 text-center">
          <p className="text-[11px] text-muted-foreground/60">
            Reference data sourced from
          </p>
          <a
            href="https://peptidedosages.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-semibold text-primary/80 hover:text-primary inline-flex items-center justify-center gap-1"
            data-testid="link-source"
          >
            peptidedosages.com
            <ExternalLink size={11} strokeWidth={2.2} />
          </a>
          <p className="text-[10.5px] text-muted-foreground/40 leading-relaxed mt-2 px-2">
            Always verify dosing and protocols with qualified healthcare professionals.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
