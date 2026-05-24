import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useInjections } from "@/hooks/useInjections";

interface SitePoint {
  name: string;
  /** x as percentage of SVG viewBox width (200) */
  px: number;
  /** y as percentage of SVG viewBox height (410) */
  py: number;
  shortLabel: string;
}

const SITE_POINTS: SitePoint[] = [
  // Patient's right = viewer's left
  { name: "Right Deltoid",  px: 44  / 200, py: 106 / 410, shortLabel: "R.Delt" },
  // Patient's left = viewer's right
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

function BodyOutlineSVG() {
  const fill = "hsl(220 14% 22%)";
  const stroke = "hsl(220 14% 34%)";
  const sw = "1.5";

  return (
    <svg
      viewBox="0 0 200 410"
      className="w-full h-full"
      style={{ display: "block" }}
      aria-hidden
    >
      {/* Head */}
      <circle cx="100" cy="34" r="25" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Eyes */}
      <circle cx="92"  cy="30" r="2.5" fill="hsl(220 14% 42%)" />
      <circle cx="108" cy="30" r="2.5" fill="hsl(220 14% 42%)" />
      {/* Mouth */}
      <path d="M95 40 Q100 44 105 40" stroke="hsl(220 14% 42%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Neck */}
      <path d="M93 58 L93 70 L107 70 L107 58 Z" fill={fill} />

      {/* Torso (includes shoulders curving to waist) */}
      <path
        d="M65 70
           C 52 72, 46 86, 46 102
           L 44 178
           C 44 188, 50 194, 58 198
           L 60 240
           L 140 240
           L 142 198
           C 150 194, 156 188, 156 178
           L 154 102
           C 154 86, 148 72, 135 70
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />

      {/* Left arm (viewer left = patient right) */}
      <path
        d="M46 102
           C 40 110, 36 126, 34 150
           L 32 204
           C 31 216, 42 220, 54 218
           L 58 216
           L 58 198
           C 50 194, 44 188, 44 178
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />

      {/* Right arm (viewer right = patient left) */}
      <path
        d="M154 102
           C 160 110, 164 126, 166 150
           L 168 204
           C 169 216, 158 220, 146 218
           L 142 216
           L 142 198
           C 150 194, 156 188, 156 178
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />

      {/* Left leg (viewer left = patient right) */}
      <path
        d="M60 240
           L 54 392
           C 53 402, 66 405, 80 403
           L 90 403
           L 94 240
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />

      {/* Right leg (viewer right = patient left) */}
      <path
        d="M140 240
           L 146 392
           C 147 402, 134 405, 120 403
           L 110 403
           L 106 240
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />

      {/* Subtle torso center line */}
      <line x1="100" y1="70" x2="100" y2="238" stroke="hsl(220 14% 30%)" strokeWidth="0.8" strokeDasharray="3 4" />

      {/* Clavicle lines */}
      <path d="M94 70 Q80 76 66 74" stroke="hsl(220 14% 32%)" strokeWidth="1" fill="none" />
      <path d="M106 70 Q120 76 134 74" stroke="hsl(220 14% 32%)" strokeWidth="1" fill="none" />
    </svg>
  );
}

function getSiteState(
  name: string,
  selected: string,
  lastUsed: string | null,
  recentSet: Set<string>,
): "selected" | "lastUsed" | "recent" | "default" {
  if (name === selected) return "selected";
  if (name === lastUsed) return "lastUsed";
  if (recentSet.has(name)) return "recent";
  return "default";
}

interface HotspotProps {
  site: SitePoint;
  state: "selected" | "lastUsed" | "recent" | "default";
  onClick: () => void;
}

function Hotspot({ site, state, onClick }: HotspotProps) {
  const colorMap = {
    selected: {
      bg: "bg-primary",
      border: "border-primary",
      text: "text-primary-foreground",
      ring: "ring-2 ring-primary/40",
    },
    lastUsed: {
      bg: "bg-orange-500",
      border: "border-orange-400",
      text: "text-white",
      ring: "ring-2 ring-orange-400/40",
    },
    recent: {
      bg: "bg-transparent",
      border: "border-slate-400",
      text: "text-slate-400",
      ring: "",
    },
    default: {
      bg: "bg-transparent",
      border: "border-slate-600",
      text: "text-slate-500",
      ring: "",
    },
  }[state];

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      animate={state === "selected" ? { scale: [1, 1.12, 1] } : {}}
      onClick={onClick}
      data-testid={`site-${site.name.toLowerCase().replace(/\s+/g, "-")}`}
      title={site.name}
      style={{
        position: "absolute",
        left: `${site.px * 100}%`,
        top: `${site.py * 100}%`,
        transform: "translate(-50%, -50%)",
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        zIndex: state === "selected" ? 10 : state === "lastUsed" ? 9 : 8,
      }}
      className={`border-2 ${colorMap.bg} ${colorMap.border} ${colorMap.text} ${colorMap.ring} transition-all duration-150`}
    >
      <span style={{ fontSize: 7, fontWeight: 700, lineHeight: 1, textAlign: "center", letterSpacing: "-0.02em", userSelect: "none", maxWidth: 28 }}>
        {site.shortLabel}
      </span>
    </motion.button>
  );
}

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

  const lastUsed = injections.length > 0 ? injections[0].site : null;
  const lastUsedDate = injections.length > 0 ? injections[0].date : null;

  // Collect last 5 unique sites (excluding the most recent)
  const recentSet = new Set<string>();
  let count = 0;
  for (const inj of injections) {
    if (count >= 5) break;
    if (inj.site !== lastUsed && !recentSet.has(inj.site)) {
      recentSet.add(inj.site);
      count++;
    }
  }

  const handleSelect = (name: string) => {
    onSelect(name);
    setTimeout(onClose, 180);
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
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="text-[17px] font-bold leading-tight">Select Injection Site</h2>
            <p className="text-[12px] text-muted-foreground/60 mt-0.5">Tap a location on the body map</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Orientation labels */}
        <div className="flex justify-between px-6 pb-1">
          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">← Your Right</span>
          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Your Left →</span>
        </div>

        {/* Body map */}
        <div className="flex-1 overflow-hidden px-4 pb-2" style={{ minHeight: 0 }}>
          <div
            className="relative mx-auto"
            style={{
              width: "100%",
              maxWidth: 240,
              aspectRatio: "200 / 410",
            }}
          >
            <BodyOutlineSVG />

            {SITE_POINTS.map((site) => {
              const state = getSiteState(site.name, selected, lastUsed, recentSet);
              return (
                <Hotspot
                  key={site.name}
                  site={site}
                  state={state}
                  onClick={() => handleSelect(site.name)}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 px-5 py-2.5 border-t border-border/40">
          <LegendItem color="bg-primary" label="Selected" />
          <LegendItem color="bg-orange-500" label="Last Used" />
          <LegendItem color="bg-transparent border-2 border-slate-400" label="Recent" />
        </div>

        {/* Last logged site footer */}
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

        {/* Selected site display */}
        {selected && (
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
