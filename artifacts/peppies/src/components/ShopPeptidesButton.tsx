import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ExternalLink, Plus } from "lucide-react";
import { useAffiliate } from "@/hooks/useAffiliate";
import { AffiliateSheet } from "@/components/AffiliateSheet";

export function ShopPeptidesButton() {
  const { affiliate, hasAffiliate } = useAffiliate();
  const [showSheet, setShowSheet] = useState(false);

  const commonClass =
    "w-full flex items-center justify-between rounded-2xl px-4 py-3.5 border transition-all active:scale-[0.98]";
  const style = {
    touchAction: "manipulation" as const,
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <>
      {hasAffiliate ? (
        <a
          href={affiliate.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${commonClass} bg-primary text-primary-foreground border-primary/40 shadow-lg shadow-primary/25`}
          style={style}
          data-testid="link-shop-peptides"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={17} strokeWidth={2.2} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[14.5px] font-bold leading-tight">Shop Peptides</p>
              <p className="text-[11.5px] opacity-80 mt-0.5 truncate">
                {affiliate.name ? `via ${affiliate.name}` : "Open referral link"}
                {affiliate.code ? ` · ${affiliate.code}` : ""}
              </p>
            </div>
          </div>
          <ExternalLink size={15} strokeWidth={2.2} className="flex-shrink-0 opacity-90" />
        </a>
      ) : (
        <button
          onClick={() => setShowSheet(true)}
          className={`${commonClass} bg-card border-border/60 text-foreground hover:border-primary/40`}
          style={style}
          data-testid="button-add-affiliate"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={17} strokeWidth={2.2} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[14.5px] font-bold leading-tight">Shop Peptides</p>
              <p className="text-[11.5px] text-muted-foreground/70 mt-0.5">
                Tap to add your vendor referral link
              </p>
            </div>
          </div>
          <Plus size={16} strokeWidth={2.4} className="flex-shrink-0 text-primary" />
        </button>
      )}

      {/* Long-press / settings: tap the saved button title section is the link itself,
          but we also expose a "Manage" affordance — render small edit icon on right when saved */}
      {hasAffiliate && (
        <button
          onClick={() => setShowSheet(true)}
          className="text-[11.5px] text-muted-foreground/60 hover:text-muted-foreground text-center py-1 -mt-1"
          style={style}
          data-testid="button-manage-affiliate"
        >
          Manage referral
        </button>
      )}

      <AnimatePresence>
        {showSheet && <AffiliateSheet onClose={() => setShowSheet(false)} />}
      </AnimatePresence>
    </>
  );
}
