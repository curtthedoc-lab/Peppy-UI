import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useInjections } from "@/hooks/useInjections";

const PEPTIDES = [
  "BPC-157",
  "TB-500",
  "Wolverine",
  "Tirzepatide",
  "MOTS-C",
  "GHK-Cu",
  "Semax",
  "Selank",
  "KPV",
  "PT-141",
  "Melanotan II",
];

const UNITS = ["mcg", "mg", "IU", "units"];

const SITES = [
  "Abdomen",
  "Left Thigh",
  "Right Thigh",
  "Left Deltoid",
  "Right Deltoid",
  "Left Glute",
  "Right Glute",
];

const schema = z.object({
  peptide: z.string().min(1, "Select a peptide"),
  dose: z.string().min(1, "Enter a dose").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Enter a valid dose"),
  units: z.string().min(1, "Select units"),
  site: z.string().min(1, "Select an injection site"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
  testId,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  testId: string;
  error?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className={`w-full appearance-none bg-card border rounded-2xl px-4 py-3.5 text-[14px] font-medium pr-10 outline-none focus:ring-2 focus:ring-primary/40 transition-all ${
          value ? "text-foreground" : "text-muted-foreground"
        } ${error ? "border-destructive" : "border-border/60"}`}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-card text-foreground">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground/70 tracking-widest uppercase px-1">
        {label}
      </label>
      {children}
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

export function Log() {
  const { addInjection } = useInjections();
  const [saved, setSaved] = useState(false);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { peptide: "", dose: "", units: "", site: "", notes: "" },
  });

  const onSubmit = (data: FormData) => {
    addInjection({
      peptide: data.peptide,
      dose: data.dose,
      units: data.units,
      site: data.site,
      notes: data.notes ?? "",
    });
    setSaved(true);
    reset();
    setTimeout(() => setSaved(false), 2800);
  };

  return (
    <div className="flex flex-col px-5 pt-14 pb-6">
      <header className="mb-8">
        <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide uppercase mb-1">
          Injections
        </p>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-none">
          Log Injection
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="flex flex-col items-center justify-center py-20 gap-5 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center text-primary">
              <CheckCircle2 size={38} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold mb-1">Injection Logged</h2>
              <p className="text-[13px] text-muted-foreground">Saved to your history.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
          >
            <Field label="Peptide" error={errors.peptide?.message}>
              <Controller
                name="peptide"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={PEPTIDES}
                    placeholder="Select peptide"
                    testId="select-peptide"
                    error={errors.peptide?.message}
                  />
                )}
              />
            </Field>

            <div className="flex gap-3">
              <div className="flex-1">
                <Field label="Dose" error={errors.dose?.message}>
                  <input
                    {...register("dose")}
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    data-testid="input-dose"
                    className={`w-full bg-card border rounded-2xl px-4 py-3.5 text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.dose ? "border-destructive" : "border-border/60"
                    }`}
                  />
                </Field>
              </div>
              <div className="w-28">
                <Field label="Units" error={errors.units?.message}>
                  <Controller
                    name="units"
                    control={control}
                    render={({ field }) => (
                      <NativeSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={UNITS}
                        placeholder="Unit"
                        testId="select-units"
                        error={errors.units?.message}
                      />
                    )}
                  />
                </Field>
              </div>
            </div>

            <Field label="Injection Site" error={errors.site?.message}>
              <Controller
                name="site"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={SITES}
                    placeholder="Select site"
                    testId="select-site"
                    error={errors.site?.message}
                  />
                )}
              />
            </Field>

            <Field label="Notes (optional)">
              <textarea
                {...register("notes")}
                placeholder="Any additional notes..."
                rows={3}
                data-testid="input-notes"
                className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3.5 text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 resize-none leading-relaxed"
              />
            </Field>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              data-testid="button-save-injection"
              className="w-full mt-2 bg-primary text-primary-foreground font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/25 active:shadow-primary/10 transition-shadow disabled:opacity-60 tracking-wide"
            >
              Save Injection
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
