import { useState, useCallback, useEffect } from "react";

export interface Affiliate {
  name: string;
  code: string;
  url: string;
  shareCount: number;
}

const STORAGE_KEY = "peppies_affiliate";
const EVENT = "peppies_affiliate_changed";

const EMPTY: Affiliate = { name: "", code: "", url: "", shareCount: 0 };

function load(): Affiliate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Affiliate>;
    const count =
      typeof parsed.shareCount === "number" && isFinite(parsed.shareCount) && parsed.shareCount >= 0
        ? Math.floor(parsed.shareCount)
        : 0;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      code: typeof parsed.code === "string" ? parsed.code : "",
      url: typeof parsed.url === "string" ? parsed.url : "",
      shareCount: count,
    };
  } catch {
    return EMPTY;
  }
}

function save(a: Affiliate) {
  // Treat as "no record" only when affiliate info AND counter are all zero.
  if (!a.name && !a.code && !a.url && !a.shareCount) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Ensure URL starts with http:// or https://; prepend https if user typed bare domain
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(input: string): boolean {
  const normalized = normalizeUrl(input);
  if (!normalized) return false;
  try {
    const u = new URL(normalized);
    return u.hostname.includes(".") && u.hostname.length > 3;
  } catch {
    return false;
  }
}

export function useAffiliate() {
  const [affiliate, setAffiliate] = useState<Affiliate>(load);

  useEffect(() => {
    const onChange = () => setAffiliate(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setAndSave = useCallback(
    (next: { name: string; code: string; url: string; shareCount?: number }) => {
      setAffiliate((prev) => {
        const cleaned: Affiliate = {
          name: next.name.trim(),
          code: next.code.trim(),
          url: next.url.trim() ? normalizeUrl(next.url) : "",
          shareCount: typeof next.shareCount === "number" ? next.shareCount : prev.shareCount,
        };
        save(cleaned);
        return cleaned;
      });
    },
    []
  );

  const bumpShareCount = useCallback(() => {
    setAffiliate((prev) => {
      const next: Affiliate = { ...prev, shareCount: (prev.shareCount ?? 0) + 1 };
      save(next);
      return next;
    });
  }, []);

  const resetShareCount = useCallback(() => {
    setAffiliate((prev) => {
      const next: Affiliate = { ...prev, shareCount: 0 };
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setAffiliate(EMPTY);
    save(EMPTY);
  }, []);

  const hasAffiliate = !!affiliate.url;

  return {
    affiliate,
    hasAffiliate,
    shareCount: affiliate.shareCount,
    setAffiliate: setAndSave,
    bumpShareCount,
    resetShareCount,
    clear,
  };
}
