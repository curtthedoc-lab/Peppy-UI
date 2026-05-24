export function peptideInitials(name: string): string {
  const cleaned = name.replace(/\([^)]*\)/g, " ");
  const tokens = cleaned
    .split(/[-\s+/]+/)
    .map((t) => t.replace(/[^A-Za-z]/g, ""))
    .filter((t) => t.length > 0);
  if (tokens.length === 0) {
    const letters = name.replace(/[^A-Za-z]/g, "");
    return (letters.slice(0, 2) || "?").toUpperCase();
  }
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

export function shortPeptideName(name: string, maxLen = 10): string {
  if (name.length <= maxLen) return name;
  const withoutParens = name.replace(/\s*\([^)]*\)/g, "").trim();
  if (withoutParens && withoutParens.length <= maxLen) return withoutParens;
  const base = withoutParens || name;
  if (base.length <= maxLen) return base;
  return base.slice(0, maxLen - 1).trimEnd() + "…";
}
