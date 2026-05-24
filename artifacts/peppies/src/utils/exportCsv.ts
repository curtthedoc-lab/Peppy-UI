import { Injection } from "@/hooks/useInjections";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportInjectionsAsCsv(injections: Injection[]): void {
  if (injections.length === 0) return;

  const headers = ["Date", "Time", "Peptide", "Dose", "Units", "Injection Site", "Notes"];

  const rows = injections.map((inj) => {
    const d = new Date(inj.date);
    const date = d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return [date, time, inj.peptide, inj.dose, inj.units, inj.site, inj.notes ?? ""].map(escapeCsv).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `peppies-injections-${today}.csv`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
