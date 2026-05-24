import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Sparkles } from "lucide-react";
import { useInjections, Injection } from "@/hooks/useInjections";

// ── Site definitions — 28 granular injection points ───────────────────────────
// px/py are fractions of viewBox (0 0 200 480)
interface SitePoint { name: string; px: number; py: number; }

// Coordinates verified against the body path geometry below.
// "viewer left" = patient's right side, "viewer right" = patient's left side.
const SITE_POINTS: SitePoint[] = [
  // ── Deltoids (outer shoulder / upper arm) ──
  { name: "R. Deltoid 1",        px:  38/200, py:  96/480 },
  { name: "R. Deltoid 2",        px:  28/200, py: 122/480 },
  { name: "L. Deltoid 1",        px: 162/200, py:  96/480 },
  { name: "L. Deltoid 2",        px: 172/200, py: 122/480 },
  // ── Outer arms (tricep / lateral) ──
  { name: "R. Outer Arm",        px:  24/200, py: 158/480 },
  { name: "L. Outer Arm",        px: 176/200, py: 158/480 },
  // ── Abdomen (right of centre) ──
  { name: "R. Abdomen 1",        px:  82/200, py: 158/480 },
  { name: "R. Abdomen 2",        px:  78/200, py: 186/480 },
  { name: "R. Abdomen 3",        px:  80/200, py: 210/480 },
  // ── Abdomen (left of centre) ──
  { name: "L. Abdomen 1",        px: 118/200, py: 158/480 },
  { name: "L. Abdomen 2",        px: 122/200, py: 186/480 },
  { name: "L. Abdomen 3",        px: 120/200, py: 210/480 },
  // ── Flanks / obliques (viewer left) ──
  { name: "R. Flank 1",          px:  52/200, py: 168/480 },
  { name: "R. Flank 2",          px:  48/200, py: 194/480 },
  { name: "R. Flank 3",          px:  52/200, py: 220/480 },
  // ── Flanks / obliques (viewer right) ──
  { name: "L. Flank 1",          px: 148/200, py: 168/480 },
  { name: "L. Flank 2",          px: 152/200, py: 194/480 },
  { name: "L. Flank 3",          px: 148/200, py: 220/480 },
  // ── Lower abdomen ──
  { name: "R. Lower Abdomen",    px:  74/200, py: 236/480 },
  { name: "L. Lower Abdomen",    px: 126/200, py: 236/480 },
  // ── Glutes (upper-outer hip) ──
  { name: "R. Glute 1",          px:  56/200, py: 256/480 },
  { name: "R. Glute 2",          px:  70/200, py: 278/480 },
  { name: "L. Glute 1",          px: 144/200, py: 256/480 },
  { name: "L. Glute 2",          px: 130/200, py: 278/480 },
  // ── Thighs ──
  { name: "R. Thigh 1",          px:  62/200, py: 314/480 },
  { name: "R. Thigh 2",          px:  66/200, py: 352/480 },
  { name: "L. Thigh 1",          px: 138/200, py: 314/480 },
  { name: "L. Thigh 2",          px: 134/200, py: 352/480 },
];

const ALL_SITE_NAMES = SITE_POINTS.map((s) => s.name);

// ── Rotation suggestion ───────────────────────────────────────────────────────
function computeSuggestedSite(injections: Injection[]): string | null {
  if (injections.length === 0) return ALL_SITE_NAMES[0];
  const lastUsedIdx: Record<string, number> = {};
  for (let i = 0; i < injections.length; i++) {
    const s = injections[i].site;
    if (!(s in lastUsedIdx)) lastUsedIdx[s] = i;
  }
  const never = ALL_SITE_NAMES.filter((s) => !(s in lastUsedIdx));
  if (never.length > 0) return never[0];
  const lastSite = injections[0].site;
  return (
    ALL_SITE_NAMES.filter((s) => s !== lastSite)
      .sort((a, b) => lastUsedIdx[b] - lastUsedIdx[a])[0] ?? null
  );
}

// ── Anatomy SVG — professional medical illustration adapted for dark mode ─────
const F  = "hsl(215 22% 24%)";   // body fill
const S  = "hsl(215 22% 54%)";   // body stroke
const SW = "1.8";
const MF = "hsl(195 75% 62% / 0.13)";   // muscle zone fill
const MS = "hsl(195 75% 62% / 0.28)";   // muscle zone stroke
const AD = "hsl(195 75% 62% / 0.22)";   // abs divider lines

