import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Sparkles } from "lucide-react";
import { useInjections, Injection } from "@/hooks/useInjections";

// ── Site definitions ──────────────────────────────────────────────────────────
// px / py are fractions of viewBox width (200) and height (480)
interface SitePoint {
  name: string;
  px: number;
  py: number;
}

const SITE_POINTS: SitePoint[] = [
  // Patient's right = viewer's left arm
  { name: "Right Deltoid",  px: 38  / 200, py: 108 / 480 },
  // Patient's left  = viewer's right arm
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

// ── Medical-grade body silhouette SVG ─────────────────────────────────────────
// viewBox: 0 0 200 480  — front-facing neutral figure, no face features
function MedicalBodySVG() {
  const F = "hsl(215 22% 27%)";   // fill — warm dark slate
  const S = "hsl(215 22% 52%)";   // stroke — visible contrast
  const W = "1.8";                 // stroke width

  return (
    <svg
      viewBox="0 0 200 480"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      <defs>
        <filter id="body-inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feOffset dx="0" dy="2" result="offset" />
          <feComposite in="offset" in2="SourceAlpha" operator="in" result="shadow" />
          <feBlend in="SourceGraphic" in2="shadow" mode="multiply" />
        </filter>
      </defs>

      {/* ── Head (smooth oval, no face) ── */}
      <ellipse
        cx="100" cy="40" rx="26" ry="30"
        fill={F} stroke={S} strokeWidth={W}
      />

      {/* ── Neck ── */}
      <path
        d="M 88 68 C 86 74, 85 80, 86 86 L 114 86 C 115 80, 114 74, 112 68 Z"
        fill={F}
      />
      {/* neck-to-shoulder blend */}
      <path
        d="M 86 86 C 78 86, 68 88, 62 92 L 138 92 C 132 88, 122 86, 114 86 Z"
        fill={F}
      />

      {/* ── Torso ── wide at chest, nipped at waist, slight hip flare */}
      <path
        d="
          M 62 92
          C 48 94, 40 104, 40 118
          C 38 138, 38 162, 40 182
          C 42 200, 48 215, 50 232
          C 50 242, 50 252, 50 260
          L 150 260
          C 150 252, 150 242, 150 232
          C 152 215, 158 200, 160 182
          C 162 162, 162 138, 160 118
          C 160 104, 152 94, 138 92
          Z
        "
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* ── Left arm (viewer left = patient right) ── */}
      <path
        d="
          M 40 118
          C 32 128, 24 152, 22 176
          L 20 238
          C 18 254, 26 262, 38 262
          L 52 262
          C 60 260, 62 250, 60 236
          L 58 176
          C 58 154, 54 128, 50 118
          Z
        "
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* ── Right arm (viewer right = patient left) ── */}
      <path
        d="
          M 160 118
          C 168 128, 176 152, 178 176
          L 180 238
          C 182 254, 174 262, 162 262
          L 148 262
          C 140 260, 138 250, 140 236
          L 142 176
          C 142 154, 146 128, 150 118
          Z
        "
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* ── Left leg (viewer left = patient right) ── */}
      <path
        d="
          M 50 260
          C 44 278, 40 306, 38 334
          L 36 428
          C 34 446, 46 452, 64 450
          L 80 450
          C 88 448, 90 440, 88 430
          L 88 336
          C 90 308, 92 280, 94 262
          Z
        "
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* ── Right leg (viewer right = patient left) ── */}
      <path
        d="
          M 150 260
          C 156 278, 160 306, 162 334
          L 164 428
          C 166 446, 154 452, 136 450
          L 120 450
          C 112 448, 110 440, 112 430
          L 112 336
          C 110 308, 108 280, 106 262
          Z
        "
        fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
      />

      {/* ── Subtle body landmarks (very faint, medical style) ── */}
      {/* Clavicle lines */}
      <path
        d="M 88 92 Q 74 100 64 98"
        stroke={S} strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round"
      />
      <path
        d="M 112 92 Q 126 100 136 98"
        stroke={S} strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round"
      />
      {/* Center line — sternum/midline */}
      <line
        x1="100" y1="90" x2="100" y2="258"
        stroke={S} strokeWidth="0.7" strokeDasharray="4 5" opacity="0.3"
      />
      {/* Hip crease lines */}
      <path
        d="M 56 256 Q 72 268 94 264"
        stroke={S} strokeWidth="0.9" fill="none" opacity="0.35" strokeLinecap="round"
      />
      <path
        d="M 144 256 Q 128 268 106 264"
        stroke={S} strokeWidth="0.9" fill="none" opacity="0.35" strokeLinecap="round"
      />
    </svg>
  );
}

