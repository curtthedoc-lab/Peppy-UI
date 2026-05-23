import { PenLine, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Log() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
        <PenLine size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Log an Injection</h2>
      <p className="text-muted-foreground mb-8 max-w-[250px]">
        Injection logging form coming soon.
      </p>
      
      <Button size="icon" className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow" data-testid="button-log-injection">
        <Plus size={32} />
      </Button>
    </div>
  );
}