function AnatomySVG() {
  return (
    <svg
      viewBox="0 0 200 480"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      {/* ── Body shapes ── */}

      {/* Head */}
      <ellipse cx="100" cy="36" rx="22" ry="25" fill={F} stroke={S} strokeWidth={SW} />

      {/* Neck */}
      <path d="M 93 59 C 90 65,89 71,88 76 L 112 76 C 111 71,110 65,107 59 Z" fill={F} />
      {/* Neck-to-shoulder blend */}
      <path d="M 88 74 C 80 75,68 78,60 84 L 140 84 C 132 78,120 75,112 74 Z" fill={F} />

      {/* Torso */}
      <path
        d="M 60 84
           C 48 86,42 94,42 110
           C 40 126,40 142,42 154
           C 44 170,50 188,52 207
           C 52 224,52 240,50 254
           L 150 254
           C 148 240,148 224,148 207
           C 150 188,156 170,158 154
           C 160 142,160 126,158 110
           C 158 94,152 86,140 84 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Left arm (viewer-left = patient-right) */}
      <path
        d="M 42 110
           C 34 120,26 142,24 164
           C 22 182,22 200,24 218
           C 26 230,32 238,42 238
           L 52 238
           C 58 236,60 228,58 216
           C 56 198,56 180,58 164
           C 60 144,58 124,54 112 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Right arm */}
      <path
        d="M 158 110
           C 166 120,174 142,176 164
           C 178 182,178 200,176 218
           C 174 230,168 238,158 238
           L 148 238
           C 142 236,140 228,142 216
           C 144 198,144 180,142 164
           C 140 144,142 124,146 112 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Left leg */}
      <path
        d="M 50 254
           C 44 270,40 296,40 322
           C 38 348,38 374,40 400
           C 40 416,48 424,64 422
           L 78 422
           C 84 420,86 414,84 404
           C 82 382,82 358,84 332
           C 86 306,88 280,94 258 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Right leg */}
      <path
        d="M 150 254
           C 156 270,160 296,160 322
           C 162 348,162 374,160 400
           C 160 416,152 424,136 422
           L 122 422
           C 116 420,114 414,116 404
           C 118 382,118 358,116 332
           C 114 306,112 280,106 258 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* ── Muscle zone highlights ── */}

      {/* Left pectoral */}
      <path
        d="M 48 92 C 44 97,42 110,46 124 C 50 136,62 144,76 142
           C 84 140,88 132,86 120 C 84 108,74 94,62 90 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />
      {/* Right pectoral */}
      <path
        d="M 152 92 C 156 97,158 110,154 124 C 150 136,138 144,124 142
           C 116 140,112 132,114 120 C 116 108,126 94,138 90 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />

      {/* Left deltoid muscle */}
      <path
        d="M 42 90 C 36 94,34 102,36 114 C 38 122,46 128,54 124
           C 60 120,62 112,60 104 C 58 96,50 88,44 88 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />
      {/* Right deltoid muscle */}
      <path
        d="M 158 90 C 164 94,166 102,164 114 C 162 122,154 128,146 124
           C 140 120,138 112,140 104 C 142 96,150 88,156 88 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />

      {/* Left outer arm (tricep) */}
      <path
        d="M 30 120 C 24 128,22 146,24 164 C 24 172,28 176,34 174
           C 40 172,44 164,44 150 C 44 134,40 120,34 118 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />
      {/* Right outer arm */}
      <path
        d="M 170 120 C 176 128,178 146,176 164 C 176 172,172 176,166 174
           C 160 172,156 164,156 150 C 156 134,160 120,166 118 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />

      {/* Rectus abdominis */}
      <path
        d="M 70 152 C 68 154,68 158,68 162 L 68 248
           C 68 252,70 254,74 254 L 126 254
           C 130 254,132 252,132 248 L 132 162
           C 132 158,132 154,130 152 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />
      {/* Abs horizontal dividers */}
      <line x1="68" y1="178" x2="132" y2="178" stroke={AD} strokeWidth="0.9" />
      <line x1="68" y1="204" x2="132" y2="204" stroke={AD} strokeWidth="0.9" />
      <line x1="68" y1="230" x2="132" y2="230" stroke={AD} strokeWidth="0.9" />
      {/* Abs vertical midline */}
      <line x1="100" y1="152" x2="100" y2="254" stroke={AD} strokeWidth="0.9" />

      {/* Left oblique */}
      <path
        d="M 48 160 C 44 166,44 180,48 196 C 52 210,60 218,66 216
           C 72 214,74 204,72 188 C 70 172,62 156,54 154 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />
      {/* Right oblique */}
      <path
        d="M 152 160 C 156 166,156 180,152 196 C 148 210,140 218,134 216
           C 128 214,126 204,128 188 C 130 172,138 156,146 154 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />

      {/* Left quadricep */}
      <path
        d="M 50 258 C 44 272,40 296,42 320 C 44 340,54 352,64 348
           C 72 344,74 330,72 310 C 70 290,64 266,56 258 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />
      {/* Right quadricep */}
      <path
        d="M 150 258 C 156 272,160 296,158 320 C 156 340,146 352,136 348
           C 128 344,126 330,128 310 C 130 290,136 266,144 258 Z"
        fill={MF} stroke={MS} strokeWidth="1"
      />

      {/* Clavicle lines */}
      <path d="M 88 84 Q 74 92,62 90" stroke={S} strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M 112 84 Q 126 92,138 90" stroke={S} strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Concentric-ring hotspot — matches reference visual style ──────────────────
