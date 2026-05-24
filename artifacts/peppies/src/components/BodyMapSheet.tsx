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
  { name: "R. Deltoid 1",        px:  38/200, py: 116/480 },
  { name: "R. Deltoid 2",        px:  32/200, py: 140/480 },
  { name: "L. Deltoid 1",        px: 162/200, py: 116/480 },
  { name: "L. Deltoid 2",        px: 168/200, py: 140/480 },
  // ── Outer arms (tricep / lateral) ──
  { name: "R. Outer Arm",        px:  30/200, py: 180/480 },
  { name: "L. Outer Arm",        px: 170/200, py: 180/480 },
  // ── Abdomen (right of centre) ──
  { name: "R. Abdomen 1",        px:  84/200, py: 158/480 },
  { name: "R. Abdomen 2",        px:  82/200, py: 186/480 },
  { name: "R. Abdomen 3",        px:  84/200, py: 212/480 },
  // ── Abdomen (left of centre) ──
  { name: "L. Abdomen 1",        px: 116/200, py: 158/480 },
  { name: "L. Abdomen 2",        px: 118/200, py: 186/480 },
  { name: "L. Abdomen 3",        px: 116/200, py: 212/480 },
  // ── Flanks / obliques (viewer left) ──
  { name: "R. Flank 1",          px:  60/200, py: 168/480 },
  { name: "R. Flank 2",          px:  58/200, py: 194/480 },
  { name: "R. Flank 3",          px:  60/200, py: 220/480 },
  // ── Flanks / obliques (viewer right) ──
  { name: "L. Flank 1",          px: 140/200, py: 168/480 },
  { name: "L. Flank 2",          px: 142/200, py: 194/480 },
  { name: "L. Flank 3",          px: 140/200, py: 220/480 },
  // ── Lower abdomen ──
  { name: "R. Lower Abdomen",    px:  82/200, py: 240/480 },
  { name: "L. Lower Abdomen",    px: 118/200, py: 240/480 },
  // ── Upper hip / glute crest ──
  { name: "R. Glute 1",          px:  66/200, py: 260/480 },
  { name: "R. Glute 2",          px:  78/200, py: 282/480 },
  { name: "L. Glute 1",          px: 134/200, py: 260/480 },
  { name: "L. Glute 2",          px: 122/200, py: 282/480 },
  // ── Thighs ──
  { name: "R. Thigh 1",          px:  78/200, py: 314/480 },
  { name: "R. Thigh 2",          px:  82/200, py: 354/480 },
  { name: "L. Thigh 1",          px: 122/200, py: 314/480 },
  { name: "L. Thigh 2",          px: 118/200, py: 354/480 },
];

const ALL_SITE_NAMES = SITE_POINTS.map((s) => s.name);

