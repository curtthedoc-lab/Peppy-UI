import type { Affiliate } from "@/hooks/useAffiliate";
import { isValidUrl, normalizeUrl } from "@/hooks/useAffiliate";

export interface IncomingReferral {
  name: string;
  code: string;
  url: string;
}

const QUERY_KEYS = ["ref", "code", "url", "name", "aff", "affiliate"];

// Parse a referral from the current URL's query string. Supports:
//   ?ref=CODE
//   ?ref=CODE&url=https://...&name=Jon%20Doe
//   ?code=CODE&aff=https://...
// Returns null if nothing usable found.
export function parseReferralFromUrl(search: string = window.location.search): IncomingReferral | null {
  if (!search) return null;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return null;
  }

  const code = (params.get("ref") || params.get("code") || "").trim();
  const rawUrl = (params.get("url") || params.get("aff") || params.get("affiliate") || "").trim();
  const name = (params.get("name") || "").trim();

  if (!code && !rawUrl) return null;

  const url = rawUrl ? (isValidUrl(rawUrl) ? normalizeUrl(rawUrl) : "") : "";
  // If the only thing provided was an invalid URL with no code, drop it
  if (!code && !url) return null;

  return { name, code, url };
}

// Remove our query keys from the URL bar without reloading the page.
export function clearReferralFromUrl() {
  try {
    const url = new URL(window.location.href);
    let changed = false;
    for (const k of QUERY_KEYS) {
      if (url.searchParams.has(k)) {
        url.searchParams.delete(k);
        changed = true;
      }
    }
    if (changed) {
      const newUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") + url.hash;
      window.history.replaceState({}, "", newUrl);
    }
  } catch {
    // ignore
  }
}

// Build a shareable Peppies link that pre-fills another user's onboarding with this affiliate.
// Base URL = current origin + app base path (e.g. https://peppies.replit.app/).
export function buildReferralLink(affiliate: Affiliate): string {
  const origin = window.location.origin;
  // Vite's BASE_URL is something like "/peppies/" or "/". Always ends with a slash in our setup.
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const params = new URLSearchParams();
  if (affiliate.code) params.set("ref", affiliate.code);
  if (affiliate.url) params.set("url", affiliate.url);
  if (affiliate.name) params.set("name", affiliate.name);
  const qs = params.toString();
  return `${origin}${base}/${qs ? `?${qs}` : ""}`;
}

// Build a natural-sounding message for sharing.
export function buildShareMessage(affiliate: Affiliate, link: string): string {
  const parts: string[] = [];
  parts.push("I've been using Peppies to track my peptide protocol — it's clean, dark-mode, and works offline on your phone.");
  if (affiliate.code || affiliate.url) {
    const who = affiliate.name ? `${affiliate.name}'s` : "my";
    if (affiliate.code && affiliate.url) {
      parts.push(`Use ${who} referral code ${affiliate.code} at ${affiliate.url} when you order.`);
    } else if (affiliate.code) {
      parts.push(`Use ${who} referral code ${affiliate.code} when you order.`);
    } else if (affiliate.url) {
      parts.push(`Use ${who} vendor link: ${affiliate.url}`);
    }
  }
  parts.push(`Open Peppies (referral auto-fills): ${link}`);
  return parts.join("\n\n");
}
