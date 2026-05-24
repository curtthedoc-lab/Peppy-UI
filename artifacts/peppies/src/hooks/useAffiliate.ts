import { useState, useCallback, useEffect } from "react";

export interface Affiliate {
  name: string;
  code: string;
  url: string;
}

const STORAGE_KEY = "peppies_affiliate";
const EVENT = "peppies_affiliate_changed";

const EMPTY: Affiliate = { name: "", code: "", url: "" };

function load(): Affiliate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Affiliate>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      code: typeof parsed.code === "string" ? parsed.code : "",
      url: typeof parsed.url === "string" ? parsed.url : "",
    };
  } catch {
    return EMPTY;
  }
}

function save(a: Affiliate) {
  if (!a.name && !a.code && !a.url) {
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

  const setAndSave = useCallback((next: Affiliate) => {
    const cleaned: Affiliate = {
      name: next.name.trim(),
      code: next.code.trim(),
      url: next.url.trim() ? normalizeUrl(next.url) : "",
    };
    setAffiliate(cleaned);
    save(cleaned);
  }, []);

  const clear = useCallback(() => {
    setAffiliate(EMPTY);
    save(EMPTY);
  }, []);

  const hasAffiliate = !!affiliate.url;

  return { affiliate, hasAffiliate, setAffiliate: setAndSave, clear };
}