// ── Hotspot marker ────────────────────────────────────────────────────────────
type SiteState = "selected" | "lastUsed" | "recent" | "default";

function getSiteState(
  name: string,
  selected: string,
  lastUsed: string | null,
  recentSet: Set<string>,
): SiteState {
  if (name === selected)   return "selected";
  if (name === lastUsed)   return "lastUsed";
  if (recentSet.has(name)) return "recent";
  return "default";
}

const HOTSPOT_STYLES: Record<SiteState, React.CSSProperties> = {
  selected: {
    width: 26, height: 26, borderRadius: "50%",
    background: "hsl(174 72% 40%)",
    border: "2px solid hsl(174 72% 60%)",
    boxShadow: "0 0 0 5px hsl(174 72% 40% / 0.22), 0 0 18px hsl(174 72% 40% / 0.45)",
  },
  lastUsed: {
    width: 26, height: 26, borderRadius: "50%",
    background: "hsl(38 95% 55% / 0.18)",
    border: "2.5px solid hsl(38 95% 55%)",
    boxShadow: "0 0 0 4px hsl(38 95% 55% / 0.15)",
  },
  recent: {
    width: 26, height: 26, borderRadius: "50%",
    background: "hsl(220 13% 60% / 0.10)",
    border: "1.5px solid hsl(220 13% 58%)",
  },
  default: {
    width: 26, height: 26, borderRadius: "50%",
    background: "hsl(220 13% 60% / 0.06)",
    border: "1.5px solid hsl(220 13% 36%)",
  },
};

interface HotspotProps {
  site: SitePoint;
  state: SiteState;
  isSuggested: boolean;
  onClick: () => void;
}

