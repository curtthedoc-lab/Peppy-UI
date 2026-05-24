import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Sparkles } from "lucide-react";
import { useInjections, Injection } from "@/hooks/useInjections";

// ── Site definitions ──────────────────────────────────────────────────────────
interface SitePoint {
  name: string;
  px: number; // fraction of viewBox width  (200)
  py: number; // fraction of viewBox height (480)
}

const SITE_POINTS: SitePoint[] = [
  { name: "Right Deltoid",  px: 38  / 200, py: 108 / 480 },
  { name: "Left Deltoid",   px: 162 / 200, py: 108 / 480 },
  { name: "Right Abdomen",  px: 78  / 200, py: 196 / 480 },
  { name: "Left Abdomen",   px: 122 / 200, py: 196 / 480 },
  { name: "Right Flank",    px: 54  / 200, py: 214 / 480 },
  { name: "Left Flank",     px: 146 / 200, py: 214 / 480 },
  { name: "Right Glute",    px: 64  / 200, py: 266 / 480 },
  { name: "Left Glute",     px: 136 / 200, py: 266 / 480 },
  { name: "Right Thigh",    px: 72  / 200, py: 348 / 480 },
  { name: "Left Thigh",     px: 128 / 200, py: 348 / 480 },
];

const ALL_SITE_NAMES = SITE_POINTS.map((s) => s.name);

// ── Rotation suggestion ───────────────────────────────────────────────────────
function computeSuggestedSite(injections: Injection[]): string | null {
  if (injections.length === 0) return ALL_SITE_NAMES[0];
  const lastUsedIndex: Record<string, number> = {};
  for (let i = 0; i < injections.length; i++) {
    const s = injections[i].site;
    if (!(s in lastUsedIndex)) lastUsedIndex[s] = i;
  }
  const neverUsed = ALL_SITE_NAMES.filter((s) => !(s in lastUsedIndex));
  if (neverUsed.length > 0) return neverUsed[0];
  const lastSite = injections[0].site;
  return (
    ALL_SITE_NAMES
      .filter((s) => s !== lastSite)
      .sort((a, b) => lastUsedIndex[b] - lastUsedIndex[a])[0] ?? null
  );
}

// ── Medical body silhouette ───────────────────────────────────────────────────
function MedicalBodySVG() {
  const F = "hsl(215 22% 27%)";
  const S = "hsl(215 22% 52%)";
  const W = "1.8";

  return (
    <svg
      viewBox="0 0 200 480"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      {/* Head */}
      <ellipse cx="100" cy="40" rx="26" ry="30" fill={F} stroke={S} strokeWidth={W} />

      {/* Neck */}
      <path d="M 88 68 C 86 74, 85 80, 86 86 L 114 86 C 115 80, 114 74, 112 68 Z" fill={F} />
      <path d="M 86 86 C 78 86, 68 88, 62 92 L 138 92 C 132 88, 122 86, 114 86 Z" fill={F} />

      {/* Torso — wide chest, nipped waist, slight hip */}
      <path
        d="M 62 92
           C 48 94, 40 104, 40 118
           C 38 138, 38 162, 40 182
           C 42 200, 48 215, 50 232
           C 50 242, 50 252, 50 260
           L 150 260
           C 150 252, 150 242, 150 232
           C 152 215, 158 200, 160 182
           C 162 162, 162 138, 160 118
           C 160 104, 152 94, 138 92 Z"
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* Left arm (viewer left = patient right) */}
      <path
        d="M 40 118
           C 32 128, 24 152, 22 176
           L 20 238
           C 18 254, 26 262, 38 262
           L 52 262
           C 60 260, 62 250, 60 236
           L 58 176
           C 58 154, 54 128, 50 118 Z"
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* Right arm (viewer right = patient left) */}
      <path
        d="M 160 118
           C 168 128, 176 152, 178 176
           L 180 238
           C 182 254, 174 262, 162 262
           L 148 262
           C 140 260, 138 250, 140 236
           L 142 176
           C 142 154, 146 128, 150 118 Z"
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* Left leg */}
      <path
        d="M 50 260
           C 44 278, 40 306, 38 334
           L 36 428
           C 34 446, 46 452, 64 450
           L 80 450
           C 88 448, 90 440, 88 430
           L 88 336
           C 90 308, 92 280, 94 262 Z"
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* Right leg */}
      <path
        d="M 150 260
           C 156 278, 160 306, 162 334
           L 164 428
           C 166 446, 154 452, 136 450
           L 120 450
           C 112 448, 110 440, 112 430
           L 112 336
           C 110 308, 108 280, 106 262 Z"
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* Clavicle lines */}
      <path d="M 88 92 Q 74 100 64 98" stroke={S} strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M 112 92 Q 126 100 136 98" stroke={S} strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* Midline */}
      <line x1="100" y1="90" x2="100" y2="258" stroke={S} strokeWidth="0.7" strokeDasharray="4 5" opacity="0.25" />
      {/* Hip creases */}
      <path d="M 56 256 Q 72 268 94 264" stroke={S} strokeWidth="0.9" fill="none" opacity="0.3" strokeLinecap="round" />
      <path d="M 144 256 Q 128 268 106 264" stroke={S} strokeWidth="0.9" fill="none" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Hotspot ───────────────────────────────────────────────────────────────────
