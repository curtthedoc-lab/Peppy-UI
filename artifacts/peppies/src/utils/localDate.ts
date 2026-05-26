// All "day" calculations in Peppies use the user's *local* timezone so that
// "today" matches the user's wall clock, not UTC. Using UTC caused entries
// logged in the evening (US timezones) to silently roll over to the next day
// and disappear from the "Today" view.
//
// Returns a YYYY-MM-DD key in local time.
export function localDayKey(input?: Date | string | number): string {
  const d = input == null ? new Date() : new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Local-day key for "N days ago" — convenient for yesterday calculations.
export function localDayKeyOffset(daysAgo: number, from?: Date): string {
  const base = from ? new Date(from) : new Date();
  base.setDate(base.getDate() - daysAgo);
  return localDayKey(base);
}