function Hotspot({ site, state, isSuggested, onClick }: HotspotProps) {
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
      {/* Larger invisible touch target wrapping the visible circle */}
      <motion.button
        whileTap={{ scale: 0.82 }}
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
          style={HOTSPOT_STYLES[state]}
          animate={
            state === "selected"
              ? { scale: [1, 1.08, 1] }
              : {}
          }
          transition={{ duration: 0.4 }}
        />
      </motion.button>

      {/* Suggested badge — small emerald dot top-right */}
      {isSuggested && state !== "selected" && (
        <div
          style={{
            position: "absolute", top: 2, right: 2,
            width: 10, height: 10, borderRadius: "50%",
            background: "hsl(152 60% 46%)",
            border: "1.5px solid hsl(220 14% 15%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

// ── Duplicate site warning ────────────────────────────────────────────────────
function DuplicateWarning({
  siteName, onCancel, onConfirm,
}: {
  siteName: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className="mx-6 mb-2 rounded-2xl border border-orange-400/25 bg-orange-500/8 p-4"
    >
      <div className="flex items-start gap-3 mb-3.5">
        <div className="w-7 h-7 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
          <AlertTriangle size={13} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground/90 leading-snug">
            You used this site last time.
          </p>
          <p className="text-[12px] text-muted-foreground/65 mt-0.5 leading-relaxed">
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

// ── Legend item ───────────────────────────────────────────────────────────────
function LegendDot({ style, label }: { style: React.CSSProperties; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, ...style }} />
      <span className="text-[10px] text-muted-foreground/55 font-medium">{label}</span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRelative(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

// ── Main component ────────────────────────────────────────────────────────────
export interface BodyMapSheetProps {
  selected: string;
  onSelect: (site: string) => void;
  onClose: () => void;
}

// Body map container dimensions — keeps SVG and hotspots in the same space
const MAP_W = 148;
const MAP_H = Math.round(MAP_W * (480 / 200)); // = 355

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
      setTimeout(onClose, 180);
    }
  };

  const handleConfirm = () => {
    if (!pendingConfirm) return;
    onSelect(pendingConfirm);
    setPendingConfirm(null);
    setTimeout(onClose, 180);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card rounded-t-[28px] border border-border/50 flex flex-col overflow-y-auto"
        style={{ maxHeight: "92vh" }}
      >
        {/* ── Handle ── */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-9 h-[3px] bg-border/50 rounded-full" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-[18px] font-bold tracking-tight">Injection Site</h2>
            <p className="text-[12px] text-muted-foreground/55 mt-0.5">Tap to select · front view</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Suggestion banner ── */}
        {suggested && (
          <div className="mx-6 mb-3 flex-shrink-0 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/7 px-3.5 py-2.5">
            <Sparkles size={13} className="text-emerald-400 flex-shrink-0" strokeWidth={2} />
            <p className="text-[12px] font-medium text-emerald-400/85 leading-snug">
              Suggested: <span className="font-bold text-emerald-400">{suggested}</span>
            </p>
          </div>
        )}

        {/* ── Orientation labels ── */}
        <div className="flex justify-between px-8 mb-1 flex-shrink-0">
          <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest">← Your Right</span>
          <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Your Left →</span>
        </div>

        {/* ── Body map ── */}
        <div className="flex justify-center pb-2 flex-shrink-0">
          <div
            style={{
              position: "relative",
              width: MAP_W,
              height: MAP_H,
              flexShrink: 0,
            }}
          >
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

        {/* ── Legend ── */}
        <div className="flex items-center justify-center gap-4 px-6 py-3 border-t border-border/30 flex-shrink-0">
          <LegendDot
            style={{ background: "hsl(174 72% 40%)", boxShadow: "0 0 6px hsl(174 72% 40% / 0.5)" }}
            label="Selected"
          />
          <LegendDot
            style={{ background: "hsl(38 95% 55% / 0.2)", border: "1.5px solid hsl(38 95% 55%)" }}
            label="Last Used"
          />
          <LegendDot
            style={{ background: "transparent", border: "1.5px solid hsl(220 13% 58%)" }}
            label="Recent"
          />
          <LegendDot
            style={{ background: "hsl(152 60% 46%)" }}
            label="Suggested"
          />
        </div>

        {/* ── Duplicate warning ── */}
        <AnimatePresence>
          {pendingConfirm && (
            <DuplicateWarning
              siteName={pendingConfirm}
              onCancel={() => setPendingConfirm(null)}
              onConfirm={handleConfirm}
            />
          )}
        </AnimatePresence>

        {/* ── Last used footer ── */}
        {lastUsed && !pendingConfirm && (
          <div className="px-6 py-3 border-t border-border/30 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/45 uppercase tracking-widest mb-0.5">Last Used</p>
              <p className="text-[14px] font-semibold">{lastUsed}</p>
            </div>
            {lastUsedDate && (
              <p className="text-[12px] text-muted-foreground/50">{formatRelative(lastUsedDate)}</p>
            )}
          </div>
        )}

        {/* ── Selection confirm bar ── */}
        {selected && !pendingConfirm && (
          <div className="px-6 pb-6 pt-1 flex-shrink-0">
            <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest mb-0.5">Selected</p>
                <p className="text-[15px] font-bold text-primary leading-tight">{selected}</p>
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