type SiteState = "selected" | "lastUsed" | "recent" | "default";

function getSiteState(
  name: string, selected: string, lastUsed: string | null, recentSet: Set<string>,
): SiteState {
  if (name === selected)    return "selected";
  if (name === lastUsed)    return "lastUsed";
  if (recentSet.has(name))  return "recent";
  return "default";
}

const DOT_STYLE: Record<SiteState, React.CSSProperties> = {
  selected: {
    width: 24, height: 24, borderRadius: "50%",
    background: "hsl(174 72% 42%)",
    border: "2px solid hsl(174 72% 65%)",
    boxShadow: "0 0 0 6px hsl(174 72% 40% / 0.20), 0 0 20px hsl(174 72% 40% / 0.50)",
  },
  lastUsed: {
    width: 24, height: 24, borderRadius: "50%",
    background: "hsl(38 95% 55% / 0.16)",
    border: "2.5px solid hsl(38 95% 55%)",
    boxShadow: "0 0 0 4px hsl(38 95% 55% / 0.12)",
  },
  recent: {
    width: 24, height: 24, borderRadius: "50%",
    background: "hsl(220 13% 60% / 0.10)",
    border: "1.5px solid hsl(220 13% 55%)",
  },
  default: {
    width: 24, height: 24, borderRadius: "50%",
    background: "hsl(220 13% 60% / 0.05)",
    border: "1.5px solid hsl(220 13% 34%)",
  },
};

