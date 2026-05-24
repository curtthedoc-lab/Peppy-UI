import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Sparkles } from "lucide-react";
import { useInjections, Injection } from "@/hooks/useInjections";

interface SitePoint {
  name: string;
  px: number;
  py: number;
  shortLabel: string;
}

const SITE_POINTS: SitePoint[] = [
  { name: "Right Deltoid",  px: 44  / 200, py: 106 / 410, shortLabel: "R.Delt" },
  { name: "Left Deltoid",   px: 156 / 200, py: 106 / 410, shortLabel: "L.Delt" },
  { name: "Right Abdomen",  px: 83  / 200, py: 185 / 410, shortLabel: "R.Abd"  },
  { name: "Left Abdomen",   px: 117 / 200, py: 185 / 410, shortLabel: "L.Abd"  },
  { name: "Right Flank",    px: 55  / 200, py: 207 / 410, shortLabel: "R.Flnk" },
  { name: "Left Flank",     px: 145 / 200, py: 207 / 410, shortLabel: "L.Flnk" },
  { name: "Right Glute",    px: 72  / 200, py: 252 / 410, shortLabel: "R.Glut" },
  { name: "Left Glute",     px: 128 / 200, py: 252 / 410, shortLabel: "L.Glut" },
  { name: "Right Thigh",    px: 76  / 200, py: 312 / 410, shortLabel: "R.Thgh" },
  { name: "Left Thigh",     px: 124 / 200, py: 312 / 410, shortLabel: "L.Thgh" },
];

const ALL_SITE_NAMES = SITE_POINTS.map((s) => s.name);

// ── Rotation logic ────────────────────────────────────────────────────────────
function computeSuggestedSite(injections: Injection[]): string | null {
  if (injections.length === 0) return ALL_SITE_NAMES[0];

  // Build a map of site → index of first (most recent) occurrence
  const lastUsedIndex: Record<string, number> = {};
  for (let i = 0; i < injections.length; i++) {
    const site = injections[i].site;
    if (!(site in lastUsedIndex)) lastUsedIndex[site] = i;
  }

  // Prefer sites never used at all
  const neverUsed = ALL_SITE_NAMES.filter((s) => !(s in lastUsedIndex));
  if (neverUsed.length > 0) return neverUsed[0];

  // Otherwise suggest the site with the highest index (least recently used)
  const lastSite = injections[0].site;
  return (
    ALL_SITE_NAMES.filter((s) => s !== lastSite).sort(
      (a, b) => lastUsedIndex[b] - lastUsedIndex[a],
    )[0] ?? null
  );
}

// ── Body SVG ──────────────────────────────────────────────────────────────────
function BodyOutlineSVG() {
  const fill   = "hsl(220 14% 22%)";
  const stroke = "hsl(220 14% 34%)";
  const sw     = "1.5";

  return (
    <svg viewBox="0 0 200 410" className="w-full h-full" style={{ display: "block" }} aria-hidden>
      {/* Head */}
      <circle cx="100" cy="34" r="25" fill={fill} stroke={stroke} strokeWidth={sw} />
      <circle cx="92"  cy="30" r="2.5" fill="hsl(220 14% 42%)" />
      <circle cx="108" cy="30" r="2.5" fill="hsl(220 14% 42%)" />
      <path d="M95 40 Q100 44 105 40" stroke="hsl(220 14% 42%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Neck */}
      <path d="M93 58 L93 70 L107 70 L107 58 Z" fill={fill} />

      {/* Torso */}
      <path
        d="M65 70 C52 72 46 86 46 102 L44 178 C44 188 50 194 58 198 L60 240 L140 240 L142 198
           C150 194 156 188 156 178 L154 102 C154 86 148 72 135 70 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />

      {/* Left arm */}
      <path
        d="M46 102 C40 110 36 126 34 150 L32 204 C31 216 42 220 54 218 L58 216 L58 198
           C50 194 44 188 44 178 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />

      {/* Right arm */}
      <path
        d="M154 102 C160 110 164 126 166 150 L168 204 C169 216 158 220 146 218 L142 216 L142 198
           C150 194 156 188 156 178 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />

      {/* Left leg */}
      <path
        d="M60 240 L54 392 C53 402 66 405 80 403 L90 403 L94 240 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />

      {/* Right leg */}
      <path
        d="M140 240 L146 392 C147 402 134 405 120 403 L110 403 L106 240 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />

      {/* Details */}
      <line x1="100" y1="70" x2="100" y2="238" stroke="hsl(220 14% 30%)" strokeWidth="0.8" strokeDasharray="3 4" />
      <path d="M94 70 Q80 76 66 74" stroke="hsl(220 14% 32%)" strokeWidth="1" fill="none" />
      <path d="M106 70 Q120 76 134 74" stroke="hsl(220 14% 32%)" strokeWidth="1" fill="none" />
    </svg>
  );
}

