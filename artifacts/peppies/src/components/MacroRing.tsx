import { motion } from "framer-motion";

interface MacroRingProps {
  value: number;
  goal: number;
  label: string;
  unit?: string;
  color: string;
  size?: number;
}

export function MacroRing({
  value,
  goal,
  label,
  unit = "g",
  color,
  size = 78,
}: MacroRingProps) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const ratio = goal > 0 ? Math.min(value / goal, 1) : 0;
  const offset = circ * (1 - ratio);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted/40"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[14px] font-bold leading-none tracking-[-0.02em]">
            {Math.round(value)}
          </span>
          <span className="text-[9px] text-muted-foreground/60 leading-none mt-0.5">
            / {Math.round(goal)}{unit}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        {label}
      </span>
    </div>
  );
}
