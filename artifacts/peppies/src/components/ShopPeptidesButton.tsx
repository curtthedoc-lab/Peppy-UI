import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ExternalLink, Plus, Copy, Check, Settings2, Tag, Link2, Users, User } from "lucide-react";
import { useAffiliate } from "@/hooks/useAffiliate";
import { AffiliateSheet } from "@/components/AffiliateSheet";

function hostFromUrl(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ShopPeptidesButton() {
  const { affiliate, hasAffiliate, hasPersonal, personal, shareCount } = useAffiliate();
  const [showSheet, setShowSheet] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const personalHost = hasPersonal ? hostFromUrl(personal.url) : "";

  // Reusable personal-link block (renders only when set).
  const personalBlock = hasPersonal ? (
    <div
      className="bg-background border border-border/50 rounded-2xl p-4 flex flex-col gap-3"
      data-testid="card-personal-link"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-muted text-foreground/70 flex items-center justify-center flex-shrink-0">
            <User size={13} strokeWidth={2.3} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground/60 tracking-widest uppercase leading-none mb-1">
              Your personal link
            </p>
            <p
              className="text-[13.5px] font-semibold leading-tight truncate"
              data-testid="text-personal-name"
            >
              {personal.name || personalHost}
            </p>
            {personal.name && (
              <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5" title={personal.url}>
                {personalHost}
              </p>
            )}
          </div>
        </div>
      </div>
      <a
        href={personal.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ touchAction: "manipulation" as const, WebkitTapHighlightColor: "transparent" }}
        className="w-full bg-primary/15 border border-primary/30 text-primary font-semibold text-[13.5px] py-3 rounded-xl tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        data-testid="link-shop-personal"
      >
        <ShoppingBag size={13} strokeWidth={2.3} />
        Shop with personal link
        <ExternalLink size={12} strokeWidth={2.2} className="opacity-80" />
      </a>
    </div>
  ) : null;

  const tapStyle = {
    touchAction: "manipulation" as const,
    WebkitTapHighlightColor: "transparent",
  };

  const handleCopy = async (text: string, which: "code" | "url") => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 1500);
      } else {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 1500);
      }
    } catch {
      // ignore
    }
  };

  // ---------- Empty state ----------
  if (!hasAffiliate) {
    return (
      <>
        <div
          className="bg-card rounded-3xl p-5 border border-border/60 flex flex-col gap-4"
          data-testid="card-affiliate-empty"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={19} strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold leading-tight">Shop Peptides</h2>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">No affiliate saved yet</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSheet(true)}
            style={tapStyle}
            className="w-full bg-primary/15 border border-primary/30 text-primary font-semibold text-[14px] py-3.5 rounded-2xl tracking-wide flex items-center justify-center gap-2"
            data-testid="button-add-affiliate"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Referral Info
          </motion.button>

          {personalBlock}
        </div>

        <AnimatePresence>
          {showSheet && <AffiliateSheet onClose={() => setShowSheet(false)} />}
        </AnimatePresence>
      </>
    );
  }

  // ---------- Filled state ----------
  const displayName = affiliate.name || "your affiliate";
  const host = affiliate.url ? hostFromUrl(affiliate.url) : "";

  return (
    <>
      <div
        className="bg-card rounded-3xl p-5 border border-border/60 flex flex-col gap-4"
        data-testid="card-affiliate"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={19} strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground/70 tracking-widest uppercase leading-none mb-1">
                Shared by
              </p>
              <h2
                className="text-[16px] font-bold leading-tight truncate"
                data-testid="text-affiliate-name"
              >
                {displayName}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setShowSheet(true)}
            style={tapStyle}
            className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            data-testid="button-manage-affiliate"
            aria-label="Manage referral"
          >
            <Settings2 size={14} strokeWidth={2.2} />
          </button>
        </div>

        {/* Code + URL rows */}
        <div className="flex flex-col gap-2">
          {affiliate.code && (
            <button
              onClick={() => handleCopy(affiliate.code, "code")}
              style={tapStyle}
              className="bg-background border border-border/50 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform text-left"
              data-testid="button-copy-affiliate-code"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Tag size={13} strokeWidth={2.3} className="text-muted-foreground/60 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold text-muted-foreground/60 tracking-widest uppercase leading-none mb-1">
                    Referral code
                  </p>
                  <p
                    className="text-[14px] font-mono font-semibold tracking-wide truncate"
                    data-testid="text-affiliate-code"
                  >
                    {affiliate.code}
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0 transition-colors ${
                  copiedCode ? "text-primary bg-primary/15" : "text-muted-foreground/60 bg-muted/60"
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check size={11} strokeWidth={2.6} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={11} strokeWidth={2.3} /> Copy
                  </>
                )}
              </span>
            </button>
          )}

          {affiliate.url && (
            <button
              onClick={() => handleCopy(affiliate.url, "url")}
              style={tapStyle}
              className="bg-background border border-border/50 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform text-left"
              data-testid="button-copy-affiliate-url"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Link2 size={13} strokeWidth={2.3} className="text-muted-foreground/60 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold text-muted-foreground/60 tracking-widest uppercase leading-none mb-1">
                    Shop URL
                  </p>
                  <p
                    className="text-[13.5px] font-medium truncate"
                    data-testid="text-affiliate-url"
                    title={affiliate.url}
                  >
                    {host}
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0 transition-colors ${
                  copiedUrl ? "text-primary bg-primary/15" : "text-muted-foreground/60 bg-muted/60"
                }`}
              >
                {copiedUrl ? (
                  <>
                    <Check size={11} strokeWidth={2.6} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={11} strokeWidth={2.3} /> Copy
                  </>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Prominent Shop Peptides button */}
        <a
          href={affiliate.url}
          target="_blank"
          rel="noopener noreferrer"
          style={tapStyle}
          className="w-full bg-primary text-primary-foreground font-bold text-[15.5px] py-4 rounded-2xl shadow-lg shadow-primary/25 tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          data-testid="link-shop-peptides"
        >
          <ShoppingBag size={16} strokeWidth={2.3} />
          Shop Peptides
          <ExternalLink size={14} strokeWidth={2.2} className="opacity-80 ml-0.5" />
        </a>

        <p className="text-[10.5px] text-muted-foreground/50 text-center leading-relaxed -mt-1">
          Opens {host || "your referral link"} in your browser
        </p>

        {personalBlock}

        {shareCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center gap-2 bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3"
            data-testid="affiliate-share-count"
          >
            <Users size={14} strokeWidth={2.3} className="text-primary flex-shrink-0" />
            <p className="text-[12.5px] text-foreground/85 leading-snug text-center">
              You've shared Peppies with{" "}
              <span className="font-bold text-primary" data-testid="text-share-count">
                {shareCount}
              </span>{" "}
              {shareCount === 1 ? "friend" : "friends"}
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showSheet && <AffiliateSheet onClose={() => setShowSheet(false)} />}
      </AnimatePresence>
    </>
  );
}