// ── Hotspot ───────────────────────────────────────────────────────────────────
type SiteState = "selected" | "lastUsed" | "recent" | "default";

function getSiteState(
  name: string,
  selected: string,
  lastUsed: string | null,
  recentSet: Set<string>,
): SiteState {
  if (name === selected)  return "selected";
  if (name === lastUsed)  return "lastUsed";
  if (recentSet.has(name)) return "recent";
  return "default";
}

interface HotspotProps {
  site: SitePoint;
  state: SiteState;
  isSuggested: boolean;
  onClick: () => void;
}

function Hotspot({ site, state, isSuggested, onClick }: HotspotProps) {
  const colorMap: Record<SiteState, { bg: string; border: string; text: string; ring: string }> = {
    selected: { bg: "bg-primary",     border: "border-primary",    text: "text-primary-foreground", ring: "ring-2 ring-primary/40" },
    lastUsed: { bg: "bg-orange-500",  border: "border-orange-400", text: "text-white",               ring: "ring-2 ring-orange-400/40" },
    recent:   { bg: "bg-transparent", border: "border-slate-400",  text: "text-slate-400",           ring: "" },
    default:  { bg: "bg-transparent", border: "border-slate-600",  text: "text-slate-500",           ring: "" },
  };
  const c = colorMap[state];

  return (
    <div
      style={{
        position: "absolute",
        left: `${site.px * 100}%`,
        top: `${site.py * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: state === "selected" ? 10 : state === "lastUsed" ? 9 : 8,
      }}
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onClick}
        data-testid={`site-${site.name.toLowerCase().replace(/\s+/g, "-")}`}
        title={site.name}
        style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        className={`border-2 ${c.bg} ${c.border} ${c.text} ${c.ring} transition-all duration-150`}
      >
        <span style={{ fontSize: 7, fontWeight: 700, lineHeight: 1, textAlign: "center", letterSpacing: "-0.02em", userSelect: "none" }}>
          {site.shortLabel}
        </span>
      </motion.button>

      {/* Suggested badge */}
      {isSuggested && state !== "selected" && (
        <div
          style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          className="bg-emerald-500 border border-card"
        >
          <Sparkles size={8} className="text-white" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

// ── Duplicate-site warning dialog ─────────────────────────────────────────────
interface DuplicateWarningProps {
  siteName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function DuplicateWarning({ siteName, onCancel, onConfirm }: DuplicateWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className="mx-4 mb-2 bg-orange-500/10 border border-orange-400/30 rounded-2xl p-4"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
          <AlertTriangle size={15} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[14px] font-semibold leading-snug text-foreground/90">
            You used this site last time.
          </p>
          <p className="text-[12px] text-muted-foreground/70 mt-1 leading-relaxed">
            <span className="font-medium text-orange-400">{siteName}</span> was your most recent injection site. Rotating sites helps reduce tissue irritation.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          data-testid="button-duplicate-cancel"
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-card border border-border/60 text-muted-foreground transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          data-testid="button-duplicate-confirm"
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-orange-500 text-white transition-all active:scale-95"
        >
          Use Anyway
        </button>
      </div>
    </motion.div>
  );
}

// ── Main sheet ────────────────────────────────────────────────────────────────
interface BodyMapSheetProps {
  selected: string;
  onSelect: (site: string) => void;
  onClose: () => void;
}

function formatRelative(iso: string) {
  const diffH = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "yesterday";
  return `${diffD} days ago`;
}

export function BodyMapSheet({ selected, onSelect, onClose }: BodyMapSheetProps) {
  const { injections } = useInjections();
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null);

  const lastUsed     = injections.length > 0 ? injections[0].site : null;
  const lastUsedDate = injections.length > 0 ? injections[0].date : null;
  const suggested    = computeSuggestedSite(injections);

  const recentSet = new Set<string>();
  let count = 0;
  for (const inj of injections) {
    if (count >= 5) break;
    if (inj.site !== lastUsed && !recentSet.has(inj.site)) {
      recentSet.add(inj.site);
      count++;
    }
  }

  const handleHotspotTap = (name: string) => {
    if (name === lastUsed && injections.length > 0) {
      // Same site as last injection — require confirmation
      setPendingConfirm(name);
    } else {
      onSelect(name);
      setTimeout(onClose, 180);
    }
  };

  const handleConfirmAnyway = () => {
    if (pendingConfirm) {
      onSelect(pendingConfirm);
      setPendingConfirm(null);
      setTimeout(onClose, 180);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card border border-border/60 rounded-t-3xl flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="text-[17px] font-bold leading-tight">Select Injection Site</h2>
            <p className="text-[12px] text-muted-foreground/60 mt-0.5">Tap a location on the body map</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Rotation suggestion banner */}
        {suggested && (
          <div className="mx-5 mb-2 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5">
            <Sparkles size={14} className="text-emerald-400 flex-shrink-0" strokeWidth={2} />
            <p className="text-[12px] text-emerald-400/90 font-medium leading-snug">
              Suggested next site: <span className="font-bold">{suggested}</span>
            </p>
          </div>
        )}

        {/* Orientation labels */}
        <div className="flex justify-between px-6 pb-1">
          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">← Your Right</span>
          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Your Left →</span>
        </div>

        {/* Body map */}
        <div className="flex-1 overflow-hidden px-4 pb-1" style={{ minHeight: 0 }}>
          <div className="relative mx-auto" style={{ width: "100%", maxWidth: 230, aspectRatio: "200 / 410" }}>
            <BodyOutlineSVG />
            {SITE_POINTS.map((site) => {
              const state = getSiteState(site.name, selected, lastUsed, recentSet);
              return (
                <Hotspot
                  key={site.name}
                  site={site}
                  state={state}
                  isSuggested={site.name === suggested}
                  onClick={() => handleHotspotTap(site.name)}
                />
              );
            })}
          </div>
        </div>

        {/* Duplicate warning */}
        <AnimatePresence>
          {pendingConfirm && (
            <DuplicateWarning
              siteName={pendingConfirm}
              onCancel={() => setPendingConfirm(null)}
              onConfirm={handleConfirmAnyway}
            />
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 px-5 py-2 border-t border-border/40">
          <LegendItem color="bg-primary"     label="Selected"  />
          <LegendItem color="bg-orange-500"  label="Last Used" />
          <LegendItem color="bg-transparent border-2 border-slate-400" label="Recent" />
          <LegendItem color="bg-emerald-500" label="Suggested" />
        </div>

        {/* Last logged site */}
        {lastUsed && (
          <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Last Used</p>
              <p className="text-[14px] font-semibold mt-0.5">{lastUsed}</p>
            </div>
            {lastUsedDate && (
              <p className="text-[12px] text-muted-foreground/60">{formatRelative(lastUsedDate)}</p>
            )}
          </div>
        )}

        {/* Confirm bar */}
        {selected && !pendingConfirm && (
          <div className="px-5 pb-5">
            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-primary/70 uppercase tracking-widest">Selected</p>
                <p className="text-[15px] font-bold text-primary mt-0.5">{selected}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { onSelect(selected); onClose(); }}
                className="bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2 rounded-xl"
              >
                Confirm
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-[11px] text-muted-foreground/60 font-medium">{label}</span>
    </div>
  );
}