type SiteState = "selected" | "lastUsed" | "recent" | "default";

function getSiteState(
  name: string, selected: string, lastUsed: string | null, recentSet: Set<string>,
): SiteState {
  if (name === selected)    return "selected";
  if (name === lastUsed)    return "lastUsed";
  if (recentSet.has(name))  return "recent";
  return "default";
}

interface RingColors { ring: string; dot: string; glow?: string; }
const RING_COLORS: Record<SiteState, RingColors> = {
  selected: {
    ring: "hsl(174 72% 52%)",
    dot:  "hsl(174 72% 46%)",
    glow: "0 0 0 5px hsl(174 72% 40% / 0.20), 0 0 18px hsl(174 72% 40% / 0.45)",
  },
  lastUsed: {
    ring: "hsl(38 95% 55%)",
    dot:  "hsl(38 95% 45%)",
    glow: "0 0 0 4px hsl(38 95% 55% / 0.18)",
  },
  recent: {
    ring: "hsl(220 10% 58%)",
    dot:  "hsl(220 10% 46%)",
  },
  default: {
    ring: "hsl(220 10% 40%)",
    dot:  "hsl(220 10% 30%)",
  },
};

function Hotspot({
  site, state, isSuggested, onClick,
}: {
  site: SitePoint; state: SiteState; isSuggested: boolean; onClick: () => void;
}) {
  const c = RING_COLORS[state];

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
      {/* 34 px touch target wrapping the visual */}
      <motion.button
        whileTap={{ scale: 0.70 }}
        transition={{ type: "spring", stiffness: 450, damping: 18 }}
        onClick={onClick}
        data-testid={`site-${site.name.toLowerCase().replace(/[\s.]+/g, "-")}`}
        title={site.name}
        style={{
          width: 34, height: 34, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: "none", padding: 0, cursor: "pointer",
        }}
      >
        {/* Concentric ring + dot */}
        <motion.div
          animate={state === "selected" ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            width: 20, height: 20, borderRadius: "50%",
            border: `2px solid ${c.ring}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: c.glow ?? "none",
            background: state === "selected"
              ? "hsl(174 72% 40% / 0.15)"
              : state === "lastUsed"
              ? "hsl(38 95% 55% / 0.12)"
              : "transparent",
          }}
        >
          <div
            style={{
              width: 9, height: 9, borderRadius: "50%",
              background: c.dot,
            }}
          />
        </motion.div>
      </motion.button>

      {/* Suggested badge */}
      {isSuggested && state !== "selected" && (
        <div
          style={{
            position: "absolute", top: 2, right: 2,
            width: 8, height: 8, borderRadius: "50%",
            background: "hsl(152 58% 44%)",
            border: "1.5px solid hsl(220 14% 12%)",
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
      className="mx-5 mb-3 rounded-2xl border border-orange-400/20 bg-orange-500/8 p-4"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-7 h-7 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
          <AlertTriangle size={13} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground/90">You used this site last time.</p>
          <p className="text-[12px] text-muted-foreground/55 mt-0.5 leading-relaxed">
            <span className="text-orange-400 font-medium">{siteName}</span> was your last injection. Rotating reduces irritation.
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

// ── Legend ────────────────────────────────────────────────────────────────────
function LegendItem({ ring, dot, label }: { ring: string; dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        border: `2px solid ${ring}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
      </div>
      <span className="text-[10px] font-medium" style={{ color: "hsl(220 10% 44%)" }}>{label}</span>
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

// ── Main component ────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: "hsl(220 20% 4% / 0.82)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      {/* Full-screen sheet — slides up from bottom */}
      <motion.div
        className="absolute inset-x-0 bottom-0 flex flex-col"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          top: 0,
          background: "hsl(220 16% 10%)",
          borderTop: "1px solid hsl(220 14% 20%)",
          boxShadow: "0 -16px 60px hsl(220 20% 3% / 0.7)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 9999, background: "hsl(220 14% 26%)" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-1 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-[19px] font-bold tracking-tight text-foreground">Injection Site</h2>
            <p className="text-[12px] font-medium mt-0.5" style={{ color: "hsl(220 10% 48%)" }}>
              Choose the area you used for this dose
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(220 14% 18%)", color: "hsl(220 10% 50%)" }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Suggestion banner */}
        {suggested && (
          <div
            className="mx-5 mb-2 flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2"
            style={{
              borderRadius: 14,
              border: "1px solid hsl(152 50% 38% / 0.25)",
              background: "hsl(152 50% 38% / 0.07)",
            }}
          >
            <Sparkles size={12} strokeWidth={2} style={{ color: "hsl(152 55% 52%)", flexShrink: 0 }} />
            <p className="text-[12px] font-medium leading-snug" style={{ color: "hsl(152 55% 52%)" }}>
              Suggested: <span className="font-bold">{suggested}</span>
            </p>
          </div>
        )}

        {/* Instruction */}
        <p
          className="text-center text-[10px] font-semibold tracking-widest uppercase mb-1 flex-shrink-0"
          style={{ color: "hsl(220 10% 36%)" }}
        >
          Tap an injection site
        </p>

        {/* Body map — flex-1 fills all remaining height */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden"
          style={{ minHeight: 0, paddingBottom: 2 }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              maxHeight: 420,
              aspectRatio: "200 / 480",
              flexShrink: 0,
            }}
          >
            <AnatomySVG />
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

        {/* Selected pill */}
        <div
          className="flex justify-center flex-shrink-0"
          style={{ minHeight: 44, display: "flex", alignItems: "center" }}
        >
          <AnimatePresence mode="wait">
            {selected && !pendingConfirm && (
              <motion.button
                key={selected}
                initial={{ opacity: 0, scale: 0.86, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.90, y: 3 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                onClick={() => { onSelect(selected); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  paddingLeft: 20, paddingRight: 20, paddingTop: 9, paddingBottom: 9,
                  borderRadius: 9999,
                  background: "hsl(174 72% 40%)",
                  boxShadow: "0 0 20px hsl(174 72% 40% / 0.38)",
                  border: "none", cursor: "pointer",
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "hsl(174 72% 84%)", opacity: 0.9 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(174 72% 96%)", letterSpacing: "-0.01em" }}>
                  {selected}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div
          className="flex items-center justify-center gap-4 px-5 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid hsl(220 14% 16%)" }}
        >
          <LegendItem
            ring="hsl(174 72% 52%)" dot="hsl(174 72% 46%)" label="Selected"
          />
          <LegendItem
            ring="hsl(38 95% 55%)" dot="hsl(38 95% 45%)" label="Last Used"
          />
          <LegendItem
            ring="hsl(220 10% 58%)" dot="hsl(220 10% 46%)" label="Recent"
          />
          <div className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(152 58% 44%)", flexShrink: 0 }} />
            <span className="text-[10px] font-medium" style={{ color: "hsl(220 10% 44%)" }}>Suggested</span>
          </div>
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
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                style={{ color: "hsl(220 10% 36%)" }}>Last Used</p>
              <p className="text-[14px] font-semibold" style={{ color: "hsl(220 10% 78%)" }}>{lastUsed}</p>
            </div>
            {lastUsedDate && (
              <p className="text-[12px]" style={{ color: "hsl(220 10% 40%)" }}>{formatRelative(lastUsedDate)}</p>
            )}
          </div>
        )}

        <div className="flex-shrink-0" style={{ height: "env(safe-area-inset-bottom, 10px)" }} />
      </motion.div>
    </div>
  );
}
