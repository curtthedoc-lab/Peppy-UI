import { motion } from "framer-motion";
import { User, Bell, Scale, Moon, Info, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase px-1 mb-2 mt-6 first:mt-0">
      {label}
    </p>
  );
}

function Row({
  icon: Icon,
  label,
  sublabel,
  right,
  testId,
  teal,
}: {
  icon: typeof User;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  testId: string;
  teal?: boolean;
}) {
  return (
    <motion.div
      variants={rowVariants}
      className="bg-card rounded-2xl px-4 py-3.5 border border-border/60 flex items-center gap-3.5 active:scale-[0.985] transition-transform cursor-pointer"
      data-testid={testId}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${teal ? "bg-primary/12 text-primary" : "bg-muted text-foreground/70"}`}>
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium leading-tight">{label}</p>
        {sublabel && <p className="text-[12px] text-muted-foreground/70 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex-shrink-0">
        {right ?? <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />}
      </div>
    </motion.div>
  );
}

export function Settings() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      <header className="mb-8">
        <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide uppercase mb-1">
          Preferences
        </p>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-none">
          Settings
        </h1>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col">
        <SectionLabel label="Account" />
        <div className="flex flex-col gap-2 mb-2">
          <Row
            icon={User}
            label="Profile"
            sublabel="Manage your information"
            teal
            testId="settings-profile"
          />
        </div>

        <SectionLabel label="Preferences" />
        <div className="flex flex-col gap-2 mb-2">
          <Row
            icon={Bell}
            label="Notifications"
            sublabel="Reminders and alerts"
            testId="settings-notifications"
            right={<Switch checked={true} className="scale-90" />}
          />
          <Row
            icon={Scale}
            label="Units"
            sublabel="Weight and measurement"
            testId="settings-units"
            right={
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-muted-foreground font-medium">kg</span>
                <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />
              </div>
            }
          />
          <Row
            icon={Moon}
            label="Theme"
            sublabel="Appearance"
            testId="settings-theme"
            right={
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-muted-foreground font-medium">Dark</span>
                <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />
              </div>
            }
          />
        </div>

        <SectionLabel label="Support" />
        <div className="flex flex-col gap-2">
          <Row
            icon={Info}
            label="About Peppies"
            sublabel="Version 1.0.0"
            testId="settings-about"
          />
        </div>
      </motion.div>
    </div>
  );
}
