const BACKUP_KEYS = [
  "peppies_injections",
  "peppies_calculations",
  "peppies_cycles",
  "peppies_weight",
  "peppies_hydration",
] as const;

const SCHEMA_VERSION = 1;
const APP = "peppies";

export interface BackupFile {
  app: typeof APP;
  schemaVersion: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function exportBackupAsJson(): { entryCount: number } {
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw == null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }

  const backup: BackupFile = {
    app: APP,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `peppies-backup-${today}.json`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const injections = Array.isArray(data["peppies_injections"])
    ? (data["peppies_injections"] as unknown[]).length
    : 0;
  return { entryCount: injections };
}

export async function parseBackupFile(file: File): Promise<BackupFile> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as BackupFile).app !== APP ||
    typeof (parsed as BackupFile).schemaVersion !== "number" ||
    typeof (parsed as BackupFile).data !== "object"
  ) {
    throw new Error("This doesn't look like a Peppies backup file.");
  }
  if ((parsed as BackupFile).schemaVersion > SCHEMA_VERSION) {
    throw new Error(
      "Backup was created with a newer version of Peppies than this device supports.",
    );
  }
  return parsed as BackupFile;
}

export function applyBackup(backup: BackupFile): { restored: string[] } {
  const restored: string[] = [];
  for (const key of BACKUP_KEYS) {
    const value = backup.data[key];
    if (value === undefined) continue;
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
    restored.push(key);
  }
  return { restored };
}

export function summarizeBackup(backup: BackupFile): {
  injections: number;
  calculations: number;
  cycles: number;
  exportedAt: string;
} {
  const arr = (v: unknown) => (Array.isArray(v) ? v.length : 0);
  return {
    injections: arr(backup.data["peppies_injections"]),
    calculations: arr(backup.data["peppies_calculations"]),
    cycles: arr(backup.data["peppies_cycles"]),
    exportedAt: backup.exportedAt,
  };
}
