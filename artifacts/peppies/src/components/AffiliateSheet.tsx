import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Copy, Check, Trash2, Tag, Share2, Link2, Users, RotateCcw } from "lucide-react";
import { useAffiliate, isValidUrl, normalizeUrl } from "@/hooks/useAffiliate";
import { buildReferralLink, buildShareMessage } from "@/utils/affiliateShare";

export function AffiliateSheet({ onClose }: { onClose: () => void }) {
  const { affiliate, hasAffiliate, shareCount, setAffiliate, bumpShareCount, resetShareCount, clear } = useAffiliate();
  const [name, setName] = useState(affiliate.name);
  const [code, setCode] = useState(affiliate.code);
  const [url, setUrl] = useState(affiliate.url);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [shareStatus, setShareStatus] = useState<"" | "shared" | "copied" | "error">("");

  useEffect(() => {
    setName(affiliate.name);
    setCode(affiliate.code);
    setUrl(affiliate.url);
  }, [affiliate.name, affiliate.code, affiliate.url]);

  const handleSave = () => {
    if (!url.trim()) {
      setError("A link is required to use Shop Peptides");
      return;
    }
    if (!isValidUrl(url)) {
      setError("That doesn't look like a valid link");
      return;
    }
    setAffiliate({ name, code, url });
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleCopyCode = async () => {
    if (!affiliate.code) return;
    try {
      await navigator.clipboard.writeText(affiliate.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard may be blocked
    }
  };

  const handleShareReferral = async () => {
    if (!hasAffiliate) return;
    const link = buildReferralLink(affiliate);
    const message = buildShareMessage(affiliate, link);
    setShareStatus("");
    // Prefer native share where available (mobile, PWA). Fall back to clipboard.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Peppies — peptide tracker",
          text: message,
          url: link,
        });
        bumpShareCount();
        setShareStatus("shared");
        setTimeout(() => setShareStatus(""), 2000);
        return;
      } catch (err) {
        // User cancelled — don't show error or bump counter. Other errors fall through to clipboard.
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${message}`);
      bumpShareCount();
      setShareStatus("copied");
      setTimeout(() => setShareStatus(""), 2200);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus(""), 2200);
    }
  };

  const handleCopyShareLink = async () => {
    if (!hasAffiliate) return;
    const link = buildReferralLink(affiliate);
    try {
      await navigator.clipboard.writeText(link);
      bumpShareCount();
      setShareStatus("copied");
      setTimeout(() => setShareStatus(""), 2200);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus(""), 2200);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 backdrop-blur-sm"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px) + 24px, 40px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -16, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full mx-4 max-w-[400px] bg-card border border-border/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        style={{ maxWidth: 400 }}
        data-testid="sheet-affiliate"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Affiliate / Referral</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            data-testid="button-close-affiliate"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed">
          Save your peptide vendor's referral link here. Tapping{" "}
          <span className="text-primary font-semibold">Shop Peptides</span> on the home screen opens it in your browser.
        </p>

        {/* Current saved affiliate */}
        {hasAffiliate && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Tag size={13} strokeWidth={2.4} className="text-primary flex-shrink-0" />
                <span className="text-[13px] font-semibold text-primary truncate">
                  {affiliate.name || "Referral saved"}
                </span>
              </div>
              {affiliate.code && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11.5px] font-semibold text-primary/80 hover:text-primary px-2 py-1 rounded-lg bg-primary/10"
                  data-testid="button-copy-code"
                >
                  {copied ? <Check size={11} strokeWidth={2.6} /> : <Copy size={11} strokeWidth={2.4} />}
                  {copied ? "Copied" : "Copy code"}
                </button>
              )}
            </div>
            {affiliate.code && (
              <p className="text-[13px] font-mono text-foreground/80 tracking-wide">{affiliate.code}</p>
            )}
            <p className="text-[11.5px] text-muted-foreground/70 break-all">{affiliate.url}</p>
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
              Affiliate name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jon Doe"
              className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
              data-testid="input-affiliate-name"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
              Affiliate code (optional)
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 65JO-3D6O"
              autoCapitalize="characters"
              className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors font-mono tracking-wide"
              data-testid="input-affiliate-code"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground/70 mb-1.5 block">
              Affiliate link <span className="text-destructive/70">*</span>
            </label>
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onBlur={() => {
                if (url.trim()) setUrl(normalizeUrl(url));
              }}
              placeholder="https://jondoe65.r3vivelabs.com"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
              data-testid="input-affiliate-url"
            />
          </div>
          {error && <p className="text-[12px] text-destructive">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!url.trim()}
            className="w-full bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl disabled:opacity-40 tracking-wide flex items-center justify-center gap-2"
            data-testid="button-save-affiliate"
          >
            {saved ? (
              <>
                <Check size={15} strokeWidth={2.4} />
                Saved
              </>
            ) : (
              "Save Referral"
            )}
          </motion.button>

          {hasAffiliate && affiliate.url && (
            <a
              href={affiliate.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-muted text-foreground font-semibold text-[14px] py-3.5 rounded-2xl tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              data-testid="link-open-affiliate"
            >
              <ExternalLink size={14} strokeWidth={2.2} />
              Open link now
            </a>
          )}
        </div>

        {/* Share your referral */}
        {hasAffiliate && (
          <div className="bg-background border border-border/60 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Share2 size={15} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold leading-tight">Share your referral</p>
                <p className="text-[11.5px] text-muted-foreground/70 mt-1 leading-relaxed">
                  Send a Peppies link that auto-fills your code and link in the other person's onboarding.
                </p>
              </div>
            </div>

            {/* Share counter */}
            <div
              className="flex items-center justify-between gap-3 bg-primary/8 border border-primary/20 rounded-xl px-3.5 py-2.5"
              data-testid="affiliate-sheet-share-count"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Users size={14} strokeWidth={2.3} className="text-primary flex-shrink-0" />
                <p className="text-[12.5px] text-foreground/85 leading-snug">
                  {shareCount === 0 ? (
                    <>You haven't shared Peppies yet.</>
                  ) : (
                    <>
                      You've shared Peppies with{" "}
                      <span className="font-bold text-primary">{shareCount}</span>{" "}
                      {shareCount === 1 ? "friend" : "friends"}
                    </>
                  )}
                </p>
              </div>
              {shareCount > 0 && (
                <button
                  onClick={resetShareCount}
                  className="text-[10.5px] font-semibold text-muted-foreground/60 hover:text-muted-foreground flex items-center gap-1 px-1.5 py-1 rounded-md flex-shrink-0"
                  data-testid="button-reset-share-count"
                  aria-label="Reset share count"
                >
                  <RotateCcw size={10} strokeWidth={2.3} />
                  Reset
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleShareReferral}
                className="flex-1 bg-primary text-primary-foreground font-semibold text-[13.5px] py-3 rounded-xl flex items-center justify-center gap-1.5"
                data-testid="button-share-referral"
              >
                <Share2 size={13} strokeWidth={2.4} />
                Share
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyShareLink}
                className="flex-1 bg-muted text-foreground font-semibold text-[13.5px] py-3 rounded-xl flex items-center justify-center gap-1.5"
                data-testid="button-copy-share-link"
              >
                <Link2 size={13} strokeWidth={2.4} />
                Copy link
              </motion.button>
            </div>
            {shareStatus === "shared" && (
              <p className="text-[11.5px] text-primary text-center -mt-1">Shared</p>
            )}
            {shareStatus === "copied" && (
              <p className="text-[11.5px] text-primary text-center -mt-1">Link copied to clipboard</p>
            )}
            {shareStatus === "error" && (
              <p className="text-[11.5px] text-destructive text-center -mt-1">
                Couldn't share or copy — try long-pressing the link in Manage to copy manually.
              </p>
            )}
          </div>
        )}

        {/* Clear */}
        {hasAffiliate && (
          <div className="flex flex-col items-center pt-1">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-[12px] text-muted-foreground/70 flex items-center gap-1.5 px-3 py-2"
                data-testid="button-clear-affiliate"
              >
                <Trash2 size={11} strokeWidth={2.2} />
                Remove saved referral
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clear();
                    setConfirmClear(false);
                    setName("");
                    setCode("");
                    setUrl("");
                  }}
                  className="text-[12px] font-semibold bg-destructive/15 text-destructive px-3.5 py-2 rounded-xl"
                >
                  Yes, remove
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-[12px] font-semibold bg-muted text-muted-foreground px-3.5 py-2 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
