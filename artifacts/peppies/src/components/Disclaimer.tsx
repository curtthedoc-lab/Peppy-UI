import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Tag, ArrowRight } from "lucide-react";
import { useAffiliate, isValidUrl, normalizeUrl } from "@/hooks/useAffiliate";
import type { IncomingReferral } from "@/utils/affiliateShare";

const STORAGE_KEY = "peppies_disclaimer_v1";

export function useDisclaimerAccepted() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

interface DisclaimerProps {
  onAccept: () => void;
  initialReferral?: IncomingReferral;
  onReferralConsumed?: () => void;
}

export function Disclaimer({ onAccept, initialReferral, onReferralConsumed }: DisclaimerProps) {
  const [accepting, setAccepting] = useState(false);
  const [step, setStep] = useState<"terms" | "referral">("terms");
  const { setAffiliate } = useAffiliate();
  const [refName, setRefName] = useState(initialReferral?.name ?? "");
  const [refCode, setRefCode] = useState(initialReferral?.code ?? "");
  const [refUrl, setRefUrl] = useState(initialReferral?.url ?? "");
  const [refError, setRefError] = useState("");
  const prefilled = !!initialReferral && (!!initialReferral.code || !!initialReferral.url);

  const finish = () => {
    setAccepting(true);
    localStorage.setItem(STORAGE_KEY, "true");
    onReferralConsumed?.();
    setTimeout(onAccept, 320);
  };

  const handleAccept = () => {
    setStep("referral");
  };

  const handleSaveReferral = () => {
    if (!refUrl.trim() && !refCode.trim() && !refName.trim()) {
      finish();
      return;
    }
    // If URL provided, validate it
    if (refUrl.trim() && !isValidUrl(refUrl)) {
      setRefError("That doesn't look like a valid link");
      return;
    }
    setAffiliate({
      name: refName,
      code: refCode,
      url: refUrl.trim() ? normalizeUrl(refUrl) : "",
    });
    finish();
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
        <AnimatePresence mode="wait">
          {step === "terms" ? (
            <motion.div
              key="terms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
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
                  className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/25 transition-opacity disabled:opacity-70 tracking-wide flex items-center justify-center gap-2"
                >
                  I Understand <ArrowRight size={15} strokeWidth={2.4} />
                </motion.button>
                <p className="text-center text-[11px] text-muted-foreground/50 leading-relaxed px-4">
                  By continuing, you confirm you are 18+ and acknowledge this disclaimer.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="referral"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
                className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6"
              >
                <Tag size={30} strokeWidth={1.6} />
              </motion.div>

              <div className="text-center mb-5">
                <h1 className="text-[24px] font-bold tracking-[-0.03em] mb-2">
                  {prefilled ? "You've been referred" : "Were you referred by an affiliate?"}
                </h1>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {prefilled ? (
                    <>
                      The link you opened came with a referral. Tap{" "}
                      <span className="text-primary font-semibold">Save & Continue</span> to keep it. You can change it any time in Settings.
                    </>
                  ) : (
                    <>
                      Save the link now and Peppies will give you a one-tap{" "}
                      <span className="text-primary font-semibold">Shop Peptides</span> button on the home screen. You can change this any time in Settings.
                    </>
                  )}
                </p>
              </div>

              <div className="w-full flex flex-col gap-2.5 mb-3">
                <input
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="Affiliate name (optional)"
                  className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                  data-testid="input-onboard-ref-name"
                />
                <input
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="Affiliate code (optional)"
                  autoCapitalize="characters"
                  className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors font-mono"
                  data-testid="input-onboard-ref-code"
                />
                <input
                  value={refUrl}
                  onChange={(e) => {
                    setRefUrl(e.target.value);
                    setRefError("");
                  }}
                  placeholder="Affiliate link (e.g. jondoe65.r3vivelabs.com)"
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                  data-testid="input-onboard-ref-url"
                />
                {refError && <p className="text-[12px] text-destructive">{refError}</p>}
              </div>

              <div className="w-full flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveReferral}
                  disabled={accepting}
                  className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/25 disabled:opacity-70 tracking-wide"
                  data-testid="button-save-onboard-referral"
                >
                  {refUrl.trim() || refCode.trim() || refName.trim() ? "Save & Continue" : "Continue"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={finish}
                  disabled={accepting}
                  className="w-full bg-muted text-muted-foreground font-semibold text-[13.5px] py-3 rounded-2xl tracking-wide"
                  data-testid="button-skip-onboard-referral"
                >
                  Skip — I wasn't referred
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
