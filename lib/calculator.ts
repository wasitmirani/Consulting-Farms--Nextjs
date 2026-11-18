/**
 * Cost calculator — pure functions + ASSUMPTIONS.
 *
 * ⚠️  All rates below are INDICATIVE placeholders in AED for the UAE market.
 *     The business should review and adjust them before launch. Every number
 *     the visitor sees is derived from this file only, and the UI always labels
 *     results as an estimate, not a quotation.
 */

import { formatMoney, FALLBACK_RATES, type CurrencyCode, type Rates } from "./currency";

export const CURRENCY = "AED";

export type Range = [number, number];

/* ------------------------------------------------------------------ */
/*  Mushroom farm                                                      */
/* ------------------------------------------------------------------ */

export const mushroomOptions = {
  crop: {
    oyster: { label: "Oyster", note: "Bag cultivation on straw-based substrate", factor: 1, yieldKgPerM2Month: [3, 6] as Range },
    button: { label: "Button", note: "Compost & casing beds, cooler rooms", factor: 1.18, yieldKgPerM2Month: [4, 8] as Range },
    specialty: { label: "Specialty", note: "Golden, pink, king oyster & more", factor: 1.1, yieldKgPerM2Month: [2, 4] as Range },
  },
  level: {
    basic: { label: "Basic", note: "Converted room, manual misting & fans", perM2: [350, 650] as Range, opexPerM2: [20, 35] as Range },
    standard: { label: "Standard", note: "Insulated panels, racks, humidifiers, ventilation", perM2: [700, 1200] as Range, opexPerM2: [28, 48] as Range },
    climate: { label: "Climate-controlled", note: "HVAC, CO₂ & humidity control, automation", perM2: [1400, 2400] as Range, opexPerM2: [40, 70] as Range },
  },
  addOns: {
    warehouse: { label: "Planting warehouse", note: "Substrate prep, bagging & spawning area", fixed: [20000, 55000] as Range },
    cold: { label: "Cold store", note: "Chilled holding before dispatch", fixed: [25000, 60000] as Range },
    lab: { label: "Spawn / clean area", note: "Clean room for spawning & sterile work", fixed: [15000, 40000] as Range },
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Greenhouse                                                         */
/* ------------------------------------------------------------------ */

export const greenhouseOptions = {
  structure: {
    tunnel: { label: "Poly tunnel", note: "Single-span film tunnel", perM2: [60, 120] as Range },
    multispan: { label: "Multi-span poly", note: "Gutter-connected, roof vents", perM2: [120, 220] as Range },
    glass: { label: "Glass (Venlo)", note: "Glass roof, high light, long life", perM2: [300, 550] as Range },
  },
  cooling: {
    natural: { label: "Natural ventilation", note: "Vents & shade only", perM2: [0, 0] as Range, opexPerM2: [3, 6] as Range },
    padfan: { label: "Fan & pad cooling", note: "Evaporative cooling — common in the UAE", perM2: [60, 120] as Range, opexPerM2: [6, 12] as Range },
    full: { label: "Full climate control", note: "Cooling, heating, CO₂ & sensors", perM2: [200, 400] as Range, opexPerM2: [12, 22] as Range },
  },
  growing: {
    soil: { label: "Soil + drip", note: "Beds with drip irrigation & fertigation", perM2: [15, 30] as Range },
    substrate: { label: "Substrate + drip", note: "Coco/rockwool slabs with fertigation", perM2: [35, 65] as Range },
    hydro: { label: "Hydroponic (NFT / vertical)", note: "Channels or vertical racks, recirculating", perM2: [120, 250] as Range },
  },
  addOns: {
    shade: { label: "Shade / thermal screen", note: "Retractable screen system", perM2: [20, 45] as Range },
    automation: { label: "Climate computer & sensors", note: "Automated control & monitoring", fixed: [18000, 45000] as Range },
    water: { label: "Water tank & RO treatment", note: "Storage + reverse osmosis", fixed: [12000, 35000] as Range },
  },
} as const;

/** Consulting support packages (shared). */
export const consultingOptions = {
  none: { label: "No consulting", note: "Estimate only", fixed: [0, 0] as Range },
  advisory: { label: "Advisory", note: "Design review & remote guidance", fixed: [5000, 12000] as Range },
  turnkey: { label: "Full project support", note: "Design, setup supervision & training", fixed: [18000, 45000] as Range },
} as const;

/* ------------------------------------------------------------------ */

export type MushroomInput = {
  area: number;
  crop: keyof typeof mushroomOptions.crop;
  level: keyof typeof mushroomOptions.level;
  tiers: number;
  addOns: (keyof typeof mushroomOptions.addOns)[];
  consulting: keyof typeof consultingOptions;
};

export type GreenhouseInput = {
  area: number;
  structure: keyof typeof greenhouseOptions.structure;
  cooling: keyof typeof greenhouseOptions.cooling;
  growing: keyof typeof greenhouseOptions.growing;
  addOns: (keyof typeof greenhouseOptions.addOns)[];
  consulting: keyof typeof consultingOptions;
};

export type LineItem = { label: string; range: Range };
export type Estimate = {
  setup: Range;
  monthly: Range;
  capacity?: { label: string; range: Range; unit: string };
  lines: LineItem[];
};

const mul = (r: Range, k: number): Range => [r[0] * k, r[1] * k];
const add = (a: Range, b: Range): Range => [a[0] + b[0], a[1] + b[1]];
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const tidy = (r: Range): Range => [roundTo(r[0], 500), roundTo(r[1], 500)];

export function estimateMushroom(i: MushroomInput): Estimate {
  const crop = mushroomOptions.crop[i.crop];
  const level = mushroomOptions.level[i.level];
  const lines: LineItem[] = [];

  // Racking adds cost per extra tier (about 12% of the room build per tier above 1)
  const tierFactor = 1 + Math.max(0, i.tiers - 1) * 0.12;
  const rooms = mul(level.perM2, i.area * crop.factor * tierFactor);
  lines.push({ label: `Grow rooms · ${level.label} (${i.area} m², ${i.tiers} tiers)`, range: rooms });

  i.addOns.forEach((k) => {
    const a = mushroomOptions.addOns[k];
    lines.push({ label: a.label, range: a.fixed });
  });
  const c = consultingOptions[i.consulting];
  if (i.consulting !== "none") lines.push({ label: `Consulting · ${c.label}`, range: c.fixed });

  const setup = tidy(lines.reduce<Range>((s, l) => add(s, l.range), [0, 0]));
  const monthly = tidy(mul(level.opexPerM2, i.area * Math.max(1, i.tiers * 0.6)));
  const capacity = {
    label: `${crop.label} mushrooms`,
    range: [Math.round(crop.yieldKgPerM2Month[0] * i.area * i.tiers * 0.7), Math.round(crop.yieldKgPerM2Month[1] * i.area * i.tiers * 0.7)] as Range,
    unit: "kg / month",
  };
  return { setup, monthly, capacity, lines: lines.map((l) => ({ ...l, range: tidy(l.range) })) };
}

export function estimateGreenhouse(i: GreenhouseInput): Estimate {
  const s = greenhouseOptions.structure[i.structure];
  const cool = greenhouseOptions.cooling[i.cooling];
  const grow = greenhouseOptions.growing[i.growing];
  const lines: LineItem[] = [
    { label: `Structure · ${s.label} (${i.area} m²)`, range: mul(s.perM2, i.area) },
  ];
  if (i.cooling !== "natural") lines.push({ label: `Cooling · ${cool.label}`, range: mul(cool.perM2, i.area) });
  lines.push({ label: `Growing system · ${grow.label}`, range: mul(grow.perM2, i.area) });
  i.addOns.forEach((k) => {
    const a = greenhouseOptions.addOns[k];
    lines.push({ label: a.label, range: "perM2" in a ? mul(a.perM2, i.area) : a.fixed });
  });
  const c = consultingOptions[i.consulting];
  if (i.consulting !== "none") lines.push({ label: `Consulting · ${c.label}`, range: c.fixed });

  const setup = tidy(lines.reduce<Range>((acc, l) => add(acc, l.range), [0, 0]));
  const monthly = tidy(mul(cool.opexPerM2, i.area));
  return { setup, monthly, lines: lines.map((l) => ({ ...l, range: tidy(l.range) })) };
}

export const formatAED = (n: number) => formatMoney(n, "AED");

export const formatRange = (r: Range, code: CurrencyCode = "AED", rates: Rates = FALLBACK_RATES) =>
  r[0] === r[1] ? formatMoney(r[0], code, rates) : `${formatMoney(r[0], code, rates)} – ${formatMoney(r[1], code, rates)}`;

/** Plain-text summary used in the lead email + enquiry message. */
export function summarizeEstimate(
  kind: "mushroom" | "greenhouse",
  input: MushroomInput | GreenhouseInput,
  e: Estimate,
  code: CurrencyCode = "AED",
  rates: Rates = FALLBACK_RATES,
) {
  const both = (r: Range) => (code === "AED" ? formatRange(r) : `${formatRange(r, code, rates)}  (≈ ${formatRange(r)})`);
  const lines = [
    `Calculator: ${kind === "mushroom" ? "Mushroom farm" : "Greenhouse"} setup`,
    `Visitor currency: ${code}${code !== "AED" ? ` (rate 1 AED = ${rates.rates[code]} ${code}, ${rates.updated})` : ""}`,
    `Area: ${input.area} m²`,
    ...Object.entries(input)
      .filter(([k]) => k !== "area")
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") || "none" : v}`),
    `Estimated setup: ${both(e.setup)}`,
    `Estimated running cost: ${both(e.monthly)} / month`,
    ...(e.capacity ? [`Indicative capacity: ${e.capacity.range[0]}–${e.capacity.range[1]} ${e.capacity.unit}`] : []),
  ];
  return lines.join("\n");
}
