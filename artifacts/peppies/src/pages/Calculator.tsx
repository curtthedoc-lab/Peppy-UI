import { Calculator as CalculatorIcon } from "lucide-react";

export function Calculator() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
        <CalculatorIcon size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Dosage Calculator</h2>
      <p className="text-muted-foreground max-w-[250px]">
        Calculator coming soon.
      </p>
    </div>
  );
}
