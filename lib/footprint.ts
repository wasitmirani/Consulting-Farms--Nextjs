/**
 * Lead "footprint": where a visitor came from and what they did, attached to
 * every enquiry so the business can see which channels produce leads.
 * Stored only in the visitor's own browser storage until they submit a form.
 */

const KEY = "cf_footprint_v1";
const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];

type Stored = {
  firstSeen: string;
  landingPage: string;
  referrer: string;
  campaign: Record<string, string>;
  pageviews: number;
  pages: string[];
  sessionStart: number;
};

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function write(s: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked — footprint still works for this page */
  }
}

/** Call on every page view. */
export function recordPageview() {
  const url = new URL(window.location.href);
  const campaign: Record<string, string> = {};
  CAMPAIGN_KEYS.forEach((k) => {
    const v = url.searchParams.get(k);
    if (v) campaign[k] = v.slice(0, 120);
  });
  const path = url.pathname + url.hash;
  const prev = read();
  const now = Date.now();
  const s: Stored = prev ?? {
    firstSeen: new Date(now).toISOString(),
    landingPage: url.pathname + url.search,
    referrer: document.referrer || "direct",
    campaign,
    pageviews: 0,
    pages: [],
    sessionStart: now,
  };
  // A new campaign click overrides the stored attribution
  if (prev && Object.keys(campaign).length) s.campaign = campaign;
  s.pageviews += 1;
  s.pages = [...s.pages.filter((p) => p !== path), path].slice(-10);
  write(s);
}

/** Track which sections a visitor actually viewed (lightweight intent signal). */
export function recordSection(id: string) {
  const s = read();
  if (!s) return;
  const tag = `#${id}`;
  if (!s.pages.includes(tag)) {
    s.pages = [...s.pages, tag].slice(-16);
    write(s);
  }
}

export type Footprint = ReturnType<typeof getFootprint>;

export function getFootprint() {
  const s = read();
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  const w = window.innerWidth;
  return {
    landingPage: s?.landingPage ?? location.pathname,
    referrer: s?.referrer ?? (document.referrer || "direct"),
    campaign: s?.campaign ?? {},
    firstSeen: s?.firstSeen ?? new Date().toISOString(),
    pageviews: s?.pageviews ?? 1,
    journey: s?.pages ?? [],
    timeOnSiteSec: s ? Math.round((Date.now() - s.sessionStart) / 1000) : 0,
    submittedFrom: location.pathname + location.hash,
    device: w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop",
    screen: `${screen.width}×${screen.height}`,
    viewport: `${w}×${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection: nav.connection?.effectiveType ?? "",
  };
}