// ── Rotation suggestion ───────────────────────────────────────────────────────
function computeSuggestedSite(injections: Injection[]): string | null {
  // Cycle/rotate so the suggestion changes after every log instead of pinning to one site.
  const rotation = injections.length;

  if (injections.length === 0) {
    return ALL_SITE_NAMES[rotation % ALL_SITE_NAMES.length];
  }

  const lastUsedIdx: Record<string, number> = {};
  for (let i = 0; i < injections.length; i++) {
    const s = injections[i].site;
    if (!(s in lastUsedIdx)) lastUsedIdx[s] = i;
  }

  const lastSite = injections[0].site;
  const recentSites = new Set(injections.slice(0, 3).map((i) => i.site));

  // Prefer sites never used — rotate through them so each log shifts the suggestion.
  const never = ALL_SITE_NAMES.filter((s) => !(s in lastUsedIdx));
  if (never.length > 0) {
    return never[rotation % never.length];
  }

  // All sites used — pick from the stalest half, excluding the last few used,
  // and rotate within that pool so the suggestion changes each time.
  const stale = ALL_SITE_NAMES
    .filter((s) => s !== lastSite && !recentSites.has(s))
    .sort((a, b) => lastUsedIdx[b] - lastUsedIdx[a]);

  const pool = stale.length > 0
    ? stale.slice(0, Math.max(4, Math.ceil(stale.length / 2)))
    : ALL_SITE_NAMES.filter((s) => s !== lastSite);

  return pool[rotation % pool.length] ?? null;
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
      {/* ── Body shapes — anatomically proportioned humanoid silhouette ── */}

      {/* Head — slightly elongated ovoid */}
      <ellipse cx="100" cy="34" rx="18" ry="22" fill={F} stroke={S} strokeWidth={SW} />

      {/* Neck + trapezius slope into shoulders */}
      <path
        d="M 92 54
           C 90 60,89 66,88 72
           C 80 74,72 78,64 84
           C 56 88,50 94,46 100
           L 154 100
           C 150 94,144 88,136 84
           C 128 78,120 74,112 72
           C 111 66,110 60,108 54 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Torso — V-tapered chest into waist, then flaring slightly to hips */}
      <path
        d="M 46 100
           C 42 116,42 134,44 150
           C 46 168,50 186,52 204
           C 52 222,52 240,54 256
           C 56 268,62 274,72 274
           L 128 274
           C 138 274,144 268,146 256
           C 148 240,148 222,148 204
           C 150 186,154 168,156 150
           C 158 134,158 116,154 100 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Left arm — deltoid bulge → tapered upper arm → forearm → relaxed hand */}
      <path
        d="M 46 100
           C 36 104,30 116,28 134
           C 26 152,26 168,28 184
           C 30 198,32 212,32 226
           C 32 240,34 252,38 262
           C 40 270,42 276,42 282
           C 42 286,46 288,50 286
           C 54 284,56 280,56 274
           C 56 268,54 262,54 256
           C 54 240,54 222,54 204
           C 56 186,60 168,60 150
           C 60 134,58 116,54 102 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Right arm — mirror */}
      <path
        d="M 154 100
           C 164 104,170 116,172 134
           C 174 152,174 168,172 184
           C 170 198,168 212,168 226
           C 168 240,166 252,162 262
           C 160 270,158 276,158 282
           C 158 286,154 288,150 286
           C 146 284,144 280,144 274
           C 144 268,146 262,146 256
           C 146 240,146 222,146 204
           C 144 186,140 168,140 150
           C 140 134,142 116,146 102 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Left leg — thigh → knee → calf bulge → ankle → foot */}
      <path
        d="M 72 274
           C 66 290,62 312,62 336
           C 60 358,60 378,62 398
           C 64 414,66 430,68 444
           C 68 454,70 462,72 466
           C 74 470,82 470,86 466
           C 88 462,90 454,90 444
           C 92 430,92 414,92 398
           C 92 378,92 358,94 336
           C 96 312,98 290,100 274 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Right leg — mirror */}
      <path
        d="M 128 274
           C 134 290,138 312,138 336
           C 140 358,140 378,138 398
           C 136 414,134 430,132 444
           C 132 454,130 462,128 466
           C 126 470,118 470,114 466
           C 112 462,110 454,110 444
           C 108 430,108 414,108 398
           C 108 378,108 358,106 336
           C 104 312,102 290,100 274 Z"
        fill={F} stroke={S} strokeWidth={SW} strokeLinejoin="round"
      />

      {/* Subtle knee + calf shading */}
      <ellipse cx="76" cy="356" rx="9" ry="3.5" fill="hsl(215 22% 20%)" opacity="0.55" />
      <ellipse cx="124" cy="356" rx="9" ry="3.5" fill="hsl(215 22% 20%)" opacity="0.55" />
      {/* Inner thigh divider */}
      <line x1="100" y1="278" x2="100" y2="346" stroke="hsl(215 22% 18%)" strokeWidth="1.2" opacity="0.55" />

      {/* Centre line — subtle sternum/nasal indicator */}
      <line x1="100" y1="56" x2="100" y2="76" stroke={S} strokeWidth="0.8" opacity="0.35" />

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
    ring: "hsl(265 75% 68%)",
    dot:  "hsl(265 70% 58%)",
    glow: "0 0 0 3px hsl(265 70% 58% / 0.16)",
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
  // When a site is "suggested" (and not already selected/last-used), paint the
  // hotspot itself green so the indicator lives on the dot — no floating badge.
  const showSuggested = isSuggested && (state === "default" || state === "recent");
  const c = showSuggested
    ? {
        ring: "hsl(152 60% 50%)",
        dot:  "hsl(152 60% 44%)",
        glow: "0 0 0 4px hsl(152 60% 44% / 0.18), 0 0 14px hsl(152 60% 44% / 0.35)",
      }
    : RING_COLORS[state];

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
          width: 26, height: 26, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: "none", padding: 0, cursor: "pointer",
        }}
      >
        {/* Concentric ring + dot */}
        <motion.div
          animate={state === "selected" ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            width: 16, height: 16, borderRadius: "50%",
            border: "1.75px solid " + c.ring,
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
              width: 7, height: 7, borderRadius: "50%",
              background: c.dot,
            }}
          />
        </motion.div>
      </motion.button>

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
          paddingBottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
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
              maxHeight: 500,
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
            ring="hsl(265 75% 68%)" dot="hsl(265 70% 58%)" label="Recent"
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

      </motion.div>
    </div>
  );
}
