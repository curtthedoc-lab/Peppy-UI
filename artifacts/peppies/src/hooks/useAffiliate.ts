import { useState, useCallback, useEffect } from "react";

export interface PersonalLink {
  name: string;
  url: string;
}

export interface Affiliate {
  name: string;
  code: string;
  url: string;
  shareCount: number;
  personal: PersonalLink;
  dashboard: PersonalLink;
}

const STORAGE_KEY = "peppies_affiliate";
const EVENT = "peppies_affiliate_changed";

const EMPTY_PERSONAL: PersonalLink = { name: "", url: "" };
const EMPTY: Affiliate = {
  name: "",
  code: "",
  url: "",
  shareCount: 0,
  personal: EMPTY_PERSONAL,
  dashboard: EMPTY_PERSONAL,
};

function load(): Affiliate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Affiliate> & {
      personal?: Partial<PersonalLink>;
      dashboard?: Partial<PersonalLink>;
    };
    const count =
      typeof parsed.shareCount === "number" && isFinite(parsed.shareCount) && parsed.shareCount >= 0
        ? Math.floor(parsed.shareCount)
        : 0;
    const personal: PersonalLink = {
      name: typeof parsed.personal?.name === "string" ? parsed.personal.name : "",
      url: typeof parsed.personal?.url === "string" ? parsed.personal.url : "",
    };
    const dashboard: PersonalLink = {
      name: typeof parsed.dashboard?.name === "string" ? parsed.dashboard.name : "",
      url: typeof parsed.dashboard?.url === "string" ? parsed.dashboard.url : "",
    };
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      code: typeof parsed.code === "string" ? parsed.code : "",
      url: typeof parsed.url === "string" ? parsed.url : "",
      shareCount: count,
      personal,
      dashboard,
    };
  } catch {
    return EMPTY;
  }
}

function save(a: Affiliate) {
  // Treat as "no record" only when EVERYTHING is empty.
  const hasAnything =
    a.name ||
    a.code ||
    a.url ||
    a.shareCount ||
    a.personal.name ||
    a.personal.url ||
    a.dashboard.name ||
    a.dashboard.url;
  if (!hasAnything) {
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
          personal: prev.personal,
          dashboard: prev.dashboard,
        };
        save(cleaned);
        return cleaned;
      });
    },
    []
  );

  const setPersonal = useCallback((next: PersonalLink) => {
    setAffiliate((prev) => {
      const cleaned: Affiliate = {
        ...prev,
        personal: {
          name: next.name.trim(),
          url: next.url.trim() ? normalizeUrl(next.url) : "",
        },
      };
      save(cleaned);
      return cleaned;
    });
  }, []);

  const clearPersonal = useCallback(() => {
    setAffiliate((prev) => {
      const next: Affiliate = { ...prev, personal: EMPTY_PERSONAL };
      save(next);
      return next;
    });
  }, []);

  const setDashboard = useCallback((next: PersonalLink) => {
    setAffiliate((prev) => {
      const cleaned: Affiliate = {
        ...prev,
        dashboard: {
          name: next.name.trim(),
          url: next.url.trim() ? normalizeUrl(next.url) : "",
        },
      };
      save(cleaned);
      return cleaned;
    });
  }, []);

  const clearDashboard = useCallback(() => {
    setAffiliate((prev) => {
      const next: Affiliate = { ...prev, dashboard: EMPTY_PERSONAL };
      save(next);
      return next;
    });
  }, []);

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
  const hasPersonal = !!affiliate.personal.url;
  const hasDashboard = !!affiliate.dashboard.url;

  return {
    affiliate,
    hasAffiliate,
    hasPersonal,
    hasDashboard,
    personal: affiliate.personal,
    dashboard: affiliate.dashboard,
    shareCount: affiliate.shareCount,
    setAffiliate: setAndSave,
    setPersonal,
    clearPersonal,
    setDashboard,
    clearDashboard,
    bumpShareCount,
    resetShareCount,
    clear,
  };
}
