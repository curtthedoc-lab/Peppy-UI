import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Droplet, Syringe, Clock, Trash2 } from "lucide-react";
import { useCalculations, Calculation } from "@/hooks/useCalculations";

const schema = z.object({
  vialMg: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be > 0"),
  bacMl: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be > 0"),
  doseMcg: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be > 0"),
});

type FormData = z.infer<typeof schema>;

function NumInput({
  label,
  unit,
  placeholder,
  error,
  testId,
  ...props
}: {
  label: string;
  unit: string;
  placeholder: string;
  error?: string;
  testId: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground/70 tracking-widest uppercase px-1">
        {label}
      </label>
      <div className={`flex items-center bg-card border rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/40 ${error ? "border-destructive" : "border-border/60"}`}>
        <input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          data-testid={testId}
          className="flex-1 bg-transparent px-4 py-3.5 text-[15px] font-medium outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          {...props}
        />
        <span className="px-4 text-[13px] font-semibold text-muted-foreground/60 border-l border-border/40 py-3.5 bg-muted/30">
          {unit}
        </span>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[12px] text-destructive px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ result }: { result: { mlRequired: number; syringeUnits: number } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="bg-primary/8 border border-primary/20 rounded-3xl p-5 flex gap-4"
    >
      <div className="flex-1 flex flex-col items-center gap-1.5 border-r border-primary/15 pr-4">
        <div className="w-9 h-9 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
          <Droplet size={17} strokeWidth={2} />
        </div>
        <p className="text-[11px] font-semibold text-muted-foreground/70 tracking-widest uppercase mt-1">
          mL Required
        </p>
        <p className="text-[32px] font-bold tracking-[-0.03em] text-primary leading-none">
          {result.mlRequired.toFixed(3)}
        </p>
        <p className="text-[12px] text-muted-foreground/60">millilitres</p>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1.5 pl-4">
        <div className="w-9 h-9 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
          <Syringe size={17} strokeWidth={2} />
        </div>
        <p className="text-[11px] font-semibold text-muted-foreground/70 tracking-widest uppercase mt-1">
          Syringe Units
        </p>
        <p className="text-[32px] font-bold tracking-[-0.03em] text-primary leading-none">
          {result.syringeUnits.toFixed(1)}
        </p>
        <p className="text-[12px] text-muted-foreground/60">U-100 units</p>
      </div>
    </motion.div>
  );
}

function HistoryRow({ calc }: { calc: Calculation }) {
  const timeAgo = (() => {
    const diffH = Math.floor((Date.now() - new Date(calc.date).getTime()) / (1000 * 60 * 60));
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const d = Math.floor(diffH / 24);
    return d === 1 ? "Yesterday" : `${d}d ago`;
  })();

  return (
    <div className="flex items-center justify-between py-3 border-t border-border/40 first:border-t-0" data-testid={`calc-history-${calc.id}`}>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold">
          {calc.doseMcg} mcg
          <span className="text-muted-foreground/60 font-normal"> · {calc.vialMg} mg vial · {calc.bacMl} mL BAC</span>
        </p>
        <p className="text-[12px] text-primary/80 mt-0.5">
          {calc.mlRequired.toFixed(3)} mL · {calc.syringeUnits.toFixed(1)} units
        </p>
      </div>
      <span className="text-[11px] text-muted-foreground/50 flex-shrink-0 ml-3">{timeAgo}</span>
    </div>
  );
}

export function Calculator() {
  const { calculations, addCalculation, clearCalculations } = useCalculations();
  const [result, setResult] = useState<{ mlRequired: number; syringeUnits: number } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { vialMg: "", bacMl: "", doseMcg: "" },
  });

  const onSubmit = (data: FormData) => {
    const vialMcg = Number(data.vialMg) * 1000;
    const concentration = vialMcg / Number(data.bacMl);
    const mlRequired = Number(data.doseMcg) / concentration;
    const syringeUnits = mlRequired * 100;

    const calc = { mlRequired, syringeUnits, vialMg: Number(data.vialMg), bacMl: Number(data.bacMl), doseMcg: Number(data.doseMcg) };
    setResult(calc);
    addCalculation(calc);
  };

  return (
    <div className="flex flex-col px-5 pt-14 pb-6">
      <header className="mb-8">
        <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide uppercase mb-1">
          Tools
        </p>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-none">
          Reconstitution Calculator
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <NumInput
          label="Vial Amount"
          unit="mg"
          placeholder="e.g. 5"
          testId="input-vial-mg"
          error={errors.vialMg?.message}
          {...register("vialMg")}
        />
        <NumInput
          label="BAC Water"
          unit="mL"
          placeholder="e.g. 2"
          testId="input-bac-ml"
          error={errors.bacMl?.message}
          {...register("bacMl")}
        />
        <NumInput
          label="Desired Dose"
          unit="mcg"
          placeholder="e.g. 250"
          testId="input-dose-mcg"
          error={errors.doseMcg?.message}
          {...register("doseMcg")}
        />

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          data-testid="button-calculate"
          className="w-full mt-1 bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/25 active:shadow-primary/10 transition-shadow tracking-wide"
        >
          Calculate
        </motion.button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <ResultCard result={result} />
            <p className="text-center text-[11px] text-muted-foreground/50 mt-3">
              Based on a U-100 insulin syringe (100 units = 1 mL)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {calculations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground/70">
              <Clock size={14} strokeWidth={2} />
              <span className="text-[12px] font-semibold tracking-wide uppercase">Recent</span>
            </div>
            <button
              onClick={clearCalculations}
              data-testid="button-clear-history"
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <Trash2 size={12} strokeWidth={2} />
              Clear
            </button>
          </div>
          <div className="bg-card rounded-3xl border border-border/60 px-4">
            {calculations.map((calc) => (
              <HistoryRow key={calc.id} calc={calc} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
