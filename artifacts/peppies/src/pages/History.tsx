import { Clock } from "lucide-react";

export function History() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
          <Clock size={24} />
        </div>
        <h2 className="text-2xl font-bold">Injection History</h2>
      </div>

      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