function Hotspot({
  site, state, isSuggested, onClick,
}: {
  site: SitePoint; state: SiteState; isSuggested: boolean; onClick: () => void;
}) {
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
      {/* 42 px invisible touch target */}
      <motion.button
        whileTap={{ scale: 0.75 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={onClick}
        data-testid={`site-${site.name.toLowerCase().replace(/\s+/g, "-")}`}
        title={site.name}
        style={{
          width: 42, height: 42, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: "none", padding: 0, cursor: "pointer",
        }}
      >
        <motion.div
          animate={state === "selected" ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={DOT_STYLE[state]}
        />
      </motion.button>

      {/* Suggested dot badge */}
      {isSuggested && state !== "selected" && (
        <div
          style={{
            position: "absolute", top: 4, right: 4,
            width: 9, height: 9, borderRadius: "50%",
            background: "hsl(152 58% 44%)",
            border: "1.5px solid hsl(220 14% 13%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

// ── Duplicate warning ─────────────────────────────────────────────────────────
function DuplicateWarning({
  siteName, onCancel, onConfirm,
}: {
  siteName: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
      className="mx-6 mb-3 rounded-2xl border border-orange-400/22 bg-orange-500/7 p-4"
    >
      <div className="flex items-start gap-3 mb-3.5">
        <div className="w-7 h-7 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
          <AlertTriangle size={13} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground/90 leading-snug">
            You used this site last time.
          </p>
          <p className="text-[12px] text-muted-foreground/60 mt-0.5 leading-relaxed">
            <span className="text-orange-400 font-medium">{siteName}</span> was your last injection. Rotating sites reduces irritation.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          data-testid="button-duplicate-cancel"
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-card border border-border/50 text-muted-foreground active:scale-95 transition-transform"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          data-testid="button-duplicate-confirm"
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-orange-500 text-white active:scale-95 transition-transform"
        >
          Use Anyway
        </button>
      </div>
    </motion.div>
  );
}

// ── Legend row ────────────────────────────────────────────────────────────────
function LegendDot({ dotStyle, label }: { dotStyle: React.CSSProperties; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0, ...dotStyle }} />
      <span className="text-[10px] text-muted-foreground/45 font-medium tracking-wide">{label}</span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRelative(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

// Body map fixed pixel dimensions (SVG viewBox is 200 × 480)
const MAP_W = 148;
const MAP_H = Math.round(MAP_W * (480 / 200)); // 355

// ── Main sheet ────────────────────────────────────────────────────────────────
export interface BodyMapSheetProps {
  selected: string;
  onSelect: (site: string) => void;
  onClose: () => void;
}

export function BodyMapSheet({ selected, onSelect, onClose }: BodyMapSheetProps) {
  const { injections } = useInjections();
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null);

  const lastUsed     = injections[0]?.site ?? null;
  const lastUsedDate = injections[0]?.date ?? null;
  const suggested    = computeSuggestedSite(injections);

  const recentSet = new Set<string>();
  let rc = 0;
  for (const inj of injections) {
    if (rc >= 5) break;
    if (inj.site !== lastUsed && !recentSet.has(inj.site)) { recentSet.add(inj.site); rc++; }
  }

  const handleTap = (name: string) => {
    if (name === lastUsed && injections.length > 0) {
      setPendingConfirm(name);
    } else {
      onSelect(name);
      // brief pause so the pill + glow are visible before the sheet closes
      setTimeout(onClose, 340);
    }
  };

  const handleConfirm = () => {
    if (!pendingConfirm) return;
    onSelect(pendingConfirm);
    setPendingConfirm(null);
    setTimeout(onClose, 340);
  };

  return (
    // ── Backdrop ──
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "hsl(220 20% 4% / 0.78)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* ── Sheet ── */}
      <motion.div
        initial={{ y: 160, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 160, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] flex flex-col overflow-y-auto"
        style={{
          maxHeight: "94vh",
          background: "hsl(220 16% 10%)",
          borderRadius: "32px 32px 0 0",
          border: "1px solid hsl(220 14% 20%)",
          boxShadow: "0 -24px 80px hsl(220 20% 3% / 0.85), 0 -4px 16px hsl(220 20% 3% / 0.5)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 9999, background: "hsl(220 14% 28%)" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[19px] font-bold tracking-tight text-foreground leading-tight">
              Injection Site
            </h2>
            <p className="text-[12px] mt-1 font-medium" style={{ color: "hsl(220 10% 52%)" }}>
              Choose the area you used for this dose
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(220 14% 18%)", color: "hsl(220 10% 52%)" }}
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Suggestion banner */}
        {suggested && (
          <div
            className="mx-6 mb-3 flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5"
            style={{
              borderRadius: 16,
              border: "1px solid hsl(152 50% 38% / 0.25)",
              background: "hsl(152 50% 38% / 0.07)",
            }}
          >
            <Sparkles size={13} strokeWidth={2} style={{ color: "hsl(152 55% 52%)", flexShrink: 0 }} />
            <p className="text-[12px] font-medium leading-snug" style={{ color: "hsl(152 55% 52%)" }}>
              Suggested: <span className="font-bold">{suggested}</span>
            </p>
          </div>
        )}

        {/* Instruction label */}
        <p
          className="text-center text-[11px] font-semibold tracking-widest uppercase mb-2 flex-shrink-0"
          style={{ color: "hsl(220 10% 40%)" }}
        >
          Tap an injection site
        </p>

        {/* Body map */}
        <div className="flex justify-center pb-3 flex-shrink-0">
          <div style={{ position: "relative", width: MAP_W, height: MAP_H, flexShrink: 0 }}>
            <MedicalBodySVG />
            {SITE_POINTS.map((site) => {
              const state = getSiteState(site.name, selected, lastUsed, recentSet);
              return (
                <Hotspot
                  key={site.name}
                  site={site}
                  state={state}
                  isSuggested={site.name === suggested}
                  onClick={() => handleTap(site.name)}
                />
              );
            })}
          </div>
        </div>

        {/* Selected pill — appears below body map after tap */}
        <div className="flex justify-center mb-3 flex-shrink-0" style={{ minHeight: 36 }}>
          <AnimatePresence mode="wait">
            {selected && !pendingConfirm && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, scale: 0.88, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 3 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  paddingLeft: 18,
                  paddingRight: 18,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 9999,
                  background: "hsl(174 72% 40%)",
                  boxShadow: "0 0 20px hsl(174 72% 40% / 0.35)",
                  cursor: "pointer",
                }}
                onClick={() => { onSelect(selected); onClose(); }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "hsl(174 72% 80%)", opacity: 0.8 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(174 72% 96%)", letterSpacing: "-0.01em" }}>
                  Selected: {selected}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div
          className="flex items-center justify-center gap-4 px-6 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid hsl(220 14% 16%)" }}
        >
          <LegendDot
            dotStyle={{ background: "hsl(174 72% 40%)", boxShadow: "0 0 6px hsl(174 72% 40% / 0.55)" }}
            label="Selected"
          />
          <LegendDot
            dotStyle={{ background: "transparent", border: "1.5px solid hsl(38 95% 55%)" }}
            label="Last Used"
          />
          <LegendDot
            dotStyle={{ background: "transparent", border: "1.5px solid hsl(220 13% 55%)" }}
            label="Recent"
          />
          <LegendDot
            dotStyle={{ background: "hsl(152 58% 44%)" }}
            label="Suggested"
          />
        </div>

        {/* Duplicate warning */}
        <AnimatePresence>
          {pendingConfirm && (
            <DuplicateWarning
              siteName={pendingConfirm}
              onCancel={() => setPendingConfirm(null)}
              onConfirm={handleConfirm}
            />
          )}
        </AnimatePresence>

        {/* Last used footer */}
        {lastUsed && !pendingConfirm && (
          <div
            className="px-6 py-3 flex items-center justify-between flex-shrink-0"
            style={{ borderTop: "1px solid hsl(220 14% 16%)" }}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "hsl(220 10% 38%)" }}>
                Last Used
              </p>
              <p className="text-[14px] font-semibold text-foreground/85">{lastUsed}</p>
            </div>
            {lastUsedDate && (
              <p className="text-[12px]" style={{ color: "hsl(220 10% 42%)" }}>
                {formatRelative(lastUsedDate)}
              </p>
            )}
          </div>
        )}

        {/* Bottom safe area spacing */}
        <div className="h-5 flex-shrink-0" />
      </motion.div>
    </motion.div>
  );
}
